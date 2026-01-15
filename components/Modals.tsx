
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Player, PuzzleData, AiSettings, DifficultyLevel, GameMode, ClassProfile } from '../types';
import { generatePuzzle, checkVoiceSolution } from '../services/geminiService';
import { Sparkles, Play, Loader2, Coins, Save, Trash2, BookOpen, CheckCircle2, AlertCircle, XCircle, Bot, User, Pencil, RefreshCw, Eye, EyeOff, Settings, ArrowLeft, Zap, FolderOpen, Plus } from 'lucide-react';
import { PUZZLE_CATEGORIES, COMPUTER_NAMES, PRELOADED_CLASSES } from '../constants';
import { loadPuzzleLibrary, upsertPuzzleLibraryEntry, removePuzzleLibraryEntry } from '../services/puzzleStorage';
import { PuzzleLibraryEntry } from '../types';

// --- Setup Modal ---
interface SetupModalProps {
  onSetupComplete: (players: Partial<Player>[], vowelsCostMoney: boolean, gameMode: GameMode, difficulty: DifficultyLevel) => void;
  onQuickPlay: (players: Partial<Player>[], vowelsCostMoney: boolean, gameMode: GameMode, difficulty: DifficultyLevel) => void;
  onCancel: () => void;
  initialPlayers?: Player[];
}

