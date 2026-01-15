
import React, { useMemo, useEffect, useState, useRef } from 'react';
import { soundService } from '../services/soundService';

interface PuzzleBoardProps {
  phrase: string;
  category: string;
  guessedLetters: string[];
  revealed?: boolean;
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
}

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({ 
  phrase, 
  category, 
  guessedLetters, 
  revealed = false,
  onAnimationComplete,
  onAnimationStart
}) => {
  const words = useMemo(() => phrase.split(" "), [phrase]);
  const isLetter = (char: string) => /^[A-Z]$/.test(char);
  
  // State for animation control
  const [highlightedIndices, setHighlightedIndices] = useState<Set<number>>(new Set());
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  
  // Responsive sizing state
  const containerRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });

  const prevGuessedRef = useRef<string[]>([]);
  const prevRevealedRef = useRef(false);
  const animatingRef = useRef(false);

  // --- Resize Observer ---
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateSize = () => {
        if(containerRef.current) {
            // Use getBoundingClientRect for sub-pixel precision
            const rect = containerRef.current.getBoundingClientRect();
            setBoardSize({
                width: rect.width,
                height: rect.height
            });
        }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, []);

  // --- Animation Logic ---
  useEffect(() => {
    const prevGuessed = prevGuessedRef.current;
    const newGuesses = guessedLetters.filter(l => !prevGuessed.includes(l));
    const isNowRevealed = revealed && !prevRevealedRef.current;
    
    if (newGuesses.length === 0 && !isNowRevealed) return;
    
    if (onAnimationStart) onAnimationStart();
    animatingRef.current = true;
    
    const targetIndices: number[] = [];
    if (isNowRevealed) {
        phrase.split('').forEach((char, idx) => {
            if (isLetter(char) && !revealedIndices.has(idx)) targetIndices.push(idx);
        });
    } else {
        newGuesses.forEach(letter => {
            phrase.split('').forEach((char, idx) => {
                if (char === letter) targetIndices.push(idx);
            });
        });
    }

    if (targetIndices.length === 0) {
        prevGuessedRef.current = guessedLetters;
        prevRevealedRef.current = revealed;
        if (onAnimationComplete) onAnimationComplete();
        return;
    }

    let delay = 0;
    const HIGHLIGHT_STEP_DELAY = 400;
    const REVEAL_STEP_DELAY = 400;
    const PHASE_GAP = 500;

    targetIndices.forEach((idx) => {
        setTimeout(() => {
            soundService.playDing();
            setHighlightedIndices(prev => new Set(prev).add(idx));
        }, delay);
        delay += HIGHLIGHT_STEP_DELAY;
    });

    delay += PHASE_GAP;

    targetIndices.forEach((idx) => {
        setTimeout(() => {
            soundService.playReveal();
            setHighlightedIndices(prev => {
                const next = new Set(prev);
                next.delete(idx);
                return next;
            });
            setRevealedIndices(prev => new Set(prev).add(idx));
        }, delay);
        delay += REVEAL_STEP_DELAY;
    });

    setTimeout(() => {
        prevGuessedRef.current = guessedLetters;
        prevRevealedRef.current = revealed;
        animatingRef.current = false;
        if (onAnimationComplete) onAnimationComplete();
    }, delay + 200);

  }, [guessedLetters, revealed, phrase, onAnimationStart, onAnimationComplete]);


  // --- BEST FIT LAYOUT ALGORITHM ---
  
  const layoutCalculation = useMemo(() => {
    if (boardSize.width === 0 || boardSize.height === 0) {
        return { layout: [], tileWidth: 0, tileHeight: 0, fontSize: 0 };
    }

    // Constants
    const TILE_ASPECT = 0.75; // Width / Height. Taller than wide.
    const ROW_GAP_FACTOR = 0.2; // 20% of Tile Height
    const BOARD_PAD_X_FACTOR = 1.0; // 1 Tile Width total padding (0.5 left + 0.5 right)
    const BOARD_PAD_Y_FACTOR = 0.5; // 0.5 Tile Width total padding (approx 0.35 height) -> let's map to width for simplicity
    const SAFE_MARGIN = 16; // Pixels to subtract from container for safety

    const availableW = boardSize.width - SAFE_MARGIN;
    const availableH = boardSize.height - SAFE_MARGIN;

    // Helper to generate a layout for a given maxCols
    const generateGreedyLayout = (maxCols: number) => {
        const rows: string[][] = [];
        let currentRow: string[] = [];
        let currentLen = 0;
        
        words.forEach(word => {
            const space = currentRow.length > 0 ? 1 : 0; // 1 unit space
            const needed = space + word.length;
            
            if (currentLen + needed <= maxCols) {
                currentRow.push(word);
                currentLen += needed;
            } else {
                if (currentRow.length > 0) rows.push(currentRow);
                currentRow = [word];
                currentLen = word.length;
            }
        });
        if (currentRow.length > 0) rows.push(currentRow);
        return rows;
    };

    // Determine search range for maxCols
    // Minimum columns is the length of the longest word (plus maybe 2 for aesthetic breathing room?)
    // Let's strict bound to longest word.
    const longestWordLen = Math.max(...words.map(w => w.length));
    const minCols = Math.max(longestWordLen, 8); // Never go narrower than 8 cols (Wheel standardish)
    const maxColsSearch = 20; // Don't go wider than 20 (too small tiles)

    let bestConfig = {
        layout: [] as string[][],
        tileWidth: 0,
        tileHeight: 0,
        fontSize: 0
    };

    // Iterate through all possible column widths to find the one that results in the LARGEST tiles
    for (let cols = minCols; cols <= maxColsSearch; cols++) {
        const layout = generateGreedyLayout(cols);
        const numRows = layout.length;

        // Calculate actual utilized columns in this layout (might be less than `cols` limit)
        const actualMaxCols = Math.max(...layout.map(row => 
            row.reduce((acc, w) => acc + w.length, 0) + Math.max(0, row.length - 1)
        ));

        // Math for Tile Width (T)
        // 1. Width Constraint:
        // TotalW = (ActualCols * T) + (BOARD_PAD_X_FACTOR * T)
        // TotalW = T * (ActualCols + BOARD_PAD_X_FACTOR)
        // T_w = availableW / (ActualCols + BOARD_PAD_X_FACTOR)
        const tWidth = availableW / (actualMaxCols + BOARD_PAD_X_FACTOR);

        // 2. Height Constraint:
        // TileHeight (H) = T / TILE_ASPECT
        // TotalH = (NumRows * H) + ((NumRows - 1) * H * ROW_GAP_FACTOR) + (T * BOARD_PAD_Y_FACTOR * ??? Let's just use fixed padding logic)
        // Let's convert BoardPadY to H units. If PadY is 0.5 T, and T = 0.75 H, then PadY = 0.5 * 0.75 H = 0.375 H.
        // TotalH = H * (NumRows + (NumRows - 1)*0.2 + 0.5) roughly?
        // Let's stick to T units:
        // H = T / 0.75
        // TotalH = (NumRows * T/0.75) + ((NumRows-1) * T/0.75 * 0.2) + (T * 0.5)
        // TotalH = T * [ (NumRows/0.75) + ((NumRows-1)*0.2/0.75) + 0.5 ]
        // T_h = availableH / [ ... ]
        
        const heightFactor = (numRows / TILE_ASPECT) + ((Math.max(0, numRows - 1) * ROW_GAP_FACTOR) / TILE_ASPECT) + 0.5;
        const tHeight = availableH / heightFactor;

        // The valid tile width is the minimum of width-constrained or height-constrained
        const validT = Math.min(tWidth, tHeight);

        if (validT > bestConfig.tileWidth) {
            bestConfig = {
                layout,
                tileWidth: validT,
                tileHeight: validT / TILE_ASPECT,
                fontSize: (validT / TILE_ASPECT) * 0.65
            };
        }
    }

    // Cap max size to prevent absurdity on huge screens with short words
    if (bestConfig.tileWidth > 80) {
        bestConfig.tileWidth = 80;
        bestConfig.tileHeight = 80 / TILE_ASPECT;
        bestConfig.fontSize = bestConfig.tileHeight * 0.65;
    }

    return bestConfig;

  }, [boardSize, phrase, words]);

  const { layout, tileWidth, tileHeight, fontSize } = layoutCalculation;
  let globalCharIndex = 0;

  return (
    <div className="w-full h-full flex flex-col items-center justify-start pt-1 overflow-hidden">
      {/* Category Header - Compact */}
      <div className="bg-game-accent px-4 py-1 rounded-full mb-2 shadow-[0_0_15px_rgba(255,215,0,0.4)] shrink-0 z-10 max-h-[15%] flex items-center">
        <h3 className="text-game-dark font-display text-xs md:text-sm lg:text-base uppercase tracking-[0.15em] font-bold truncate max-w-[80vw]">
          {category}
        </h3>
      </div>

      {/* Board Container - The resizable area */}
      <div ref={containerRef} className="flex-1 w-full flex items-center justify-center p-1 min-h-0 overflow-hidden relative">
        
        {tileWidth > 0 && (
            <div 
                className="bg-game-panel rounded-xl md:rounded-2xl border-2 md:border-4 border-indigo-500 shadow-2xl perspective-board flex flex-col items-center justify-center transition-all duration-300"
                style={{ 
                    // Explicitly apply padding calculated in the math (0.5 T on each side)
                    paddingLeft: `${tileWidth * 0.5}px`,
                    paddingRight: `${tileWidth * 0.5}px`,
                    paddingTop: `${tileWidth * 0.25}px`,
                    paddingBottom: `${tileWidth * 0.25}px`,
                    gap: `${tileHeight * 0.2}px`, // Explicit Row Gap
                    maxWidth: '100%',
                    maxHeight: '100%'
                }}
            >
            {layout.map((rowWords, rowIndex) => (
                <div key={rowIndex} className="flex items-center justify-center">
                    {rowWords.map((word, wIndex) => (
                        <React.Fragment key={`${rowIndex}-${wIndex}`}>
                             {/* Render Word */}
                             <div className="flex">
                                {word.split("").map((char, cIndex) => {
                                    // Sync global index
                                    while (globalCharIndex < phrase.length && phrase[globalCharIndex] !== char) {
                                        globalCharIndex++;
                                    }
                                    const myIndex = globalCharIndex;
                                    globalCharIndex++; 

                                    const isHighlighted = highlightedIndices.has(myIndex);
                                    const isRevealed = revealedIndices.has(myIndex);
                                    const showContent = !isLetter(char) || isRevealed;

                                    if (!isLetter(char) && char !== '-' && char !== "'") return null;

                                    return (
                                        <div 
                                            key={`${rowIndex}-${wIndex}-${cIndex}`}
                                            style={{ 
                                                width: `${tileWidth}px`,
                                                height: `${tileHeight}px`, 
                                                fontSize: `${fontSize}px`
                                            }}
                                            className={`
                                                relative flex items-center justify-center font-display font-bold border-2 shadow-md transition-all duration-300 rounded-sm md:rounded-md
                                                ${isHighlighted 
                                                    ? 'bg-cyan-400 border-cyan-200 scale-110 z-10 shadow-[0_0_20px_rgba(34,211,238,0.8)]' 
                                                    : 'bg-white border-white/20'}
                                                ${showContent ? 'text-black' : 'text-transparent'}
                                            `}
                                        >
                                            {/* Cover */}
                                            {isLetter(char) && !showContent && !isHighlighted && (
                                                <div className="absolute inset-0 bg-green-600 rounded-sm md:rounded-md shadow-inner" />
                                            )}
                                            {/* Char */}
                                            <span className={`transition-opacity duration-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
                                                {char}
                                            </span>
                                        </div>
                                    );
                                })}
                             </div>
                             
                             {/* Render Space (Gap) if not last word in row */}
                             {wIndex < rowWords.length - 1 && (
                                 <div 
                                     style={{ width: `${tileWidth}px`, height: `${tileHeight}px` }} 
                                     className="bg-transparent" // Invisible tile for spacing
                                 />
                             )}
                        </React.Fragment>
                    ))}
                </div>
            ))}
            </div>
        )}
      </div>
    </div>
  );
};
