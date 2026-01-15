
import React from 'react';

interface StopwatchProps {
  timeLeft: number;
  maxTime?: number;
}

export const Stopwatch: React.FC<StopwatchProps> = ({ timeLeft, maxTime = 30 }) => {
  // Calculate percentage for hand rotation
  // 360 degrees / maxTime * (maxTime - timeLeft)
  const rotation = (360 / maxTime) * (maxTime - timeLeft);

  // Determine color and animation state
  let colorClass = "text-white stroke-white";
  let handColor = "#ffffff";
  let animateClass = "";
  let shadowClass = "drop-shadow-lg";

  if (timeLeft <= 10) {
    colorClass = "text-red-500 stroke-red-500";
    handColor = "#ef4444"; // red-500
    // Custom rapid flash using inline style or utility if available
    animateClass = "animate-[pulse_0.5s_cubic-bezier(0.4,0,0.6,1)_infinite]";
    shadowClass = "drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]";
  } else if (timeLeft <= 20) {
    colorClass = "text-yellow-400 stroke-yellow-400";
    handColor = "#facc15"; // yellow-400
    shadowClass = "drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]";
  }

  return (
    <div className={`relative w-full h-full transition-all duration-300 ${animateClass} ${shadowClass}`}>
       {/* Stopwatch Body (SVG) */}
       <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          {/* Top Button */}
          <rect x="42" y="0" width="16" height="10" rx="2" fill="#333" stroke="white" strokeWidth="2" />
          <rect x="46" y="10" width="8" height="6" fill="#555" />
          
          {/* Angled Side Button */}
          <g transform="rotate(45 50 50)">
             <rect x="44" y="-8" width="12" height="8" rx="1" fill="#333" stroke="white" strokeWidth="1" />
          </g>

          {/* Main Case Outer */}
          <circle cx="50" cy="55" r="42" fill="#1a103c" stroke="currentColor" strokeWidth="3" className={`${colorClass} transition-colors duration-300`} />
          
          {/* Inner Dial Face */}
          <circle cx="50" cy="55" r="36" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1 4" className={`${colorClass} opacity-50`} />

          {/* Ticks */}
          {[0, 90, 180, 270].map(deg => (
             <line 
                key={deg}
                x1="50" y1="25" x2="50" y2="30" 
                stroke="currentColor" 
                strokeWidth="2" 
                transform={`rotate(${deg} 50 55)`}
                className={colorClass}
             />
          ))}

          {/* Digital Time Display (Center) */}
          <text 
            x="50" 
            y="75" 
            textAnchor="middle" 
            className={`font-mono font-bold text-3xl ${colorClass} transition-colors duration-300`}
            style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}
          >
            {timeLeft}
          </text>

          {/* Hand (Rotates) */}
          <g transform={`rotate(${rotation} 50 55)`} className="transition-transform duration-1000 ease-linear">
             <line x1="50" y1="55" x2="50" y2="25" stroke={handColor} strokeWidth="2" strokeLinecap="round" />
             <circle cx="50" cy="55" r="3" fill={handColor} />
             <circle cx="50" cy="25" r="2" fill={handColor} />
          </g>
       </svg>
    </div>
  );
};
