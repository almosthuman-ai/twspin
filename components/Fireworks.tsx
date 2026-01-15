
import React, { useEffect, useRef } from 'react';
import { soundService } from '../services/soundService';

export const Fireworks: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      decay: number;

      constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 3; // Fast explosion
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.color = color;
        this.decay = Math.random() * 0.02 + 0.01;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // Gravity
        this.vx *= 0.95; // Air resistance
        this.vy *= 0.95;
        this.alpha -= this.decay;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    let particles: Particle[] = [];
    const colors = ['#FFD700', '#FF4444', '#00CC66', '#2962FF', '#FF00FF', '#00FFFF', '#FFFFFF'];

    const createExplosion = (x: number, y: number) => {
      soundService.playFirework();
      const color = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < 60; i++) {
        particles.push(new Particle(x, y, color));
      }
      // Add some white sparkles for brightness
      for (let i = 0; i < 20; i++) {
        particles.push(new Particle(x, y, '#FFFFFF'));
      }
    };

    // Auto launch loop
    let lastLaunch = 0;
    
    const loop = (timestamp: number) => {
      // Clear with trail effect for dynamic look
      // Use destination-out to fade existing pixels to transparent, preserving the background visibility
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';

      // Launch random fireworks every 400-800ms
      if (timestamp - lastLaunch > 500) {
         const x = Math.random() * canvas.width;
         const y = Math.random() * (canvas.height * 0.5) + (canvas.height * 0.1);
         createExplosion(x, y);
         lastLaunch = timestamp;
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.alpha <= 0) {
            particles.splice(i, 1);
        }
      }

      animationId = requestAnimationFrame(loop);
    };

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();
    animationId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[100]" />;
};
