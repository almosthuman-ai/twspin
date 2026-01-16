
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
        className={`font-display tracking-wide text-[clamp(0.95rem,2.2vmin,1.45rem)] whitespace-nowrap leading-tight transition-colors
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
      <aside className="relative flex h-full w-full flex-col overflow-visible">
        <div className="pointer-events-none absolute inset-0 border border-white/12 bg-gradient-to-b from-indigo-950/70 via-indigo-950/40 to-slate-950/55 backdrop-blur-xl" />
        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-center justify-between gap-[clamp(0.6rem,1.8vmin,1rem)] px-[clamp(1.1rem,3.1vmin,1.9rem)] pt-[clamp(1.1rem,3.1vmin,1.9rem)] pb-[clamp(0.8rem,2.3vmin,1.4rem)]" style={{ flex: '0 0 10%' }}>
            <button
              type="button"
              onClick={handleOpenNewGameModal}
              className="group relative flex h-[clamp(2.85rem,6.5vmin,3.6rem)] w-[clamp(2.85rem,6.5vmin,3.6rem)] items-center justify-center rounded-full border border-red-400/35 bg-red-700/10 text-white shadow-[0_0_28px_rgba(239,68,68,0.35)] transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-[0_0_42px_rgba(239,68,68,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950"
            >
              <img
                src={newGameIconSrc}
                alt="New Game"
                className="h-[clamp(1.35rem,3.2vmin,1.75rem)] w-[clamp(1.35rem,3.2vmin,1.75rem)]"
              />
              <span className="sr-only">Start new game</span>
            </button>
            <button
              type="button"
              onClick={onOpenSettings}
              className="group relative flex h-[clamp(2.85rem,6.5vmin,3.6rem)] w-[clamp(2.85rem,6.5vmin,3.6rem)] items-center justify-center rounded-full border border-indigo-400/35 bg-indigo-900/20 text-white shadow-[0_0_28px_rgba(79,70,229,0.35)] transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-[0_0_42px_rgba(79,70,229,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200/80 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950"
            >
              <img
                src={settingsIconSrc}
                alt="Settings"
                className="h-[clamp(1.35rem,3.2vmin,1.75rem)] w-[clamp(1.35rem,3.2vmin,1.75rem)]"
              />
              <span className="sr-only">Open settings</span>
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="flex h-full flex-col gap-[clamp(0.7rem,2vmin,1.1rem)] px-[clamp(0.9rem,2.6vmin,1.5rem)] pb-[clamp(0.9rem,2.6vmin,1.5rem)]">
              {players.map((player, index) => {
                const isActive = index === currentPlayerIndex;
                return (
                  <div
                    key={player.id}
                    className={`relative flex min-h-0 flex-1 flex-col justify-between rounded-[1.35rem] border border-white/12 bg-white/[0.04] px-[clamp(0.8rem,2.1vmin,1.2rem)] py-[clamp(0.75rem,2vmin,1.15rem)] shadow-[0_16px_32px_rgba(7,10,33,0.35)] backdrop-blur-md transition-colors ${
                      isActive ? 'border-game-accent/70 shadow-[0_0_42px_rgba(255,215,0,0.32)]' : ''
                    }`}
                    style={{ flex: '0 0 16%' }}
                  >
                    {isActive && (
                      <span className="pointer-events-none absolute inset-y-[clamp(0.55rem,1.7vmin,0.95rem)] left-[clamp(0.45rem,1.2vmin,0.7rem)] w-[clamp(0.22rem,0.7vmin,0.35rem)] rounded-full bg-game-accent/95 blur-[0.5px] opacity-95" />
                    )}

                    <div className="relative z-10 flex items-center gap-[clamp(0.45rem,1.3vmin,0.75rem)] pl-[clamp(0.45rem,1.3vmin,0.75rem)] pr-[clamp(0.45rem,1.3vmin,0.75rem)]">
                      <ScrollableName name={player.name} isActive={isActive} />
                    </div>

                    <div className="relative z-10 grid flex-1 grid-cols-1 gap-[clamp(0.35rem,1vmin,0.6rem)] px-[clamp(0.45rem,1.3vmin,0.75rem)] text-[clamp(0.52rem,1.4vh,0.7rem)] uppercase tracking-[0.28em] text-indigo-200/75">
                      <div className="flex items-center justify-between gap-[clamp(0.35rem,1vmin,0.55rem)]">
                        <span className="font-semibold">Round</span>
                        <span
                          className={`font-mono font-semibold leading-tight ${isActive ? 'text-white' : 'text-indigo-100/90'}`}
                          style={{ fontSize: 'clamp(0.9rem, 2.2vh, 1.35rem)' }}
                        >
                          ${player.roundScore.toString()}
                        </span>
                      </div>
                      <div className="h-px w-full bg-white/15" />
                      <div className="flex items-center justify-between gap-[clamp(0.35rem,1vmin,0.55rem)]">
                        <span className="font-semibold">Bank</span>
                        <span
                          className="font-mono font-semibold leading-tight text-yellow-200"
                          style={{ fontSize: 'clamp(0.9rem, 2.2vh, 1.35rem)' }}
                        >
                          ${player.totalScore.toString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
              <h2 className="font-display text-[clamp(1.1rem,3.2vmin,1.5rem)] uppercase tracking-[0.3em] text-white">Start New Game?</h2>
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
