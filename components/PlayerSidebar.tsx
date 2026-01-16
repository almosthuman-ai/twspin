
import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ModalSurface } from './modals/shared';
import { Player } from '../types';

interface PlayerSidebarProps {
  players: Player[];
  currentPlayerIndex: number;
  onRequestNewGame: () => void;
  onOpenSettings: () => void;
}

// Helper component for scrolling name
const ScrollableName: React.FC<{ name: string; isActive: boolean }> = ({ name, isActive }) => {
    const textRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

    useEffect(() => {
        if (textRef.current && containerRef.current) {
            setIsOverflowing(textRef.current.scrollWidth > containerRef.current.clientWidth);
        }
    }, [name]);

    return (
        <div ref={containerRef} className="flex-1 overflow-hidden relative" style={{ minWidth: 0 }}>
             <style>{`
                @keyframes scroll-text {
                    0%, 20% { transform: translateX(0); }
                    80%, 100% { transform: translateX(calc(-100% + 100%)); }
                }
                .animate-scroll-name {
                    animation: scroll-text 5s linear infinite alternate;
                }
             `}</style>
            <div 
                ref={textRef}
                className={`font-display tracking-wide text-[clamp(0.95rem,2.2vmin,1.45rem)] whitespace-nowrap leading-tight
                    ${isActive ? 'text-white font-semibold' : 'text-indigo-200/90'}
                    ${(isActive && isOverflowing) ? 'animate-scroll-name inline-block' : 'truncate'}
                `}
            >
                {name}
            </div>
        </div>
    );
};

