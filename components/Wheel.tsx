
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
  debugOptions?: {
    slowSpin?: boolean;
    manualControl?: boolean;
    manualStepDeg?: number;
    onSegmentChange?: (payload: {
      segment: WheelSegment;
      pointerAngle: number;
      rotation: number;
      degreesFromZero: number;
      timestamp: number;
    }) => void;
  };
}

type ProcessedSegment = WheelSegment & {
  startAngle: number;
  endAngle: number;
  midAngle: number;
  sweep: number;
};

const ANGLE_EPSILON = 0.0001;
const MANUAL_VELOCITY_DECEL = 0.92;
const MANUAL_VELOCITY_THRESHOLD = 0.01;
const MANUAL_FRAME_INTERVAL = 16;

const normalizeAngle = (angle: number): number => {
  const wrapped = angle % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
};

const resolveSegmentByPointer = (pointerAngle: number, segments: ProcessedSegment[]): ProcessedSegment => {
  const adjustedAngle = normalizeAngle(pointerAngle + ANGLE_EPSILON);

  for (const segment of segments) {
    const start = normalizeAngle(segment.startAngle);
    const end = normalizeAngle(segment.endAngle);

    if (start <= end) {
      if (adjustedAngle >= start && adjustedAngle < end) return segment;
    } else {
      if (adjustedAngle >= start || adjustedAngle < end) return segment;
    }
  }

  return segments[0];
};

const getPointerMetrics = (rotation: number) => {
  const normalizedRotation = normalizeAngle(rotation);
  const degreesFromZero = normalizedRotation;
  const pointerAngle = normalizeAngle(360 - degreesFromZero);
  return { pointerAngle, degreesFromZero };
};