export const SetupModal: React.FC<SetupModalProps> = ({ onSetupComplete, onQuickPlay, onCancel, initialPlayers }) => {
  // State initialization from localStorage or defaults
  const [gameMode, setGameMode] = useState<GameMode>(() => {
      return (localStorage.getItem('fs_last_gamemode') as GameMode) || 'STUDENT';
  });
  
  // -- REFACTORED INIT LOGIC --
  const [players, setPlayers] = useState<Partial<Player>[]>(() => {
    // If we have passed players (e.g. editing setup), use them.
    if (initialPlayers && initialPlayers.length > 0) {
        return initialPlayers.map(p => ({
            name: p.name,
            isComputer: p.isComputer,
            difficulty: p.difficulty
        }));
    }
    
    // Otherwise load defaults
    const p1Name = localStorage.getItem('fs_player1_name') || 'Player 1';
    const savedSolo = localStorage.getItem('fs_last_issolo') === 'true';
    
    if (savedSolo) {
        const compName = COMPUTER_NAMES[Math.floor(Math.random() * COMPUTER_NAMES.length)];
        return [
            { name: p1Name, isComputer: false, difficulty: 1 },
            { name: compName, isComputer: true, difficulty: 2 }
        ];
    } else {
        return [
            { name: p1Name, isComputer: false, difficulty: 1 },
            { name: 'Player 2', isComputer: false, difficulty: 1 }
        ];
    }
  });

  const [isSolo, setIsSolo] = useState<boolean>(() => {
      if (initialPlayers && initialPlayers.length > 0) {
          // Infer solo status from players: Solo if exactly 2 players and 2nd is computer
          return initialPlayers.length === 2 && !!initialPlayers[1].isComputer;
      }
      return localStorage.getItem('fs_last_issolo') === 'true';
  });

  const [difficulty, setDifficulty] = useState<DifficultyLevel>(() => {
      return (localStorage.getItem('fs_last_difficulty') as DifficultyLevel) || DifficultyLevel.A1;
  });

  const [vowelsCostMoney, setVowelsCostMoney] = useState(true);

  // Class Profiles
  const [classProfiles, setClassProfiles] = useState<ClassProfile[]>(() => {
      const saved = localStorage.getItem('fs_class_profiles');
      return saved ? [...PRELOADED_CLASSES, ...JSON.parse(saved)] : PRELOADED_CLASSES;
  });
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [newProfileName, setNewProfileName] = useState('');

  // --- Handlers ---

  const handleSoloToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      setIsSolo(checked);
      
      setPlayers(prev => {
          const newPlayers = [...prev];
          
          if (checked) {
              // Switching TO Solo
              // Preserve P1
              const p1 = newPlayers[0] || { name: 'Player 1', isComputer: false, difficulty: 1 };
              // Force P2 CPU
              const compName = COMPUTER_NAMES[Math.floor(Math.random() * COMPUTER_NAMES.length)];
              const p2 = { name: compName, isComputer: true, difficulty: 2 };
              return [{...p1, isComputer: false}, p2];
          } else {
              // Switching TO Multi
              // Preserve P1
              const p1 = newPlayers[0] || { name: 'Player 1', isComputer: false, difficulty: 1 };
              // Ensure P2 exists
              let p2 = newPlayers[1];
              if (!p2) {
                  p2 = { name: 'Player 2', isComputer: false, difficulty: 1 };
              } else if (p2.isComputer) {
                  // If it was a CPU, convert to generic Human P2
                  p2 = { ...p2, name: 'Player 2', isComputer: false, difficulty: 1 };
              }
              
              // If there were more than 2 players, restore them if they exist?
              // The logic here is simplifed: if you untoggle solo, you get 2 human players or preserve existing list if applicable.
              if (newPlayers.length > 2) {
                  return [p1, p2, ...newPlayers.slice(2)];
              }
              return [p1, p2];
          }
      });
  };

  const savePreferences = () => {
      localStorage.setItem('fs_last_gamemode', gameMode);
      localStorage.setItem('fs_last_issolo', isSolo.toString());
      localStorage.setItem('fs_last_difficulty', difficulty);
      if (players[0]?.name) {
          localStorage.setItem('fs_player1_name', players[0].name);
      }
  };

  const handleSetupAction = (action: 'SETUP' | 'QUICK') => {
      savePreferences();
      if (action === 'SETUP') {
          onSetupComplete(players, vowelsCostMoney, gameMode, difficulty);
      } else {
          onQuickPlay(players, vowelsCostMoney, gameMode, difficulty);
      }
  };

  const addPlayer = () => {
    if (players.length < 5) {
        setPlayers([...players, { name: `Player ${players.length + 1}`, isComputer: false, difficulty: 1 }]);
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > 1) { 
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const updatePlayer = (index: number, field: keyof Player, value: any) => {
    const updated = [...players];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-name CPU
    if (field === 'isComputer' && value === true) {
        // Always assign a cool name if switching to computer
        updated[index].name = COMPUTER_NAMES[Math.floor(Math.random() * COMPUTER_NAMES.length)];
    } else if (field === 'isComputer' && value === false) {
        // Reset to default Human name if it was a known computer name
        if (COMPUTER_NAMES.includes(updated[index].name || "")) {
             updated[index].name = `Player ${index + 1}`;
        }
    }

    setPlayers(updated);
  };

  const loadClassProfile = (profileName: string) => {
      const profile = classProfiles.find(p => p.name === profileName);
      if (profile) {
          const newPlayers = profile.players.map(name => ({
              name,
              isComputer: false,
              difficulty: 1
          }));
          setPlayers(newPlayers);
          setSelectedProfileId(profileName);
          // Auto disable solo if loading a class
          if (isSolo) setIsSolo(false);
      }
  };

  const saveClassProfile = () => {
      if (!newProfileName.trim()) {
          alert("Please enter a name for this class profile.");
          return;
      }
      
      const newProfile: ClassProfile = {
          name: newProfileName.trim(),
          players: players.map(p => p.name || "Player")
      };

      const customProfiles = classProfiles.filter(p => !PRELOADED_CLASSES.some(pl => pl.name === p.name));
      
      const existingIdx = customProfiles.findIndex(p => p.name === newProfile.name);
      let updatedCustom;
      
      if (existingIdx >= 0) {
          if (!confirm(`Overwrite existing profile "${newProfile.name}"?`)) return;
          updatedCustom = [...customProfiles];
          updatedCustom[existingIdx] = newProfile;
      } else {
          updatedCustom = [...customProfiles, newProfile];
      }

      const allProfiles = [...PRELOADED_CLASSES, ...updatedCustom];
      
      setClassProfiles(allProfiles);
      localStorage.setItem('fs_class_profiles', JSON.stringify(updatedCustom));
      setNewProfileName('');
      setSelectedProfileId(newProfile.name);
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-game-panel border border-indigo-500/30 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* TOP BAR: Controls */}
        <div className="bg-indigo-950/50 p-3 md:p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
            
            <div className="flex items-center gap-4">
                {/* Left: Solo Toggle */}
                <label className="flex items-center cursor-pointer gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/30 transition-colors">
                    <span className="text-xs md:text-sm font-bold text-indigo-200">Solo Play</span>
                    <div className="relative">
                        <input type="checkbox" className="sr-only" checked={isSolo} onChange={handleSoloToggle} />
                        <div className={`w-10 h-5 rounded-full transition-colors ${isSolo ? 'bg-purple-600' : 'bg-gray-600'}`}></div>
                        <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${isSolo ? 'translate-x-5' : ''}`}></div>
                    </div>
                </label>

                {/* Vowel Toggle */}
                <label className="flex items-center cursor-pointer gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/30 transition-colors">
                    <span className="text-xs md:text-sm font-bold text-indigo-200">Vowel Cost</span>
                    <div className="relative">
                        <input type="checkbox" className="sr-only" checked={vowelsCostMoney} onChange={(e) => setVowelsCostMoney(e.target.checked)} />
                        <div className={`w-10 h-5 rounded-full transition-colors ${vowelsCostMoney ? 'bg-green-600' : 'bg-gray-600'}`}></div>
                        <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${vowelsCostMoney ? 'translate-x-5' : ''}`}></div>
                    </div>
                </label>
            </div>

            {/* Center: Student / Teacher Mode */}
            <div className="flex bg-black/40 rounded-lg p-1">
                <button 
                    onClick={() => setGameMode('STUDENT')}
                    className={`px-4 py-1.5 rounded-md font-bold text-xs md:text-sm transition-colors ${gameMode === 'STUDENT' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    Student
                </button>
                <button 
                    onClick={() => setGameMode('TEACHER')}
                    className={`px-4 py-1.5 rounded-md font-bold text-xs md:text-sm transition-colors ${gameMode === 'TEACHER' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    Teacher
                </button>
            </div>

            {/* Right: Difficulty */}
            <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm text-indigo-300 font-bold hidden md:inline">Level:</span>
                <select 
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                    className="bg-black/30 border border-indigo-500/30 rounded px-2 py-1.5 text-xs md:text-sm text-white focus:outline-none focus:border-game-accent"
                >
                    {Object.values(DifficultyLevel).map(level => (
                        <option key={level} value={level}>{level}</option>
                    ))}
                </select>
            </div>

            {/* Close Button (X) */}
            <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors">
                <XCircle size={24} />
            </button>
        </div>

        {/* MIDDLE: Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-b from-indigo-900/10 to-transparent">
            
            {/* Teacher Mode: Class Profiles */}
            {gameMode === 'TEACHER' && (
                <div className="mb-6 bg-black/20 p-3 rounded-xl border border-white/5 space-y-3">
                    <div className="flex items-center gap-2 text-indigo-300">
                        <FolderOpen size={18} />
                        <span className="text-sm font-bold">Class Profiles:</span>
                    </div>
                    
                    {/* List of profiles */}
                    <div className="flex flex-wrap gap-2">
                        {classProfiles.map(profile => (
                            <button
                                key={profile.name}
                                onClick={() => loadClassProfile(profile.name)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${selectedProfileId === profile.name ? 'bg-teal-700 border-teal-400 text-white shadow-lg' : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'}`}
                            >
                                {profile.name}
                            </button>
                        ))}
                    </div>

                    {/* Save New Profile Input */}
                    <div className="flex gap-2 pt-2 border-t border-white/5">
                        <input 
                            type="text"
                            value={newProfileName}
                            onChange={(e) => setNewProfileName(e.target.value)}
                            placeholder="New profile name..."
                            className="bg-black/40 border border-indigo-700/50 rounded px-3 py-1.5 text-xs text-white focus:border-game-accent focus:outline-none flex-1"
                        />
                        <button 
                            onClick={saveClassProfile}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1"
                        >
                            <Save size={14} /> Save Current Players
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* Players List */}
                 <div className="space-y-3">
                    <h3 className="text-indigo-200 text-sm font-bold uppercase tracking-wider mb-2">Players</h3>
                    {players.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/5 animate-in slide-in-from-left-2">
                            <div className={`p-2 rounded-lg ${p.isComputer ? 'bg-purple-900/50 text-purple-300' : 'bg-blue-900/50 text-blue-300'}`}>
                                {p.isComputer ? <Bot size={18} /> : <User size={18} />}
                            </div>
                            <input
                                type="text"
                                value={p.name}
                                onChange={(e) => updatePlayer(i, 'name', e.target.value)}
                                className="flex-1 bg-transparent border-b border-white/10 focus:border-game-accent px-2 py-1 text-sm text-white focus:outline-none"
                                placeholder={`Player ${i + 1}`}
                            />
                            
                            {/* Computer Toggle (Only allowed if not forced by Solo mode for P2) */}
                            {(!isSolo || i === 0) && (
                                <button 
                                    onClick={() => updatePlayer(i, 'isComputer', !p.isComputer)}
                                    className="text-xs text-gray-500 hover:text-white px-2"
                                    title="Toggle Computer"
                                >
                                    {p.isComputer ? 'CPU' : 'Human'}
                                </button>
                            )}

                            {/* Remove Button */}
                            {!isSolo && players.length > 2 && (
                                <button onClick={() => removePlayer(i)} className="text-red-500/50 hover:text-red-400 p-1">
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                    {!isSolo && players.length < 5 && (
                        <button onClick={addPlayer} className="w-full py-2 border border-dashed border-gray-600 text-gray-400 rounded-lg text-sm hover:bg-white/5 flex items-center justify-center gap-2">
                            <Plus size={16} /> Add Player
                        </button>
                    )}
                 </div>

                 {/* Options Column */}
                 <div className="space-y-4">
                     <div className="bg-indigo-900/20 p-4 rounded-xl text-xs text-indigo-300 leading-relaxed">
                         <p className="mb-2"><strong className="text-white">Quick Tip:</strong></p>
                         <ul className="list-disc pl-4 space-y-1">
                             <li>In Solo Mode, the computer plays automatically.</li>
                             <li>Teacher Mode allows saving class rosters.</li>
                             <li>Quick Play picks a random puzzle for the selected Level.</li>
                             <li>Use the toggle in the header to change Vowel costs.</li>
                         </ul>
                     </div>
                 </div>
            </div>
        </div>

        {/* BOTTOM: Action Bar */}
        <div className="p-4 bg-indigo-950/80 border-t border-white/10 shrink-0 flex gap-3">
            <button
                onClick={() => handleSetupAction('QUICK')}
                className="flex-1 bg-game-accent hover:bg-yellow-400 text-black font-display font-bold text-lg py-3 rounded-xl shadow-lg hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
            >
                <Zap fill="currentColor" size={20} /> QUICK PLAY
            </button>
            <button
                onClick={() => handleSetupAction('SETUP')}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-display font-bold text-lg py-3 rounded-xl shadow-lg hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
            >
                <Settings size={20} /> SETUP PUZZLE
            </button>
        </div>
      </div>
    </div>
  );
};

// --- Puzzle Modal ---
interface PuzzleModalProps {
  onSetPuzzle: (data: PuzzleData) => void;
  onCancel: () => void;
  onBackToSetup: () => void;
  aiSettings: AiSettings;
  playedPuzzleIds: string[];
  onOpenSettings: () => void;
  gameMode: GameMode;
}

interface SavedPuzzle extends PuzzleData {
  id: string;
  createdAt: number;
}

export const PuzzleModal: React.FC<PuzzleModalProps> = ({ onSetPuzzle, onCancel, onBackToSetup, aiSettings, playedPuzzleIds, onOpenSettings, gameMode }) => {
  const [mode, setMode] = useState<'MANUAL' | 'LIBRARY' | 'AI'>('LIBRARY');
  const [manualCategory, setManualCategory] = useState('');
  const [manualPhrase, setManualPhrase] = useState('');
  const [manualDifficulty, setManualDifficulty] = useState<DifficultyLevel>(DifficultyLevel.A1);
  
  // AI State
  const [aiCategory, setAiCategory] = useState(PUZZLE_CATEGORIES[0]);
  const [aiDifficulty, setAiDifficulty] = useState<DifficultyLevel>(DifficultyLevel.A1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedPuzzle, setGeneratedPuzzle] = useState<SavedPuzzle | null>(null);

  // Library State
  const [savedPuzzles, setSavedPuzzles] = useState<SavedPuzzle[]>([]);
  const [selectedPuzzleId, setSelectedPuzzleId] = useState<string | null>(null);
  const [revealLibrary, setRevealLibrary] = useState(false);
  const [libraryFilter, setLibraryFilter] = useState('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const library = loadPuzzleLibrary();
    setSavedPuzzles(library);
  }, []);

  // Force reveal off if in student mode
  useEffect(() => {
      if (gameMode === 'STUDENT') setRevealLibrary(false);
  }, [gameMode]);

  // --- Actions ---

  const handleManualSubmit = () => {
    if (manualCategory && manualPhrase) {
      if (editingId) {
          // Update existing
          const updated = savedPuzzles.map(p => p.id === editingId ? { ...p, category: manualCategory.toUpperCase(), phrase: manualPhrase.toUpperCase(), difficulty: manualDifficulty } : p);
          setSavedPuzzles(updated);
          upsertPuzzleLibraryEntry({
              id: editingId,
              category: manualCategory.toUpperCase(),
              phrase: manualPhrase.toUpperCase(),
              difficulty: manualDifficulty,
              createdAt: Date.now(),
          });
          setEditingId(null);
          setMode('LIBRARY');
      } else {
          onSetPuzzle({ category: manualCategory.toUpperCase(), phrase: manualPhrase.toUpperCase(), difficulty: manualDifficulty });
      }
    }
  };

  const handleSaveToLibrary = () => {
    if (!manualCategory || !manualPhrase) return;

    // Duplicate check
    const normalizedPhrase = manualPhrase.toUpperCase().trim();
    if (savedPuzzles.some(p => p.phrase === normalizedPhrase && p.id !== editingId)) {
        alert("This puzzle phrase already exists in the library!");
        return;
    }

    const newPuzzle: SavedPuzzle = {
      id: editingId || Date.now().toString(),
      category: manualCategory.toUpperCase(),
      phrase: normalizedPhrase,
      difficulty: manualDifficulty,
      createdAt: Date.now()
    };

    let updated;
    if (editingId) {
        updated = savedPuzzles.map(p => p.id === editingId ? newPuzzle : p);
        setEditingId(null);
    } else {
        updated = [newPuzzle, ...savedPuzzles];
    }

    setSavedPuzzles(updated);
    upsertPuzzleLibraryEntry(newPuzzle);
    setMode('LIBRARY');
    
    // Clear form
    setManualCategory('');
    setManualPhrase('');
  };

  const handleEdit = (puzzle: SavedPuzzle) => {
      setManualCategory(puzzle.category);
      setManualPhrase(puzzle.phrase);
      setManualDifficulty(puzzle.difficulty || DifficultyLevel.A1);
      setEditingId(puzzle.id);
      setMode('MANUAL');
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedPuzzles.filter(p => p.id !== id);
    setSavedPuzzles(updated);
    removePuzzleLibraryEntry(id);
    if (selectedPuzzleId === id) setSelectedPuzzleId(null);
  };

  const handleAiGenerate = async () => {
    // Check keys first
    if (aiSettings.textProvider === 'openai' && !aiSettings.openAiApiKey) {
        onOpenSettings();
        return;
    }
    if (aiSettings.textProvider === 'google' && !aiSettings.googleApiKey) {
        onOpenSettings();
        return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setGeneratedPuzzle(null);

    try {
        const data = await generatePuzzle(aiSettings, aiCategory, aiDifficulty);
        
        if (data.category === "FALLBACK" && data.phrase === "API CONFIGURATION ERROR") {
             setErrorMsg("API Config Error. Please check Settings.");
        } else {
             // Auto-save generated puzzle
              const newPuzzle: SavedPuzzle = {
                  id: Date.now().toString(),
                  ...data,
                  createdAt: Date.now()
              };
              const updated = [newPuzzle, ...savedPuzzles];
              setSavedPuzzles(updated);
              upsertPuzzleLibraryEntry(newPuzzle);
             
             // DO NOT START GAME. Show result.
             setGeneratedPuzzle(newPuzzle);
        }
    } catch (e) {
        setErrorMsg("Generation failed. Check API keys.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleRandomSelect = () => {
      // Filter out played puzzles first if possible
      let pool = savedPuzzles;
      if (libraryFilter !== 'ALL') {
          pool = pool.filter(p => p.category === libraryFilter);
      }
      
      const unplayed = pool.filter(p => !playedPuzzleIds.includes(p.id));
      const targetPool = unplayed.length > 0 ? unplayed : pool;
      
      if (targetPool.length === 0) return;

      const random = targetPool[Math.floor(Math.random() * targetPool.length)];
      setSelectedPuzzleId(random.id);
  };

  // Grouping for Library
  const groupedPuzzles = useMemo<Record<string, SavedPuzzle[]>>(() => {
    const groups: Record<string, SavedPuzzle[]> = {};
    savedPuzzles.forEach(p => {
        if (!groups[p.category]) groups[p.category] = [];
        groups[p.category].push(p);
    });
    return groups;
  }, [savedPuzzles]);

  const uniqueCategories = Object.keys(groupedPuzzles).sort();
  const providerName = aiSettings.textProvider === 'openai' ? 'OpenAI' : 'Google Gemini';
  const activeKey = aiSettings.textProvider === 'google' ? aiSettings.googleApiKey : aiSettings.openAiApiKey;
  const missingApiKey = !activeKey;
  const maskPhrase = (phrase: string) => Array.from(phrase).map(char => {
      if (char === ' ') return ' ';
      if (/[A-Za-z0-9]/.test(char)) return '•';
      return char;
  }).join('');

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl md:rounded-2xl w-full max-w-xl md:max-w-3xl max-h-[85vh] flex flex-col relative overflow-hidden shadow-2xl">
        
        {/* Tab Nav & Close Row - Compact */}
        <div className="flex items-center bg-gray-800 p-1 shrink-0 border-b border-gray-700 gap-1">
          <button 
             onClick={onBackToSetup}
             className="px-3 py-2 text-gray-400 hover:text-white border-r border-gray-700 mr-1"
             title="Back to Setup"
          >
             <ArrowLeft size={18} />
          </button>
          
          <button 
            onClick={() => setMode('LIBRARY')}
            className={`flex-1 py-1.5 md:py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors text-xs md:text-sm ${mode === 'LIBRARY' ? 'bg-teal-600 text-white' : 'bg-transparent text-gray-400 hover:bg-gray-700'}`}
          >
            <BookOpen size={14} /> Library
          </button>
           <button 
            onClick={() => setMode('AI')}
            className={`flex-1 py-1.5 md:py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors text-xs md:text-sm ${mode === 'AI' ? 'bg-purple-600 text-white' : 'bg-transparent text-gray-400 hover:bg-gray-700'}`}
          >
            <Sparkles size={14} /> AI Gen
          </button>
          <button 
            onClick={() => { setEditingId(null); setManualCategory(''); setManualPhrase(''); setMode('MANUAL'); }}
            className={`flex-1 py-1.5 md:py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors text-xs md:text-sm ${mode === 'MANUAL' ? 'bg-indigo-600 text-white' : 'bg-transparent text-gray-400 hover:bg-gray-700'}`}
          >
            <Pencil size={14}/> Manual
          </button>
          
          <button onClick={onCancel} className="px-3 py-1 text-gray-400 hover:text-white border-l border-gray-700">
             <XCircle size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto min-h-0 relative bg-gray-900">
            
            {/* LIBRARY TAB */}
            {mode === 'LIBRARY' && (
                <div className="p-3 pb-20"> 
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
                        <button 
                            onClick={() => setLibraryFilter('ALL')}
                            className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap ${libraryFilter === 'ALL' ? 'bg-teal-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                        >
                            ALL
                        </button>
                        {uniqueCategories.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setLibraryFilter(cat)}
                                className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap ${libraryFilter === cat ? 'bg-teal-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-between items-center mb-3">
                         {gameMode === 'TEACHER' ? (
                             <button onClick={() => setRevealLibrary(!revealLibrary)} className="text-gray-400 hover:text-white flex items-center gap-1 text-[10px] md:text-xs">
                                {revealLibrary ? <EyeOff size={14}/> : <Eye size={14}/>} {revealLibrary ? "Hide" : "Show Answers"}
                             </button>
                         ) : (
                             <span className="text-[10px] text-gray-500 italic">Hidden (Student Mode)</span>
                         )}
                        <button onClick={handleRandomSelect} className="bg-game-accent hover:bg-yellow-400 text-black px-3 py-1.5 rounded font-bold text-xs flex items-center gap-1 shadow-sm">
                            <RefreshCw size={12} /> Random
                        </button>
                    </div>

                    <div className="space-y-3">
                        {(Object.entries(groupedPuzzles) as [string, SavedPuzzle[]][]).map(([cat, puzzles]) => {
                            if (libraryFilter !== 'ALL' && libraryFilter !== cat) return null;
                            return (
                                <div key={cat}>
                                    <h3 className="text-teal-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1 border-b border-gray-700 pb-1 sticky top-0 bg-gray-900 z-10">{cat}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {puzzles.map(p => (
                                            <div 
                                                key={p.id}
                                                onClick={() => setSelectedPuzzleId(p.id)}
                                                className={`
                                                    p-2 rounded border cursor-pointer transition-all relative group
                                                    ${selectedPuzzleId === p.id 
                                                        ? 'bg-teal-900/30 border-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.2)]' 
                                                        : 'bg-gray-800 border-gray-700 hover:border-gray-600'}
                                                `}
                                            >
                                                <div className="pr-6">
                                                    <div className="flex items-center gap-1 mb-1">
                                                        <span className={`text-[9px] px-1 rounded ${selectedPuzzleId === p.id ? 'bg-teal-500 text-black' : 'bg-gray-700 text-gray-300'}`}>
                                                            {p.difficulty || 'A1'}
                                                        </span>
                                                        {playedPuzzleIds.includes(p.id) && <span className="text-[9px] text-gray-500">(Played)</span>}
                                                    </div>
                                                    <div className={`font-mono font-bold text-xs md:text-sm ${selectedPuzzleId === p.id ? 'text-white' : 'text-gray-400'} truncate`}>
                                                        {revealLibrary ? p.phrase : "•".repeat(Math.min(p.phrase.length, 30))}
                                                    </div>
                                                </div>
                                                
                                                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={(e) => { e.stopPropagation(); handleEdit(p); }} className="p-1 hover:text-blue-400 text-gray-500"><Pencil size={12}/></button>
                                                    <button onClick={(e) => handleDeleteSaved(p.id, e)} className="p-1 hover:text-red-400 text-gray-500"><Trash2 size={12}/></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
              </div>
            </div>
        )}

        {/* AI TAB */}
        {mode === 'AI' && (
            <div className="p-4 space-y-4">
                <div className="bg-purple-900/20 border border-purple-500/40 rounded-xl p-3 text-xs text-purple-100">
                    <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-purple-200 flex items-center gap-1">
                            <Sparkles size={14} /> AI Puzzle Generator
                        </p>
                        <button
                            onClick={onOpenSettings}
                            className="text-purple-300 hover:text-white transition-colors"
                            title="Configure AI settings"
                        >
                            <Settings size={16} />
                        </button>
                    </div>
                    <div className="mt-1 flex flex-col gap-1 text-[11px] md:text-xs text-purple-100/90">
                        <p>
                            Select a category and level, then let the {providerName} model craft a fresh puzzle. Generated puzzles are auto-saved to your library for later reuse.
                        </p>
                        <p className="text-purple-200/80">
                            Using: <span className="font-semibold text-purple-100">{providerName}</span> {activeKey ? '(key detected)' : '(key missing)'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Category</label>
                        <select
                            value={aiCategory}
                            onChange={(e) => setAiCategory(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-2 text-white text-sm focus:border-purple-500 outline-none"
                        >
                            {PUZZLE_CATEGORIES.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Difficulty</label>
                        <select
                            value={aiDifficulty}
                            onChange={(e) => setAiDifficulty(e.target.value as DifficultyLevel)}
                            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-2 text-white text-sm focus:border-purple-500 outline-none"
                        >
                            {Object.values(DifficultyLevel).map(level => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {missingApiKey && (
                    <div className="bg-red-900/20 border border-red-500/40 rounded-lg p-3 text-xs text-red-200 flex flex-col gap-2">
                        <div className="flex items-center gap-2 font-semibold">
                            <AlertCircle size={14} /> {providerName} API key required
                        </div>
                        <p className="text-[11px] md:text-xs">
                            Add your {providerName} key in settings to enable AI generation.
                        </p>
                        <button
                            onClick={onOpenSettings}
                            className="self-start bg-red-500/80 hover:bg-red-500 text-white px-3 py-1.5 rounded text-[11px] font-bold"
                        >
                            Open Settings
                        </button>
                    </div>
                )}

                {errorMsg && (
                    <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-xs text-red-200 flex items-start gap-2">
                        <AlertCircle size={14} className="mt-0.5" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                <button
                    onClick={handleAiGenerate}
                    disabled={isLoading || missingApiKey}
                    className={`w-full py-3 rounded-lg font-bold text-sm md:text-base flex items-center justify-center gap-2 transition-colors ${isLoading || missingApiKey ? 'bg-purple-700/40 text-purple-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}
                >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {isLoading ? 'Generating...' : 'Generate Puzzle'}
                </button>

                {generatedPuzzle && (
                    <div className="bg-gray-800 border border-purple-500/40 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between text-xs text-purple-200">
                            <span className="font-semibold uppercase tracking-wide">Generated Puzzle</span>
                            <span className="text-[10px] text-gray-400">{new Date(generatedPuzzle.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="text-[11px] md:text-xs text-gray-300 flex flex-col gap-1">
                            <span><strong className="text-purple-200">Category:</strong> {generatedPuzzle.category}</span>
                            <span><strong className="text-purple-200">Difficulty:</strong> {generatedPuzzle.difficulty || aiDifficulty}</span>
                            <div>
                                <span className="text-purple-200 font-semibold block mb-1">Phrase Preview</span>
                                <div className="font-mono text-sm md:text-base text-white bg-black/40 rounded px-3 py-2">
                                    {gameMode === 'TEACHER' ? generatedPuzzle.phrase : maskPhrase(generatedPuzzle.phrase)}
                                </div>
                                {gameMode === 'STUDENT' && (
                                    <span className="text-[10px] text-gray-500 italic mt-1 block">Hidden in student mode. Switch to Teacher to reveal.</span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-2">
                            <button
                                onClick={() => onSetPuzzle(generatedPuzzle)}
                                className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                            >
                                <Play size={16} /> Use Puzzle
                            </button>
                            <button
                                onClick={() => {
                                    setGeneratedPuzzle(null);
                                    setErrorMsg('');
                                }}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                            >
                                <Trash2 size={16} /> Clear Preview
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedPuzzleId(generatedPuzzle.id);
                                    setMode('LIBRARY');
                                }}
                                className="flex-1 bg-purple-700/60 hover:bg-purple-600 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                            >
                                <BookOpen size={16} /> View in Library
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500 italic">
                            This puzzle has been added to your library automatically.
                        </p>
                    </div>
                )}
            </div>
        )}

        {/* MANUAL TAB */}
        {mode === 'MANUAL' && (
            <div className="p-4 space-y-3">
                <h3 className="text-sm font-bold text-indigo-300">{editingId ? "Edit Puzzle" : "Create Custom Puzzle"}</h3>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Category</label>
                        <select 
                             value={manualCategory} 
                             onChange={(e) => setManualCategory(e.target.value)}
                             className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-2 text-white text-sm mb-2"
                        >
                            <option value="">Select or Type...</option>
                            {PUZZLE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input 
                            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-2 text-white text-sm focus:border-indigo-500 outline-none"
                            value={manualCategory}
                            onChange={(e) => setManualCategory(e.target.value.toUpperCase())}
                            placeholder="Or type custom category..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Phrase</label>
                        <input 
                            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-2 text-white text-sm focus:border-indigo-500 outline-none font-mono uppercase"
                            value={manualPhrase}
                            onChange={(e) => setManualPhrase(e.target.value.toUpperCase())}
                            placeholder="THE PHRASE"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Difficulty</label>
                        <select 
                            value={manualDifficulty} 
                            onChange={(e) => setManualDifficulty(e.target.value as DifficultyLevel)}
                            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-2 text-white text-sm"
                        >
                            {Object.values(DifficultyLevel).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
                        <button 
                            onClick={handleSaveToLibrary}
                            disabled={!manualCategory || !manualPhrase}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded flex items-center justify-center gap-1 text-sm"
                        >
                            <Save size={14} /> Save
                        </button>
                        <button 
                            onClick={handleManualSubmit}
                            disabled={!manualCategory || !manualPhrase}
                            className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded text-sm"
                        >
                            {editingId ? "Update & Play" : "Play Now"}
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* Floating Play Bar for Library */}
        {mode === 'LIBRARY' && selectedPuzzleId && (
            <div className="absolute bottom-0 left-0 right-0 bg-gray-900 border-t border-teal-500 p-2 md:p-3 flex gap-2 shadow-2xl z-20 animate-in slide-in-from-bottom-5">
                 <button 
                    onClick={() => setSelectedPuzzleId(null)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-bold text-sm"
                 >
                    Cancel
                 </button>
                 <button 
                    onClick={() => {
                        const puzzle = savedPuzzles.find(p => p.id === selectedPuzzleId);
                        if (puzzle) onSetPuzzle(puzzle);
                    }}
                    className="flex-[2] bg-teal-600 hover:bg-teal-500 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 text-sm md:text-base"
                 >
                    <Play fill="currentColor" size={16} /> PLAY
                 </button>
            </div>
        )}

      </div>
    </div>
  );
};

interface SolveModalProps {
  phrase: string;
  onSubmit: (guess: string) => void;
  onCancel: () => void;
  aiSettings: AiSettings;
  gameMode: GameMode;
  onOpenSettings: () => void;
}

export const SolveModal = ({ phrase, onSubmit, onCancel, aiSettings, gameMode, onOpenSettings }: SolveModalProps) => {
    // Existing SolveModal code remains unchanged but passed through to avoid XML bloat if not modifying logic 
    // ... (re-implementing full to be safe)
    const [guess, setGuess] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [recordingError, setRecordingError] = useState('');
    const [aiRejection, setAiRejection] = useState(false);
    const [hasRecording, setHasRecording] = useState(false);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const recordingBlobRef = useRef<Blob | null>(null);

    const baseIconUrl = (((import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL) ?? '/').replace(/\/?$/, '/');
    const micIconSrc = `${baseIconUrl}icons/mic_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg`;
    const sendIconSrc = `${baseIconUrl}icons/send_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg`;
    const clearIconSrc = `${baseIconUrl}icons/restart_alt_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg`;

    useEffect(() => {
        if (recordingError) {
            const timer = setTimeout(() => setRecordingError(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [recordingError]);

    const cleanupRecording = () => {
        if (mediaRecorderRef.current) {
            if (mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
            mediaRecorderRef.current.onstop = null;
            mediaRecorderRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        chunksRef.current = [];
        recordingBlobRef.current = null;
        setIsRecording(false);
        setHasRecording(false);
    };

    useEffect(() => {
        return () => {
            cleanupRecording();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startRecording = async () => {
        if (isProcessing || isRecording) return;

        // Check for Google API Key
        if (!aiSettings.googleApiKey) {
            onOpenSettings();
            return;
        }

        cleanupRecording();
        setAiRejection(false); 
        setRecordingError('');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const recorder = new MediaRecorder(stream);
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                chunksRef.current = [];

                if (blob.size < 2000) {
                    recordingBlobRef.current = null;
                    setHasRecording(false);
                    setRecordingError("Recording too short. Tap record and speak clearly.");
                } else {
                    recordingBlobRef.current = blob;
                    setHasRecording(true);
                }

                if (mediaStreamRef.current) {
                    mediaStreamRef.current.getTracks().forEach(track => track.stop());
                    mediaStreamRef.current = null;
                }
            };

            recorder.start();
            mediaRecorderRef.current = recorder;
            setIsRecording(true);
        } catch (err) {
            setRecordingError("Mic Access Denied");
            cleanupRecording();
        }
    };

    const stopRecording = () => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
            setIsRecording(false);
            return;
        }

        mediaRecorderRef.current.stop();
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        setIsRecording(false);
    };

    const convertBlobToBase64 = async (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error('Failed to read audio data'));
            reader.onloadend = () => {
                const result = reader.result;
                if (typeof result === 'string') {
                    const base64 = result.split(',')[1];
                    resolve(base64);
                } else {
                    reject(new Error('Unexpected audio format'));
                }
            };
            reader.readAsDataURL(blob);
        });
    };

    const handleSendRecording = async () => {
        if (!hasRecording || isRecording || isProcessing) return;

        if (!aiSettings.googleApiKey) {
            onOpenSettings();
            return;
        }

        const blob = recordingBlobRef.current;
        if (!blob || blob.size === 0) {
            setRecordingError('No recording available. Record again.');
            setHasRecording(false);
            return;
        }

        setIsProcessing(true);
        setRecordingError('');
        setAiRejection(false);

        try {
            const base64String = await convertBlobToBase64(blob);
            const isMatch = await checkVoiceSolution(aiSettings, base64String, phrase);

            if (isMatch) {
                submitAndClose(phrase);
            } else {
                if (gameMode === 'TEACHER') {
                    setAiRejection(true);
                } else {
                    setRecordingError('Incorrect. Try typing.');
                }
            }
        } catch (error) {
            console.error('Voice analysis error', error);
            setRecordingError('Could not send audio. Try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const submitAndClose = (value: string) => {
        cleanupRecording();
        onSubmit(value);
    };

    const handleCancel = () => {
        cleanupRecording();
        onCancel();
    };

    const clearRecording = () => {
        cleanupRecording();
        setAiRejection(false);
        setRecordingError('');
    };

    const canRecord = !(gameMode === 'STUDENT' && recordingError === "Incorrect. Try typing.");
    const voiceDisabled = !canRecord || isProcessing;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
             <div className="bg-game-panel border-2 border-game-accent p-4 md:p-6 rounded-xl w-[95%] max-w-lg shadow-2xl relative overflow-hidden">
                <h3 className="text-lg md:text-xl font-display text-game-accent mb-3 md:mb-4 text-center">Solve the Puzzle</h3>
                
                {recordingError && (
                    <div className="absolute top-2 left-0 right-0 text-center animate-bounce z-50">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                            {recordingError}
                        </span>
                    </div>
                )}

                <input 
                    autoFocus
                    className="w-full text-center text-lg md:text-2xl uppercase bg-white text-black font-bold p-2 md:p-4 rounded mb-3 md:mb-4 focus:outline-none focus:ring-4 focus:ring-indigo-500"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    placeholder="TYPE YOUR ANSWER"
                />

                <div className="flex flex-col gap-4 md:gap-5">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col items-center gap-2">
                            <button
                                type="button"
                                onClick={isRecording ? stopRecording : startRecording}
                                disabled={voiceDisabled}
                                className={`h-14 w-14 md:h-16 md:w-16 rounded-full flex items-center justify-center transition-all border-2 border-red-500/30 shadow-lg
                                    ${voiceDisabled ? 'bg-red-900/30 text-red-200/50 cursor-not-allowed opacity-70' : isRecording ? 'bg-red-600 text-white shadow-[0_0_25px_rgba(248,113,113,0.8)] animate-pulse' : 'bg-red-900 text-red-100 hover:bg-red-800'}`}
                                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                                title={isRecording ? 'Stop recording' : 'Start recording'}
                            >
                                <img
                                    src={micIconSrc}
                                    alt=""
                                    className={`h-6 w-6 ${voiceDisabled ? 'opacity-60' : ''}`}
                                />
                            </button>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Record</span>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <button
                                type="button"
                                onClick={handleSendRecording}
                                disabled={!hasRecording || isRecording || isProcessing}
                                className={`h-14 w-14 md:h-16 md:w-16 rounded-full flex items-center justify-center transition-all border-2 border-emerald-400/30 shadow-lg
                                    ${(!hasRecording || isRecording || isProcessing) ? 'bg-emerald-900/30 text-emerald-200/50 cursor-not-allowed opacity-70' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}
                                aria-label="Send recording to AI"
                                title="Send recording to AI"
                            >
                                {isProcessing ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <img
                                        src={sendIconSrc}
                                        alt=""
                                        className={`h-6 w-6 ${(!hasRecording || isRecording) ? 'opacity-60' : ''}`}
                                    />
                                )}
                            </button>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Send</span>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <button
                                type="button"
                                onClick={clearRecording}
                                disabled={!hasRecording && !isRecording && !isProcessing}
                                className={`h-14 w-14 md:h-16 md:w-16 rounded-full flex items-center justify-center transition-all border-2 border-gray-400/20 shadow-lg
                                    ${(!hasRecording && !isRecording && !isProcessing) ? 'bg-gray-800/40 text-gray-400/60 cursor-not-allowed opacity-70' : 'bg-gray-700 text-gray-100 hover:bg-gray-600'}`}
                                aria-label="Clear recording"
                                title="Clear recording"
                            >
                                <img
                                    src={clearIconSrc}
                                    alt=""
                                    className={`h-6 w-6 ${(!hasRecording && !isRecording && !isProcessing) ? 'opacity-60' : ''}`}
                                />
                            </button>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Clear</span>
                        </div>
                    </div>

                    <p className="text-center text-xs text-gray-400">
                        Tap to record, send the clip for AI scoring, or clear and retry. Audio is discarded automatically when the modal closes.
                    </p>

                    {aiRejection && gameMode === 'TEACHER' && (
                        <div className="bg-red-900/30 border border-red-500/50 rounded p-3 animate-in fade-in slide-in-from-top-2">
                             <div className="flex items-center gap-2 text-red-300 mb-3 justify-center text-sm md:text-base font-bold">
                                <AlertCircle size={16} />
                                <span>AI didn't catch that.</span>
                             </div>
                             
                             <div className="grid grid-cols-2 gap-2">
                                <button 
                                    onClick={() => submitAndClose("INCORRECT_ANSWER_OVERRIDE")}
                                    className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded flex items-center justify-center gap-1 text-xs md:text-sm"
                                >
                                    <XCircle size={14} /> Mark Incorrect
                                </button>
                                <button 
                                    onClick={() => submitAndClose(phrase)} 
                                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded flex items-center justify-center gap-1 text-xs md:text-sm"
                                >
                                    <CheckCircle2 size={14} /> Teacher Override
                                </button>
                             </div>
                        </div>
                    )}

                    <div className="flex gap-2 md:gap-4 mt-2">
                        <button onClick={handleCancel} className="flex-1 bg-gray-600 py-2 md:py-3 rounded font-bold text-white hover:bg-gray-500 text-sm md:text-base">Cancel</button>
                        <button onClick={() => submitAndClose(guess)} className="flex-1 bg-game-accent text-game-dark py-2 md:py-3 rounded font-bold hover:bg-yellow-400 text-sm md:text-base">SOLVE</button>
                    </div>
                </div>
             </div>
        </div>
    );
};
