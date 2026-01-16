
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
        style={{ ...(maskStyle ?? {}), fontSize: 'min(3.6vmin, 1.1rem)' }}
        className={`font-display tracking-wide whitespace-nowrap leading-tight transition-colors ${isActive ? 'text-white font-semibold' : 'text-indigo-200/90'} ${
          isActive && isOverflowing ? 'animate-scroll-name inline-block' : ''
        }`}
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
      <aside className="grid h-full w-full grid-rows-[auto,1fr] overflow-hidden border-r border-white/10 bg-game-panel">
        <div
          className="flex items-center justify-end gap-[calc(var(--keyboard-padding)*0.6)] border-b border-white/10 bg-game-dark/85"
          style={{ padding: 'calc(var(--keyboard-padding) * 0.75) calc(var(--keyboard-padding) * 0.9)' }}
        >
          <span className="sr-only">Players sidebar controls</span>
          <button
            type="button"
            onClick={handleOpenNewGameModal}
            className="flex items-center justify-center rounded-md border border-red-400/35 bg-red-900/20 text-white transition-colors duration-150 hover:bg-red-800/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/70"
            style={{ width: 'var(--sidebar-control-size)', height: 'var(--sidebar-control-size)' }}
          >
            <img
              src={newGameIconSrc}
              alt=""
              aria-hidden
              style={{ width: 'min(2.8vmin, 1rem)', height: 'min(2.8vmin, 1rem)' }}
            />
            <span className="sr-only">Start new game</span>
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center justify-center rounded-md border border-indigo-400/35 bg-indigo-900/25 text-white transition-colors duration-150 hover:bg-indigo-800/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200/70"
            style={{ width: 'var(--sidebar-control-size)', height: 'var(--sidebar-control-size)' }}
          >
            <img
              src={settingsIconSrc}
              alt=""
              aria-hidden
              style={{ width: 'min(2.8vmin, 1rem)', height: 'min(2.8vmin, 1rem)' }}
            />
            <span className="sr-only">Open settings</span>
          </button>
        </div>

        <div className="min-h-0 overflow-hidden">
          <div className="flex h-full flex-col gap-[calc(var(--keyboard-padding)*0.5)] overflow-y-auto px-[calc(var(--keyboard-padding)*0.8)] pb-[calc(var(--keyboard-padding)*1.1)] pt-[calc(var(--keyboard-padding)*0.8)] scrollbar-hide min-h-0">
            {players.map((player, index) => {
              const isActive = index === currentPlayerIndex;
              return (
                <div
                  key={player.id}
                  className={`relative flex min-h-0 flex-col rounded-lg border border-white/12 bg-indigo-950/40 px-[calc(var(--shell-padding)*0.6)] py-[calc(var(--shell-padding)*0.7)] shadow-[0_8px_18px_rgba(8,11,33,0.35)] transition-colors ${
                    isActive ? 'border-game-accent/70 bg-indigo-900/70 shadow-[0_0_18px_rgba(255,215,0,0.18)]' : 'opacity-90'
                  }`}
                >
                  {isActive && <span className="pointer-events-none absolute top-0 left-0 h-full w-1 bg-game-accent" />}

                  <div className="relative z-10 flex items-center gap-[calc(var(--shell-padding)*0.4)] pl-[calc(var(--shell-padding)*0.3)] pr-[calc(var(--shell-padding)*0.2)]">
                    <ScrollableName name={player.name} isActive={isActive} />
                    {isActive && (
                      <span
                        className="animate-pulse rounded-full bg-green-400 shadow-[0_0_6px_#22c55e]"
                        style={{ width: 'min(1.6vmin, 0.45rem)', height: 'min(1.6vmin, 0.45rem)' }}
                      />
                    )}
                  </div>

                  <div className="relative z-10 mt-[calc(var(--shell-padding)*0.4)] grid grid-cols-2 gap-[calc(var(--shell-padding)*0.4)] rounded-md bg-black/35 px-[calc(var(--shell-padding)*0.4)] py-[calc(var(--shell-padding)*0.4)] text-[min(2.1vmin,0.65rem)] uppercase tracking-[0.24em] text-indigo-300">
                    <div className="flex flex-col gap-[calc(var(--shell-padding)*0.25)] border-r border-white/10 pr-[calc(var(--shell-padding)*0.4)]">
                      <div className="flex items-center gap-[calc(var(--shell-padding)*0.2)] font-display text-[min(1.8vmin,0.6rem)] uppercase tracking-[0.16em] text-indigo-300">
                        <Coins
                          className="text-yellow-300"
                          style={{ width: 'min(2.1vmin, 0.7rem)', height: 'min(2.1vmin, 0.7rem)' }}
                        />
                        <span>Bank</span>
                      </div>
                      <div
                        className="font-mono font-bold text-yellow-200 leading-tight"
                        style={{ fontSize: 'min(3vmin, 1rem)' }}
                      >
                        ${player.totalScore.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex flex-col gap-[calc(var(--shell-padding)*0.25)] pl-[calc(var(--shell-padding)*0.4)]">
                      <div className="font-display text-[min(1.8vmin,0.6rem)] uppercase tracking-[0.16em] text-indigo-300">Round</div>
                      <div
                        className={`font-mono font-bold leading-tight ${isActive ? 'text-white' : 'text-indigo-100/90'}`}
                        style={{ fontSize: 'min(3vmin, 1rem)' }}
                      >
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