export const PlayerSidebar: React.FC<PlayerSidebarProps> = ({ 
    players, 
    currentPlayerIndex,
    onRequestNewGame,
    onOpenSettings
}) => {

  const [isNewGameModalOpen, setIsNewGameModalOpen] = useState(false);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const baseIconUrl = (((import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL) ?? '/').replace(/\/?$/, '/');
  const newGameIconSrc = `${baseIconUrl}icons/restart_alt_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg`;
  const settingsIconSrc = `${baseIconUrl}icons/settings_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg`;

  useEffect(() => {
    if (!isNewGameModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsNewGameModalOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isNewGameModalOpen]);

  useEffect(() => {
    if (isNewGameModalOpen) {
      cancelButtonRef.current?.focus();
    }
  }, [isNewGameModalOpen]);

  const handleOpenNewGameModal = () => setIsNewGameModalOpen(true);
  const handleCloseNewGameModal = () => setIsNewGameModalOpen(false);
  const handleConfirmNewGame = () => {
    setIsNewGameModalOpen(false);
    onRequestNewGame();
  };

  return (
    <>
      <div className="h-full w-full bg-game-panel flex flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-[clamp(0.8rem,2.4vmin,1.4rem)] py-[clamp(0.6rem,2vmin,1rem)] shrink-0">
          <button
          onClick={handleOpenNewGameModal}
          className="group relative flex h-[clamp(2.45rem,5.3vmin,3.2rem)] w-[clamp(2.45rem,5.3vmin,3.2rem)] items-center justify-center rounded-full bg-red-600/85 hover:bg-red-500 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
        >
          <img
            src={newGameIconSrc}
            alt="New Game"
            className="w-[clamp(1.5rem,4vmin,2.5rem)]"
          />
          <span className="sr-only">Start new game</span>
        </button>
        <button
          onClick={onOpenSettings}
          className="group relative flex h-[clamp(2.45rem,5.3vmin,3.2rem)] w-[clamp(2.45rem,5.3vmin,3.2rem)] items-center justify-center rounded-full bg-slate-800/85 hover:bg-slate-600 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"
        >
          <img
            src={settingsIconSrc}
            alt="Settings"
            className="w-[clamp(1.5rem,4vmin,2.5rem)]"
          />
          <span className="sr-only">Open settings</span>
        </button>
      </div>

      <div className="flex-1 px-[clamp(0.75rem,2.4vmin,1.4rem)] pb-[clamp(0.75rem,2.4vmin,1.4rem)] space-y-[clamp(0.6rem,2vmin,1rem)] overflow-y-auto scrollbar-hide flex flex-col">
        {players.map((player, index) => {
          const isActive = index === currentPlayerIndex;
          return (
            <div 
              key={player.id}
              className={`
                relative flex flex-col justify-center flex-1 min-h-[clamp(3.75rem,9.5vmin,6.5rem)] transition-all duration-300 rounded-2xl overflow-hidden backdrop-blur-lg
                ${isActive 
                  ? 'bg-indigo-900/75 shadow-[0_0_22px_rgba(255,215,0,0.35)] z-10 outline outline-[clamp(2px,0.35vmin,5px)] outline-game-accent/80' 
                  : 'bg-indigo-950/40 opacity-80 outline outline-[clamp(1px,0.25vmin,4px)] outline-white/10'}
              `}
            >
              {isActive && (
                <div className="absolute top-0 left-0 w-[clamp(6px,0.5vmin,12px)] h-full bg-game-accent" />
              )}
              
              <div className="px-[clamp(0.5rem,1.8vmin,1rem)] py-[clamp(0.4rem,1.6vmin,0.85rem)] flex flex-col h-full justify-center gap-[clamp(0.25rem,1vmin,0.55rem)]">
                {/* Name Row */}
                <div className="flex items-center gap-[clamp(0.3rem,1vmin,0.6rem)] pl-[clamp(0.2rem,0.8vmin,0.45rem)] mb-[clamp(0.2rem,0.9vmin,0.45rem)]">
                    <ScrollableName name={player.name} isActive={isActive} />
                    {isActive && <div className="w-[clamp(0.35rem,1.2vmin,0.5rem)] h-[clamp(0.35rem,1.2vmin,0.5rem)] rounded-full bg-green-500 animate-pulse shadow-[0_0_7px_#22c55e] shrink-0" />}
                </div>

                {/* Scores Row - Compact */}
                <div className="grid grid-cols-2 gap-[clamp(0.25rem,1vmin,0.5rem)] bg-black/25 rounded-xl p-[clamp(0.45rem,1.5vmin,0.8rem)]">
                    
                    {/* Banked */}
                    <div className="flex flex-col border-r border-white/15 pr-[clamp(0.25rem,1vmin,0.6rem)] gap-[clamp(0.15rem,0.5vmin,0.35rem)]">
                         <div className="flex items-center gap-[clamp(0.25rem,0.8vmin,0.5rem)] text-[clamp(0.5rem,1.2vmin,0.75rem)] uppercase text-indigo-200 font-semibold tracking-[0.3em]">
                            <span className="inline-flex h-[clamp(0.9rem,2.1vmin,1.1rem)] w-[clamp(0.9rem,2.1vmin,1.1rem)] items-center justify-center rounded-full bg-yellow-400/90 text-black font-bold text-[clamp(0.55rem,1.4vmin,0.75rem)]">$</span> Bank
                         </div>
                         <div className="font-mono text-yellow-200 font-semibold text-[clamp(0.85rem,2.1vmin,1.25rem)] leading-none">
                            ${player.totalScore.toLocaleString()}
                         </div>
                    </div>

                    {/* Round */}
                    <div className="flex flex-col pl-[clamp(0.25rem,1vmin,0.6rem)] gap-[clamp(0.15rem,0.5vmin,0.35rem)]">
                        <div className="text-[clamp(0.5rem,1.2vmin,0.75rem)] uppercase text-indigo-200 font-semibold tracking-[0.3em]">
                            Round
                        </div>
                        <div className={`font-mono font-semibold text-[clamp(0.9rem,2.2vmin,1.35rem)] leading-none ${isActive ? 'text-white' : 'text-indigo-100/90'}`}>
                            ${player.roundScore.toLocaleString()}
                        </div>
                    </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </div>

      {isNewGameModalOpen && typeof document !== 'undefined' && createPortal(
        <ModalSurface
          overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          panelClassName="bg-game-panel border border-white/20 rounded-2xl shadow-2xl w-full max-w-sm h-fit overflow-hidden"
        >
          <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-2 text-center">
              <h2 className="font-display text-white text-[clamp(1.1rem,3.2vmin,1.5rem)] tracking-[0.3em] uppercase">Start New Game?</h2>
              <p className="text-indigo-100/80 text-sm leading-relaxed">
                Are you sure? Current progress for all players will be reset.
              </p>
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <button
                ref={cancelButtonRef}
                onClick={handleCloseNewGameModal}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-white/30 text-indigo-100 hover:bg-white/10 transition-colors font-display text-xs tracking-[0.3em] uppercase"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmNewGame}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-red-600 text-white shadow-[0_0_18px_rgba(239,68,68,0.55)] hover:bg-red-500 transition-colors font-display text-xs tracking-[0.3em] uppercase"
              >
                Yes, Start New Game
              </button>
            </div>
          </div>
        </ModalSurface>,
        document.body
      )}
    </>
  );
};
