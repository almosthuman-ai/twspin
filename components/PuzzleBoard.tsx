
import React, { useMemo, useEffect, useLayoutEffect, useState, useRef } from 'react';
import { soundService } from '../services/soundService';

interface PuzzleBoardProps {
  phrase: string;
  category: string;
  guessedLetters: string[];
  revealed?: boolean;
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const PuzzleBoard: React.FC<PuzzleBoardProps> = ({ 
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
  useIsomorphicLayoutEffect(() => {
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
    const SAFE_MARGIN = 16; // Pixels to subtract from container for safety

    const availableW = Math.max(boardSize.width - SAFE_MARGIN, 0);
    if (availableW <= 0) {
        return { layout: [], tileWidth: 0, tileHeight: 0, fontSize: 0 };
    }

    const measuredHeight = boardSize.height - SAFE_MARGIN;
    const fallbackHeight = Math.max(availableW / 1.65, availableW * 0.45, 240);
    const availableH = measuredHeight > 0 ? measuredHeight : fallbackHeight;

    // Constants
    const TILE_ASPECT = 0.75; // Width / Height. Taller than wide.
    const ROW_GAP_FACTOR = 0.2; // 20% of Tile Height
    const BOARD_PAD_X_FACTOR = 1.0; // 1 Tile Width total padding (0.5 left + 0.5 right)
    const BOARD_PAD_Y_FACTOR = 0.5; // 0.5 Tile Width total padding (approx 0.35 height) -> let's map to width for simplicity

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
    const maxTileSize = Math.min(120, boardSize.width / 8);
    if (bestConfig.tileWidth > maxTileSize) {
        bestConfig.tileWidth = maxTileSize;
        bestConfig.tileHeight = maxTileSize / TILE_ASPECT;
        bestConfig.fontSize = bestConfig.tileHeight * 0.65;
    }

    return bestConfig;

  }, [boardSize, phrase, words]);

  const { layout, tileWidth, tileHeight, fontSize } = layoutCalculation;
  const edgeInset = tileWidth > 0 ? Math.min(Math.max(tileWidth * 0.18, 6), 12) : 8;
  const verticalInset = tileHeight > 0 ? Math.min(Math.max(tileHeight * 0.12, 4), 10) : 6;
  const rowGap = tileHeight > 0 ? Math.min(Math.max(tileHeight * 0.16, 4), 10) : 6;
  let globalCharIndex = 0;

  return (
    <div className="w-full h-full flex flex-col items-center justify-start pt-[clamp(0.15rem,0.5vmin,0.35rem)] overflow-hidden">
      <div className="shrink-0 z-10 max-h-[15%] flex items-center mb-[clamp(0.1rem,0.4vmin,0.25rem)]">
        <h3 className="text-game-accent font-display text-[clamp(0.7rem,2.1vmin,1.15rem)] uppercase tracking-[0.25em] font-semibold truncate max-w-[80vw]">
          {category}
        </h3>
      </div>

      {/* Board Container - The resizable area */}
      <div ref={containerRef} className="flex-1 w-full flex items-center justify-center min-h-0 overflow-hidden relative touch-pan-constraint">
        
        {tileWidth > 0 && (
            <div 
                className="flex flex-col items-center justify-center"
                style={{ 
                    paddingLeft: `${edgeInset}px`,
                    paddingRight: `${edgeInset}px`,
                    paddingTop: `${verticalInset}px`,
                    paddingBottom: `${verticalInset}px`,
                    gap: `${rowGap}px`,
                    maxWidth: 'min(100%, 140vh)',
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
                                                fontSize: `${Math.min(fontSize, tileHeight * 0.75)}px`
                                            }}
                                            className={`
                                                relative flex items-center justify-center font-display font-semibold border-[clamp(2px,0.35vmin,5px)] shadow-md transition-all duration-300 rounded-md
                                                ${isHighlighted 
                                                    ? 'bg-cyan-400 border-cyan-200 scale-110 z-10 shadow-[0_0_20px_rgba(34,211,238,0.8)]' 
                                                    : 'bg-white border-white/20'}
                                                ${showContent ? 'text-black' : 'text-transparent'}
                                            `}
                                        >
                                            {/* Cover */}
                                            {isLetter(char) && !showContent && !isHighlighted && (
                                                <div className="absolute inset-0 bg-green-600 rounded-md shadow-inner" />
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

export default PuzzleBoard;
