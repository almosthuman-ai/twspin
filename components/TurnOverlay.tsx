
import React from 'react';

interface TurnOverlayProps {
  playerName: string;
  isVisible: boolean;
}

export const TurnOverlay: React.FC<TurnOverlayProps> = ({ playerName, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none overflow-hidden">
      {/* Background Backdrop - 60% opacity black with fade */}
      <div className="absolute inset-0 bg-black/60 animate-bg-fade" />

      <div className="relative flex flex-col items-center justify-center w-full px-12 md:px-24 animate-turn-sequence">
        
        {/* Main Text - Gold, Strong Shadow, Padding via Container */}
        <h1 
            className="text-4xl md:text-6xl lg:text-7xl font-display text-game-accent text-center drop-shadow-[0_10px_10px_rgba(0,0,0,0.9)]"
            style={{ 
                textShadow: '0 0 30px rgba(255, 215, 0, 0.4)' // Soft gold glow
            }}
        >
            It's {playerName}'s Turn!
        </h1>
        
        {/* Subtext */}
        <p className="mt-6 text-xl md:text-3xl font-bold text-white bg-indigo-900/90 px-8 py-3 rounded-full border border-game-accent/50 backdrop-blur-md shadow-2xl">
            Spin the Wheel or Solve!
        </p>
      </div>
      
      <style>{`
        .animate-turn-sequence {
            animation: turn-popup 2.5s ease-in-out forwards;
        }

        .animate-bg-fade {
            animation: bg-fade 2.5s ease-in-out forwards;
        }

        @keyframes turn-popup {
            0% { 
                opacity: 0; 
                transform: scale(0.5); 
            }
            10% { 
                opacity: 1; 
                transform: scale(1.1); 
            }
            20% { 
                transform: scale(1); 
            }
            85% { 
                opacity: 1; 
                transform: scale(1); 
                filter: blur(0px);
            }
            100% { 
                opacity: 0; 
                transform: scale(1.1); 
                filter: blur(4px);
            }
        }

        @keyframes bg-fade {
            0% { opacity: 0; }
            10% { opacity: 1; }
            85% { opacity: 1; }
            100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};
