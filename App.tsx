
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { GamePhase, Player, WheelSegment, WheelSegmentType, PuzzleData, AiSettings, GameMode, DifficultyLevel } from './types';
import { Wheel } from './components/Wheel';
import PuzzleBoard from './components/PuzzleBoard';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { PlayerSidebar } from './components/PlayerSidebar';
import { SetupModal, PuzzleModal, SolveModal } from './components/modals';
import { SettingsModal } from './components/SettingsModal';
import { Fireworks } from './components/Fireworks';
import { Stopwatch } from './components/Stopwatch';
import { TurnOverlay } from './components/TurnOverlay';
import { VOWEL_COST, VOWELS, LETTER_FREQUENCY, ALPHABET } from './constants';
import { loadPuzzleLibrary, savePuzzleLibrary } from './services/puzzleStorage';
import { soundService } from './services/soundService';
import { RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [phase, setPhase] = useState<GamePhase>(GamePhase.SETUP);
  const [gameMode, setGameMode] = useState<GameMode>('STUDENT');
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [puzzle, setPuzzle] = useState<PuzzleData>({ category: '', phrase: '' });
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [spinValue, setSpinValue] = useState<number | 'BANKRUPT' | 'LOSE_TURN' | null>(null);
  const [isWheelSpinning, setIsWheelSpinning] = useState(false);
  const [showWheelFull, setShowWheelFull] = useState(false);
  const [showSolveModal, setShowSolveModal] = useState(false);
  const [systemMessage, setSystemMessage] = useState("Welcome to Fortune Spin!");
  const [showFireworks, setShowFireworks] = useState(false);
  const [showTurnOverlay, setShowTurnOverlay] = useState(false);
  const [playedPuzzleIds, setPlayedPuzzleIds] = useState<string[]>([]);
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [aiSettings, setAiSettings] = useState<AiSettings>({
      googleApiKey: '',
      openAiApiKey: '',
      textProvider: 'google'
  });

  // Timer State
  const [timeLeft, setTimeLeft] = useState(30);

  // Used to force a hard reset of the PuzzleBoard component on new rounds
  const [roundId, setRoundId] = useState(0);
  
  // UI Locking for animations
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Game Rules
  const [vowelsCostMoney, setVowelsCostMoney] = useState(true);

  const computerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Effects ---
  
  // Load Settings
  useEffect(() => {
      const stored = localStorage.getItem('fortune_spin_ai_settings');
      if (stored) {
          try {
              setAiSettings(JSON.parse(stored));
          } catch(e) { console.error(e); }
      } 
  }, []);

  // Timer Logic
  useEffect(() => {
    const currentPlayer = players[currentPlayerIdx];
    const isComputer = currentPlayer?.isComputer;

    const isTimerActive = 
      (phase === GamePhase.GUESSING_LETTER) &&
      !isComputer &&
      !isWheelSpinning &&
      !showWheelFull &&
      !isProcessing &&
      !showSolveModal &&
      !showSettings; 

    if (!isTimerActive) return;

    if (timeLeft <= 0) {
        handleTimeout();
        return;
    }

    const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, phase, isWheelSpinning, showWheelFull, isProcessing, showSolveModal, showSettings, players, currentPlayerIdx]);

  // Reset timer on phase change or turn change
  useEffect(() => {
      if (phase === GamePhase.GUESSING_LETTER) {
        setTimeLeft(30);
      }
  }, [phase, currentPlayerIdx]);

  // Auto-Win Check
  useEffect(() => {
      if (phase === GamePhase.SOLVING || phase === GamePhase.SETUP || phase === GamePhase.READY || phase === GamePhase.IDLE) return;

      const puzzleLetters = new Set(puzzle.phrase.replace(/[^A-Z]/g, '').split(''));
      
      if (puzzleLetters.size === 0) return;

      const allFound = Array.from(puzzleLetters).every(l => guessedLetters.includes(l));

      if (allFound) {
          setPhase(GamePhase.SOLVING);
          soundService.playWin();
          setTimeout(() => soundService.playChaChing(), 300);
          
          setSystemMessage(`${players[currentPlayerIdx].name} SOLVED IT!`);
          
          setShowFireworks(true);
          setTimeout(() => setShowFireworks(false), 7000);

          setPlayers(prev => {
              const copy = [...prev];
              copy[currentPlayerIdx].totalScore += copy[currentPlayerIdx].roundScore;
              return copy;
          });
      }
  }, [guessedLetters, puzzle.phrase, phase, players, currentPlayerIdx]);

  // --- Computer Logic Effect ---
  useEffect(() => {
      const currentPlayer = players[currentPlayerIdx];
      
      if (!currentPlayer?.isComputer || [GamePhase.SETUP, GamePhase.READY, GamePhase.SOLVING, GamePhase.IDLE].includes(phase)) {
          if (computerTimeoutRef.current) clearTimeout(computerTimeoutRef.current);
          return;
      }

      if (showTurnOverlay || isProcessing || isWheelSpinning || showWheelFull) return;

      const difficulty = currentPlayer.difficulty || 1;

      const performComputerAction = () => {
          if (phase === GamePhase.SPINNING) {
               setSystemMessage(`${currentPlayer.name} is thinking...`);
               computerTimeoutRef.current = setTimeout(() => {
                   openWheelModal(); 
                   setTimeout(() => {
                       triggerSpin();
                   }, 1000);
               }, 1500);
          } 
          else if (phase === GamePhase.GUESSING_LETTER) {
              computerTimeoutRef.current = setTimeout(() => {
                  const available = ALPHABET.filter(l => !guessedLetters.includes(l));
                  const availVowels = available.filter(l => VOWELS.includes(l));
                  const availConsonants = available.filter(l => !VOWELS.includes(l));
                  const canAffordVowel = currentPlayer.roundScore >= VOWEL_COST;
                  const shouldBuyVowel = canAffordVowel && availVowels.length > 0 && Math.random() < (difficulty * 0.15); 

                  let chosenLetter = '';

                  if (shouldBuyVowel && vowelsCostMoney) {
                      chosenLetter = availVowels[Math.floor(Math.random() * availVowels.length)];
                  } else {
                      const pool = availConsonants.length > 0 ? availConsonants : availVowels;
                      
                      if (pool.length === 0) {
                          nextTurn();
                          return;
                      }

                      if (difficulty === 1) {
                          chosenLetter = pool[Math.floor(Math.random() * pool.length)];
                      } else {
                          const sorted = [...pool].sort((a,b) => (LETTER_FREQUENCY[b] || 0) - (LETTER_FREQUENCY[a] || 0));
                          if (difficulty === 4) {
                              chosenLetter = sorted[0];
                          } else if (difficulty === 3) {
                              const slice = Math.ceil(sorted.length * 0.3);
                              const top = sorted.slice(0, slice);
                              chosenLetter = top[Math.floor(Math.random() * top.length)];
                          } else {
                              const slice = Math.ceil(sorted.length * 0.6);
                              const top = sorted.slice(0, slice);
                              chosenLetter = top[Math.floor(Math.random() * top.length)];
                          }
                      }
                  }
                  
                  if (chosenLetter) handleGuess(chosenLetter);

              }, 2000);
          }
      };

      performComputerAction();
      return () => {
          if (computerTimeoutRef.current) clearTimeout(computerTimeoutRef.current);
      };
  }, [phase, currentPlayerIdx, isWheelSpinning, showWheelFull, isProcessing, showTurnOverlay]);


  // --- Helper: Prepare Game ---
  // Returns the configured players list for immediate use
  const initializeGame = (startPlayers: Partial<Player>[], vowelRule: boolean, mode: GameMode): Player[] => {
    soundService.init();
    
    let newPlayers: Player[] = startPlayers.map((p, i) => {
        const existing = players.find(ep => ep.name === p.name);
        return {
            id: i.toString(),
            name: p.name || `Player ${i+1}`,
            totalScore: existing ? existing.totalScore : 0,
            roundScore: 0,
            isComputer: !!p.isComputer,
            difficulty: p.difficulty || 1
        };
    });

    const shuffled = [...newPlayers];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setPlayers(shuffled);
    setCurrentPlayerIdx(0);
    setVowelsCostMoney(vowelRule);
    setGameMode(mode);
    return shuffled;
  };


  // --- Handlers ---

  const handleSaveSettings = (newSettings: AiSettings) => {
      setAiSettings(newSettings);
      localStorage.setItem('fortune_spin_ai_settings', JSON.stringify(newSettings));
      setSystemMessage("Settings saved!");
  };

  const handleTimeout = () => {
      soundService.playLose();
      setSystemMessage("Time's Up! Next turn.");
      nextTurn();
  };

  const handleSetupComplete = (startPlayers: Partial<Player>[], vowelRule: boolean, mode: GameMode) => {
    initializeGame(startPlayers, vowelRule, mode);
    setPhase(GamePhase.READY); // Go to Puzzle Selection
  };

  const handleQuickPlay = (startPlayers: Partial<Player>[], vowelRule: boolean, mode: GameMode, difficulty: DifficultyLevel) => {
    const initializedPlayers = initializeGame(startPlayers, vowelRule, mode);
    
    // Pick random puzzle matching difficulty
    let savedPuzzles = [];
    try {
        savedPuzzles = loadPuzzleLibrary();
    } catch(e) {
        savedPuzzles = [];
    }
    
    let pool = savedPuzzles.filter((p: any) => p.difficulty === difficulty);
    // Exclude recent
    let validPool = pool.filter((p: any) => !playedPuzzleIds.includes(p.id));
    if (validPool.length === 0) validPool = pool; // Fallback to played of same difficulty
    if (validPool.length === 0) validPool = savedPuzzles; // Fallback to any

    let puzzleToPlay = { category: 'GREETING', phrase: 'HELLO WORLD', difficulty: DifficultyLevel.A1 };

    if (validPool.length > 0) {
        puzzleToPlay = validPool[Math.floor(Math.random() * validPool.length)];
    } 
    
    // Pass the initialized players directly to ensure they aren't overwritten by stale state
    handleSetPuzzle(puzzleToPlay, initializedPlayers);
  };

  const handleCancelSetup = () => {
    // If we have existing players and a puzzle, go back to game (Spinning or whatever)
    // If not, go to IDLE (Empty board)
    if (players.length > 0 && puzzle.phrase) {
        setPhase(GamePhase.SPINNING); // Resume
    } else {
        setPhase(GamePhase.IDLE);
    }
  };

  const handleBackToSetup = () => {
    setPhase(GamePhase.SETUP);
  };

  const handleSetPuzzle = (data: PuzzleData & { id?: string }, overridePlayers?: Player[]) => {
    setShowFireworks(false);
    setPuzzle(data);
    
    if (data.id) {
        setPlayedPuzzleIds(prev => {
            const updated = [data.id!, ...prev];
            return updated.slice(0, 30);
        });
    }

    setGuessedLetters([]);
    setSpinValue(null);
    setRoundId(prev => prev + 1);
    
    // CRITICAL FIX: Use overridden players if provided (from QuickPlay), otherwise stale state wipes them out
    const currentPlayers = overridePlayers || players;
    const resetPlayers = currentPlayers.map(p => ({ ...p, roundScore: 0 }));
    setPlayers(resetPlayers);
    
    setPhase(GamePhase.SPINNING);
    
    const playerName = resetPlayers[currentPlayerIdx]?.name || "Player";
    setSystemMessage(`${playerName}, spin the wheel!`);
    
    setShowTurnOverlay(true);
    setTimeout(() => setShowTurnOverlay(false), 2500);
  };

  const openWheelModal = () => {
    if (phase !== GamePhase.SPINNING || isProcessing) return;
    setShowWheelFull(true);
    setSystemMessage(players[currentPlayerIdx].isComputer ? "Computer is spinning..." : "Tap the wheel to spin!");
  };

  const triggerSpin = () => {
    if (!isWheelSpinning && !isProcessing) {
      setIsWheelSpinning(true);
      setSystemMessage("Spinning...");
    }
  };

  const handleSpinEnd = (segment: WheelSegment) => {
    // Note: Do NOT set isWheelSpinning(false) here immediately. 
    // We want the wheel to stay "in use" until the modal closes to prevent "Tap to spin" from flashing back up.
    
    setTimeout(() => {
        setIsWheelSpinning(false);
        setShowWheelFull(false);
        
        if (segment.type === WheelSegmentType.BANKRUPT) {
            soundService.playBuzzer();
            setSystemMessage("BANKRUPT! Turn passes.");
            setPlayers(prev => {
                const copy = [...prev];
                copy[currentPlayerIdx].roundScore = 0;
                return copy;
            });
            nextTurn();
        } else if (segment.type === WheelSegmentType.LOSE_TURN) {
            soundService.playLoseTurn();
            setSystemMessage("LOSE TURN! Sorry.");
            nextTurn();
        } else {
            setSpinValue(segment.value);
            setSystemMessage(players[currentPlayerIdx].isComputer ? "Computer guessing..." : `$${segment.value}! Guess a consonant.`);
            setPhase(GamePhase.GUESSING_LETTER);
            setTimeLeft(30); 
        }
    }, 1500);
  };

  const handleGuess = (letter: string) => {
    if (isProcessing) return;
    soundService.init();

    const isVowel = VOWELS.includes(letter);
    const currentPlayer = players[currentPlayerIdx];

    if (isVowel && vowelsCostMoney) {
        if (currentPlayer.roundScore < VOWEL_COST) {
            if (!currentPlayer.isComputer) {
                soundService.playBuzzer();
                setSystemMessage("Not enough money to buy a vowel ($250).");
            }
            return;
        }
        soundService.playCash();
        setPlayers(prev => {
            const copy = [...prev];
            copy[currentPlayerIdx].roundScore -= VOWEL_COST;
            return copy;
        });
    }

    const count = puzzle.phrase.split('').filter(char => char === letter).length;

    if (count > 0) {
        setGuessedLetters([...guessedLetters, letter]);

        if (!isVowel && typeof spinValue === 'number') {
            const earnings = spinValue * count;
            setPlayers(prev => {
                const copy = [...prev];
                copy[currentPlayerIdx].roundScore += earnings;
                return copy;
            });
        }
        setSystemMessage(`Found ${count} ${letter}'s!`);
        setPhase(GamePhase.SPINNING); 
    } else {
        soundService.playBuzzer();
        setGuessedLetters([...guessedLetters, letter]); 
        setSystemMessage(`Sorry, no ${letter}.`);
        nextTurn();
    }
  };

  const normalize = (str: string) => {
    return str.toUpperCase().replace(/[^A-Z]/g, '');
  };

  const handleSolveAttempt = (guess: string) => {
      setShowSolveModal(false);
      
      const normalizedGuess = normalize(guess);
      const normalizedPhrase = normalize(puzzle.phrase);

      if (normalizedGuess === normalizedPhrase && normalizedGuess.length > 0) {
          soundService.playWin();
          setTimeout(() => soundService.playChaChing(), 300);
          
          setSystemMessage(`${players[currentPlayerIdx].name} SOLVED IT!`);
          setPhase(GamePhase.SOLVING);
          
          setShowFireworks(true);
          setTimeout(() => setShowFireworks(false), 7000);

          setPlayers(prev => {
              const copy = [...prev];
              copy[currentPlayerIdx].totalScore += copy[currentPlayerIdx].roundScore;
              return copy;
          });
      } else {
          soundService.playLose();
          setSystemMessage("Incorrect Solve! Next turn.");
          nextTurn();
      }
  };

  const nextTurn = () => {
      setIsProcessing(true);
      setTimeout(() => {
        setPhase(GamePhase.SPINNING);
        const nextIdx = (currentPlayerIdx + 1) % players.length;
        setCurrentPlayerIdx(nextIdx);
        setSpinValue(null);
        setSystemMessage(`${players[nextIdx].name}'s turn!`);
        setIsProcessing(false);
        
        setShowTurnOverlay(true);
        setTimeout(() => setShowTurnOverlay(false), 2500);
      }, 2000);
  };

  const startNewRound = () => {
    setPhase(GamePhase.SETUP);
  };

  const handleResetGame = () => {
      // Clear players so SetupModal starts fresh (using saved preferences/defaults) rather than locked to previous game state
      setPlayers([]); 
      setPhase(GamePhase.SETUP);
  };

  const currentPlayer = players[currentPlayerIdx];
  const canBuyVowel = !vowelsCostMoney || (currentPlayer?.roundScore >= VOWEL_COST);

  const wheelOverlay = typeof document !== 'undefined'
    ? createPortal(
        showWheelFull ? (
          <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center">
            <div className="relative flex items-center justify-center">
              <Wheel
                isSpinning={isWheelSpinning}
                onSpinEnd={handleSpinEnd}
                isFullscreen
                onTriggerSpin={triggerSpin}
                onClick={openWheelModal}
              />
              {!isWheelSpinning && (
                <div className="absolute bottom-[10%] text-white font-display text-[clamp(1.1rem,3.8vmin,2.2rem)] tracking-[0.45em] pointer-events-none text-center px-6 animate-bounce">
                  {currentPlayer?.isComputer ? `${currentPlayer.name.toUpperCase()} SPINNING...` : 'TAP WHEEL TO SPIN!'}
                </div>
              )}
            </div>
          </div>
        ) : null,
        document.body
      )
    : null;

  return (
    <>
      <div className="grid grid-cols-[18vw_auto] h-screen w-screen bg-game-dark overflow-hidden relative">
        <style>{`
          @media (orientation: portrait) {
              #portrait-warning { display: flex !important; }
          }
        `}</style>
        
        <div id="portrait-warning" className="fixed inset-0 z-[1000] bg-black hidden flex-col items-center justify-center p-8 text-center">
           <div className="animate-spin mb-6 text-game-accent">
             <RotateCcw size={64} />
           </div>
           <h1 className="text-3xl font-display text-white mb-2">Please Rotate Device</h1>
           <p className="text-indigo-300">This game is optimized for landscape mode only.</p>
        </div>

        {showFireworks && <Fireworks />}

        <aside className="h-full z-30 bg-game-panel">
          <PlayerSidebar 
            players={players} 
            currentPlayerIndex={currentPlayerIdx}
            onRequestNewGame={handleResetGame}
            onOpenSettings={() => setShowSettings(true)}
          />
        </aside>

        <main className="h-full flex flex-col relative bg-game-dark min-w-0">
          <section className="relative flex flex-col flex-1 bg-gradient-to-b from-indigo-900 via-game-dark to-game-dark overflow-hidden min-h-0">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #4f46e5 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

            <TurnOverlay
              playerName={currentPlayer?.name || 'Player'}
              isVisible={showTurnOverlay}
            />

            <div className="flex-1 min-h-0 flex justify-center items-stretch px-[clamp(0.8rem,2.6vmin,1.85rem)] pt-[clamp(0.4rem,1.2vmin,0.85rem)] pb-[clamp(0.4rem,1.2vmin,0.85rem)]">
              <div className="relative flex flex-col w-full flex-1 h-full max-h-full min-h-0 bg-indigo-900/50 border-2 border-game-accent rounded-xl shadow-[0_18px_65px_rgba(79,70,229,0.42)] backdrop-blur-sm overflow-hidden">
                <div className="flex-1 min-h-[clamp(240px,38vmin,480px)] px-[clamp(0.7rem,2.2vmin,1.6rem)] pt-[clamp(0.35rem,1vmin,0.75rem)] pb-[clamp(0.6rem,1.8vmin,1.3rem)]">
                  <div className="h-full w-full flex justify-center items-stretch min-h-0">
                    <PuzzleBoard
                      key={roundId}
                      phrase={puzzle.phrase}
                      category={puzzle.category}
                      guessedLetters={guessedLetters}
                      revealed={phase === GamePhase.SOLVING}
                      onAnimationStart={() => setIsProcessing(true)}
                      onAnimationComplete={() => setIsProcessing(false)}
                    />
                  </div>
                </div>

                <div className="relative shrink-0 px-[clamp(0.9rem,2.6vmin,1.8rem)] pb-[clamp(0.5rem,1.6vmin,1.1rem)] pt-[clamp(0.2rem,0.8vmin,0.45rem)]">
                  <div className="flex items-center justify-center gap-[clamp(0.6rem,1.8vmin,1.25rem)]">
                    {phase === GamePhase.SOLVING ? (
                      <button
                        onClick={startNewRound}
                        className="bg-green-500 text-black font-display font-semibold tracking-[0.35em] text-[clamp(0.95rem,2.6vmin,1.45rem)] px-[clamp(1.4rem,4.2vmin,2.6rem)] py-[clamp(0.65rem,1.9vmin,1.05rem)] rounded-full shadow-[0_0_26px_rgba(74,222,128,0.55)] hover:scale-105 transition-transform uppercase"
                      >
                        Next Round
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={openWheelModal}
                          disabled={phase !== GamePhase.SPINNING || isProcessing || currentPlayer?.isComputer}
                          className="bg-game-accent text-black font-display font-semibold tracking-[0.35em] text-[clamp(0.95rem,2.6vmin,1.45rem)] px-[clamp(1.4rem,4.2vmin,2.6rem)] py-[clamp(0.65rem,1.9vmin,1.05rem)] rounded-full shadow-[0_0_26px_rgba(255,215,0,0.55)] disabled:opacity-35 disabled:shadow-none transition-transform hover:scale-105 uppercase"
                        >
                          Spin
                        </button>
                        <button
                          onClick={() => setShowSolveModal(true)}
                          disabled={phase === GamePhase.SETUP || phase === GamePhase.READY || isProcessing || currentPlayer?.isComputer}
                          className="bg-blue-600 text-white font-display font-semibold tracking-[0.35em] text-[clamp(0.95rem,2.6vmin,1.45rem)] px-[clamp(1.4rem,4.2vmin,2.6rem)] py-[clamp(0.65rem,1.9vmin,1.05rem)] rounded-full shadow-[0_0_26px_rgba(59,130,246,0.55)] disabled:opacity-35 transition-transform hover:scale-105 uppercase"
                        >
                          Solve
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div
                  className={`absolute bottom-[1vmin] right-[1vmin] h-[clamp(120px,16vmin,180px)] w-[clamp(120px,16vmin,180px)] transition-all duration-500 ease-in-out z-40 ${(!showWheelFull && phase === GamePhase.SPINNING && !isProcessing && !currentPlayer?.isComputer) ? 'hover:scale-110 cursor-pointer animate-pulse drop-shadow-[0_0_32px_rgba(255,215,0,0.85)]' : 'cursor-default'} ${phase === GamePhase.IDLE ? 'pointer-events-none opacity-40 grayscale' : ''}`}
                  onClick={(!showWheelFull && !currentPlayer?.isComputer && phase === GamePhase.SPINNING) ? openWheelModal : undefined}
                >
                  <Wheel
                    isSpinning={isWheelSpinning}
                    onSpinEnd={handleSpinEnd}
                    isFullscreen={false}
                    onTriggerSpin={triggerSpin}
                    onClick={openWheelModal}
                  />
                </div>
              </div>
            </div>
          </section>
          <footer className="relative">
            <VirtualKeyboard
              onGuess={handleGuess}
              guessedLetters={guessedLetters}
              disabled={phase !== GamePhase.GUESSING_LETTER || isProcessing || showWheelFull || currentPlayer?.isComputer}
              canBuyVowel={canBuyVowel && phase === GamePhase.GUESSING_LETTER}
            />
          </footer>

          {phase === GamePhase.GUESSING_LETTER && !currentPlayer?.isComputer && (
            <div className="absolute top-[clamp(1.5rem,3vmin,2.75rem)] left-[clamp(0.75rem,2.5vmin,1.75rem)] w-[clamp(3.5rem,8vmin,5.5rem)] h-[clamp(3.5rem,8vmin,5.5rem)] z-40 pointer-events-none">
              <Stopwatch timeLeft={timeLeft} maxTime={30} />
            </div>
          )}
        </main>

        {phase === GamePhase.SETUP && (
          <SetupModal 
              onSetupComplete={handleSetupComplete}
              onQuickPlay={handleQuickPlay}
              onCancel={handleCancelSetup}
              initialPlayers={players.length > 0 ? players : undefined}
          />
        )}
        {phase === GamePhase.READY && (
           <PuzzleModal 
              onSetPuzzle={handleSetPuzzle} 
              aiSettings={aiSettings}
              playedPuzzleIds={playedPuzzleIds}
              onOpenSettings={() => setShowSettings(true)}
              gameMode={gameMode}
              onCancel={handleCancelSetup}
              onBackToSetup={handleBackToSetup}
           />
        )}
        {showSolveModal && 
          <SolveModal 
              phrase={puzzle.phrase} 
              onSubmit={handleSolveAttempt} 
              onCancel={() => setShowSolveModal(false)} 
              aiSettings={aiSettings}
              gameMode={gameMode}
              onOpenSettings={() => setShowSettings(true)}
          />
        }
        {showSettings && (
            <SettingsModal 
              currentSettings={aiSettings}
              onSave={handleSaveSettings}
              onClose={() => setShowSettings(false)}
            />
        )}
      </div>
      {wheelOverlay}
    </>
  );
};

export default App;
