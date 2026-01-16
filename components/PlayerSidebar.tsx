
import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Coins } from 'lucide-react';
import { ModalSurface } from './modals/shared';
import { Player } from '../types';

interface PlayerSidebarProps {
  players: Player[];
  currentPlayerIndex: number;
  onRequestNewGame: () => void;
  onOpenSettings: () => void;
}

const ScrollableName: React.FC<{ name: string; isActive: boolean }> = ({ name, isActive }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (textRef.current && containerRef.current) {
      setIsOverflowing(textRef.current.scrollWidth > containerRef.current.clientWidth);
    }
  }, [name]);

  const maskStyle = isOverflowing
    ? {
        WebkitMaskImage: 'linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)',
        maskImage: 'linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)',
      }
    : undefined;

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      <style>{`
          @keyframes scroll-text {
            0%, 25% { transform: translateX(0); }
            75%, 100% { transform: translateX(calc(-100% + 100%)); }
          }
          .animate-scroll-name {
            animation: scroll-text 9s ease-in-out infinite alternate;
          }
        `}</style>
      <div
        ref={textRef}
        style={maskStyle}
        className={`font-display tracking-wide text-base sm:text-lg whitespace-nowrap leading-tight transition-colors
          ${isActive ? 'text-white font-semibold' : 'text-indigo-200/90'}
          ${isActive && isOverflowing ? 'animate-scroll-name inline-block' : ''}
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
  onOpenSettings,
}) => {
  const [isNewGameModalOpen, setIsNewGameModalOpen] = useState(false);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const baseIconUrl = (((import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL) ?? '/').replace(/\/?$/, '/');
  const newGameIconSrc = `${baseIconUrl}icons/new-game.svg`;
  const settingsIconSrc = `${baseIconUrl}icons/settings-wheel.svg`;

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
      <aside className="flex h-full w-full flex-col overflow-hidden border-r border-white/10 bg-game-panel">
        <div className="flex items-center justify-end gap-2 border-b border-white/10 bg-game-dark/85 px-4 py-2">
          <span className="sr-only">Players sidebar controls</span>
          <button
            type="button"
            onClick={handleOpenNewGameModal}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-red-400/35 bg-red-900/20 text-white transition-colors duration-150 hover:bg-red-800/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/70"
          >
            <img src={newGameIconSrc} alt="" aria-hidden className="h-4 w-4" />
            <span className="sr-only">Start new game</span>
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-indigo-400/35 bg-indigo-900/25 text-white transition-colors duration-150 hover:bg-indigo-800/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200/70"
          >
            <img src={settingsIconSrc} alt="" aria-hidden className="h-4 w-4" />
            <span className="sr-only">Open settings</span>
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="flex h-full flex-col gap-2 overflow-y-auto px-3 pb-3 pt-2 scrollbar-hide">
            {players.map((player, index) => {
              const isActive = index === currentPlayerIndex;
              return (
                <div
                  key={player.id}
                  className={`relative flex min-h-[64px] flex-col rounded-lg border border-white/12 bg-indigo-950/40 px-3 py-3 shadow-[0_8px_18px_rgba(8,11,33,0.35)] transition-colors ${
                    isActive ? 'border-game-accent/70 bg-indigo-900/70 shadow-[0_0_18px_rgba(255,215,0,0.18)]' : 'opacity-90'
                  }`}
                >
                  {isActive && <span className="pointer-events-none absolute top-0 left-0 h-full w-1 bg-game-accent" />}

                  <div className="relative z-10 flex items-center gap-2 pl-2 pr-1">
                    <ScrollableName name={player.name} isActive={isActive} />
                    {isActive && <span className="h-2 w-2 animate-pulse rounded-full bg-green-400 shadow-[0_0_6px_#22c55e]" />}
                  </div>

                  <div className="relative z-10 mt-2 grid grid-cols-2 gap-2 rounded-md bg-black/35 px-2 py-2 text-[0.65rem] uppercase tracking-[0.24em] text-indigo-300">
                    <div className="flex flex-col gap-1 border-r border-white/10 pr-2">
                      <div className="flex items-center gap-1 font-display text-[0.6rem] uppercase tracking-[0.16em] text-indigo-300">
                        <Coins size={12} className="text-yellow-300" />
                        <span>Bank</span>
                      </div>
                      <div className="font-mono text-sm font-bold text-yellow-200 leading-tight sm:text-base">
                        ${player.totalScore.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 pl-2">
                      <div className="font-display text-[0.6rem] uppercase tracking-[0.16em] text-indigo-300">Round</div>
                      <div className={`font-mono text-sm font-bold leading-tight sm:text-base ${isActive ? 'text-white' : 'text-indigo-100/90'}`}>
                        ${player.roundScore.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {isNewGameModalOpen && typeof document !== 'undefined' && createPortal(
        <ModalSurface
          overlayClassName="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          panelClassName="h-fit w-full max-w-sm overflow-hidden rounded-2xl border border-white/20 bg-game-panel shadow-2xl"
        >
          <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-2 text-center">
              <h2 className="font-display text-lg uppercase tracking-[0.3em] text-white">Start New Game?</h2>
              <p className="text-sm leading-relaxed text-indigo-100/80">
                Are you sure? Current progress for all players will be reset.
              </p>
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <button
                ref={cancelButtonRef}
                onClick={handleCloseNewGameModal}
                className="w-full rounded-full border border-white/30 px-5 py-2.5 font-display text-xs uppercase tracking-[0.3em] text-indigo-100 transition-colors hover:bg-white/10 sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmNewGame}
                className="w-full rounded-full bg-red-600 px-5 py-2.5 font-display text-xs uppercase tracking-[0.3em] text-white shadow-[0_0_18px_rgba(239,68,68,0.55)] transition-colors hover:bg-red-500 sm:w-auto"
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