export const Wheel: React.FC<WheelProps> = ({
  isSpinning,
  onSpinEnd,
  isFullscreen,
  onTriggerSpin,
  onClick,
  debugOptions
}) => {
  const [rotation, setRotation] = useState(0);
  const rotationRef = useRef(0);
  
  // --- Geometry Calculation ---
  // Memoize the geometry so we don't recalculate on every frame
  const processedSegments = useMemo<ProcessedSegment[]>(() => {
    const total = WHEEL_SEGMENTS.reduce((sum, segment) => sum + (segment.weight || 1), 0);
    let currentAngle = 0;

    return WHEEL_SEGMENTS.map(segment => {
      const weight = segment.weight || 1;
      const sweep = (weight / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sweep;
      const midAngle = startAngle + sweep / 2;

      currentAngle += sweep;

      return {
        ...segment,
        startAngle,
        endAngle,
        midAngle,
        sweep
      };
    });
  }, []); // Constant segments

  // Refs to track audio throttling
  const lastTickRef = useRef<string | null>(null);

  const slowSpin = debugOptions?.slowSpin ?? false;
  const manualControl = debugOptions?.manualControl ?? false;
  const manualStep = debugOptions?.manualStepDeg ?? 0.25;
  const animationDuration = slowSpin ? 40000 : 4000;
  const telemetryCallback = debugOptions?.onSegmentChange;
  const tickIntervalDelay = slowSpin ? 40 : 20;
  const manualVelocityRef = useRef(0);
  const manualLoopRef = useRef<number | null>(null);

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  useEffect(() => {
    if (isSpinning) {
      if (manualControl) {
        lastTickRef.current = null;
        return;
      }
      soundService.init(); // Ensure audio context is ready
      
      const randomOffset = Math.random() * 360;
      const extraSpins = slowSpin
        ? 360 + Math.random() * 180
        : 1080 + Math.random() * 720;
      const startRotation = rotationRef.current;
      const newRotation = startRotation + extraSpins + randomOffset;

      setRotation(newRotation);

      lastTickRef.current = null;
      const startTime = performance.now();
      const tickInterval = window.setInterval(() => {
        const now = performance.now();
        const elapsed = now - startTime;

        const progress = Math.min(elapsed / animationDuration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentRotation = startRotation + (newRotation - startRotation) * easedProgress;
        const { pointerAngle, degreesFromZero } = getPointerMetrics(currentRotation);
        const currentSegment = resolveSegmentByPointer(pointerAngle, processedSegments);

        if (currentSegment.id !== lastTickRef.current) {
          soundService.playTick();
          lastTickRef.current = currentSegment.id;
        }

        if (telemetryCallback) {
          telemetryCallback({
            segment: currentSegment,
            pointerAngle,
            rotation: currentRotation,
            degreesFromZero,
            timestamp: now
          });
        }

        if (progress >= 1) {
          window.clearInterval(tickInterval);
        }
      }, tickIntervalDelay);

      const finishTimeout = window.setTimeout(() => {
        window.clearInterval(tickInterval);

        const { pointerAngle, degreesFromZero } = getPointerMetrics(newRotation);
        const landingSegment = resolveSegmentByPointer(pointerAngle, processedSegments);

        if (telemetryCallback) {
          const now = performance.now();
          telemetryCallback({
            segment: landingSegment,
            pointerAngle,
            rotation: newRotation,
            degreesFromZero,
            timestamp: now
          });
        }

        onSpinEnd(landingSegment);
      }, animationDuration);

      return () => {
        window.clearInterval(tickInterval);
        window.clearTimeout(finishTimeout);
      };
    }
  }, [isSpinning, manualControl, processedSegments, slowSpin, telemetryCallback, animationDuration, tickIntervalDelay, onSpinEnd]);

  useEffect(() => {
    if (!manualControl || !isSpinning) return;

    soundService.init();
    lastTickRef.current = null;

    const handleManualKey = (event: KeyboardEvent) => {
      const now = performance.now();
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const step = event.shiftKey ? manualStep * 10 : manualStep;
        manualVelocityRef.current += step * direction;

        if (manualLoopRef.current === null) {
          const runLoop = () => {
            const velocity = manualVelocityRef.current;
            if (Math.abs(velocity) < MANUAL_VELOCITY_THRESHOLD) {
              manualVelocityRef.current = 0;
              manualLoopRef.current = null;
              return;
            }

            rotationRef.current += velocity;
            setRotation(rotationRef.current);

            manualVelocityRef.current *= MANUAL_VELOCITY_DECEL;

            const { pointerAngle, degreesFromZero } = getPointerMetrics(rotationRef.current);
            const currentSegment = resolveSegmentByPointer(pointerAngle, processedSegments);

            if (currentSegment.id !== lastTickRef.current) {
              soundService.playTick();
              lastTickRef.current = currentSegment.id;
            }

            telemetryCallback?.({
              segment: currentSegment,
              pointerAngle,
              rotation: rotationRef.current,
              degreesFromZero,
              timestamp: performance.now()
            });

            manualLoopRef.current = window.setTimeout(runLoop, MANUAL_FRAME_INTERVAL);
          };

          manualLoopRef.current = window.setTimeout(runLoop, MANUAL_FRAME_INTERVAL);
        }
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (manualLoopRef.current !== null) {
          window.clearTimeout(manualLoopRef.current);
          manualLoopRef.current = null;
        }
        manualVelocityRef.current = 0;
        const { pointerAngle, degreesFromZero } = getPointerMetrics(rotationRef.current);
        const landingSegment = resolveSegmentByPointer(pointerAngle, processedSegments);
        telemetryCallback?.({
          segment: landingSegment,
          pointerAngle,
          rotation: rotationRef.current,
          degreesFromZero,
          timestamp: now
        });
        onSpinEnd(landingSegment);
      }
    };

    window.addEventListener('keydown', handleManualKey);
    return () => {
      window.removeEventListener('keydown', handleManualKey);
      if (manualLoopRef.current !== null) {
        window.clearTimeout(manualLoopRef.current);
        manualLoopRef.current = null;
      }
      manualVelocityRef.current = 0;
    };
  }, [manualControl, isSpinning, manualStep, processedSegments, telemetryCallback, onSpinEnd]);

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
          transition: (!manualControl && isSpinning)
            ? `transform ${animationDuration}ms cubic-bezier(0.15, 0, 0.15, 1)`
            : 'none'
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
