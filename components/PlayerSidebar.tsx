
import React, { useRef, useEffect, useState } from 'react';
import { Player } from '../types';
import { Coins, Users } from 'lucide-react';

interface PlayerSidebarProps {
  players: Player[];
  currentPlayerIndex: number;
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
                className={`font-display tracking-wide text-sm md:text-lg whitespace-nowrap leading-tight
                    ${isActive ? 'text-white font-bold' : 'text-indigo-200'}
                    ${(isActive && isOverflowing) ? 'animate-scroll-name inline-block' : 'truncate'}
                `}
            >
                {name}
            </div>
        </div>
    );
};

export const PlayerSidebar: React.FC<PlayerSidebarProps> = ({ players, currentPlayerIndex }) => {
  return (
    <div className="h-full w-full bg-game-panel border-r border-white/10 flex flex-col overflow-hidden">
      {/* Compact Header */}
      <div className="py-2 border-b border-white/10 bg-game-dark shadow-md z-10 shrink-0">
        <h2 className="text-xs md:text-sm font-display text-game-accent uppercase tracking-wider text-center flex items-center justify-center gap-1">
           <Users size={14} /> Players
        </h2>
      </div>
      
      {/* Scrollable list, but optimized to not need scrolling for 5 items on most screens */}
      <div className="flex-1 p-1 space-y-1 overflow-y-auto scrollbar-hide flex flex-col">
        {players.map((player, index) => {
          const isActive = index === currentPlayerIndex;
          return (
            <div 
              key={player.id}
              className={`
                relative flex flex-col justify-center flex-1 min-h-[60px] max-h-[120px] transition-all duration-300 rounded-lg overflow-hidden border
                ${isActive 
                  ? 'bg-indigo-900/90 border-game-accent shadow-[0_0_10px_rgba(255,215,0,0.3)] z-10' 
                  : 'bg-indigo-950/40 border-white/5 opacity-80'}
              `}
            >
              {isActive && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-game-accent" />
              )}
              
              <div className="px-2 py-1 flex flex-col h-full justify-center gap-0.5">
                {/* Name Row */}
                <div className="flex items-center gap-2 pl-1 mb-1">
                    <ScrollableName name={player.name} isActive={isActive} />
                    {isActive && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e] shrink-0" />}
                </div>

                {/* Scores Row - Compact */}
                <div className="grid grid-cols-2 gap-1 bg-black/30 rounded p-1">
                    
                    {/* Banked */}
                    <div className="flex flex-col border-r border-white/10 px-1">
                         <div className="flex items-center gap-1 text-[8px] uppercase text-indigo-400 font-bold tracking-tighter">
                            <Coins size={10} className="text-yellow-500" /> Bank
                         </div>
                         <div className="font-mono text-yellow-400 font-bold text-xs md:text-sm lg:text-base leading-none">
                            ${player.totalScore.toLocaleString()}
                         </div>
                    </div>

                    {/* Round */}
                    <div className="flex flex-col px-1">
                        <div className="text-[8px] uppercase text-indigo-400 font-bold tracking-tighter">
                            Round
                        </div>
                        <div className={`font-mono font-bold text-sm md:text-base lg:text-lg leading-none ${isActive ? 'text-white' : 'text-indigo-400'}`}>
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
  );
};
