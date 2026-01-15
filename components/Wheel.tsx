
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { WHEEL_SEGMENTS } from '../constants';
import { WheelSegment } from '../types';
import { soundService } from '../services/soundService';

interface WheelProps {
  isSpinning: boolean;
  onSpinEnd: (segment: WheelSegment) => void;
  isFullscreen: boolean;
  onTriggerSpin?: () => void;
  onClick?: () => void;
}

export const Wheel: React.FC<WheelProps> = ({ isSpinning, onSpinEnd, isFullscreen, onTriggerSpin, onClick }) => {
  const [rotation, setRotation] = useState(0);
  
  // --- Geometry Calculation ---
  // Memoize the geometry so we don't recalculate on every frame
  const { processedSegments, totalWeight } = useMemo(() => {
      const total = WHEEL_SEGMENTS.reduce((sum, s) => sum + (s.weight || 1), 0);
      let currentAngle = 0;
      
      const mapped = WHEEL_SEGMENTS.map(s => {
          const weight = s.weight || 1;
          const sweep = (weight / total) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + sweep;
          const midAngle = startAngle + (sweep / 2);
          
          currentAngle += sweep;
          
          return {
              ...s,
              startAngle,
              endAngle,
              midAngle,
              sweep
          };
      });
      return { processedSegments: mapped, totalWeight: total };
  }, []); // Constant segments

  // Refs to track audio throttling
  const lastTickRef = useRef(-1);

  useEffect(() => {
    if (isSpinning) {
      soundService.init(); // Ensure audio context is ready
      
      const randomOffset = Math.floor(Math.random() * 360);
      const extraSpins = 1080 + Math.floor(Math.random() * 720); 
      const newRotation = rotation + extraSpins + randomOffset;
      const duration = 4000;
      
      setRotation(newRotation);

      // --- Sound Logic ---
      const startTime = Date.now();
      const startRot = rotation;
      
      const tickInterval = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTime;
        
        if (elapsed >= duration) {
            clearInterval(tickInterval);
            return;
        }

        // Cubic bezier approximation
        const t = elapsed / duration;
        const ease = 1 - Math.pow(1 - t, 3);
        const currentRot = startRot + (newRotation - startRot) * ease;
        
        // Determine which segment is currently at the top (0 degrees / 12 o'clock)
        const degreesFromZero = currentRot % 360;
        const pointerAngle = (360 - degreesFromZero) % 360;
        
        // Find segment containing this angle
        const currentSegment = processedSegments.find(s => 
            pointerAngle >= s.startAngle && pointerAngle < s.endAngle
        );

        if (currentSegment && currentSegment.id !== lastTickRef.current.toString()) {
            soundService.playTick();
            lastTickRef.current = parseInt(currentSegment.id);
        }
      }, 20);

      // --- Spin End Logic ---
      setTimeout(() => {
        clearInterval(tickInterval);
        
        // Precise Landing Calculation
        const finalDegreesFromZero = newRotation % 360;
        const finalPointerAngle = (360 - finalDegreesFromZero) % 360;
        
        const landingSegment = processedSegments.find(s => 
            finalPointerAngle >= s.startAngle && finalPointerAngle < s.endAngle
        );
        
        // Fallback for precision edge cases (like exactly 360/0)
        const result = landingSegment || processedSegments[0];
        onSpinEnd(result);
      }, duration); 
    }
  }, [isSpinning]);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (isFullscreen) {
        e.stopPropagation();
        if (!isSpinning && onTriggerSpin) {
            onTriggerSpin();
        }
    } else {
        if (onClick) onClick();
    }
  };

  return (
    <div 
      className={`
        relative flex items-center justify-center transition-all duration-300
        ${isFullscreen ? 'w-full h-full' : 'w-full h-full cursor-pointer hover:scale-105'}
      `}
      onClick={handleInteraction}
    >
      <div className={`
         relative flex items-center justify-center transition-all duration-500
         ${isFullscreen ? 'h-[70vh] w-[70vh] max-w-[90vw] aspect-square' : 'w-full h-full'}
      `}>
          {/* Pointer - Top Center */}
          <div className={`
            absolute left-1/2 -translate-x-1/2 z-20 w-0 h-0 
            border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent 
            border-t-[30px] border-t-white drop-shadow-xl
            ${isFullscreen ? '-top-6 scale-125 lg:scale-150' : '-top-2 border-l-[6px] border-r-[6px] border-t-[12px]'}
          `} />

          {/* The Wheel Container */}
          <div
            style={{ 
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0, 0.15, 1)' : 'none'
            }}
            className="w-full h-full rounded-full border-[6px] border-white shadow-2xl overflow-hidden bg-white relative"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {processedSegments.map((seg) => {
                const x1 = 50 + 50 * Math.cos(Math.PI * seg.startAngle / 180);
                const y1 = 50 + 50 * Math.sin(Math.PI * seg.startAngle / 180);
                const x2 = 50 + 50 * Math.cos(Math.PI * seg.endAngle / 180);
                const y2 = 50 + 50 * Math.sin(Math.PI * seg.endAngle / 180);

                const largeArc = seg.sweep > 180 ? 1 : 0;

                const pathData = `M50,50 L${x1},${y1} A50,50 0 ${largeArc},1 ${x2},${y2} Z`;

                // Calculate font size based on sweep angle to fit text in thinner wedges
                const fontSize = seg.sweep < 20 ? 3 : 5; 

                return (
                  <g key={seg.id}>
                    <path d={pathData} fill={seg.color} stroke="white" strokeWidth="0.5" />
                    <text
                      x="50"
                      y="50"
                      fill={seg.textColor}
                      fontSize={fontSize}
                      fontWeight="bold"
                      textAnchor="end"
                      transform={`rotate(${seg.midAngle} 50 50) translate(46, ${fontSize * 0.4})`}
                    >
                      {seg.label}
                    </text>
                  </g>
                );
              })}
            </svg>
            
            {/* Center Cap */}
            <div className={`
              absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white flex items-center justify-center shadow-inner z-10
              bg-gradient-to-br from-indigo-600 to-indigo-900
              ${isFullscreen ? 'w-[20%] h-[20%] animate-pulse' : 'w-1/4 h-1/4'}
            `}>
              {isFullscreen && (
                <div className="text-2xl md:text-3xl lg:text-5xl font-bold text-white font-display tracking-widest">
                  {isSpinning ? "" : "SPIN"}
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  );
};
