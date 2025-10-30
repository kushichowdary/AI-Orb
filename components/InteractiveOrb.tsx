import React, { useRef, useEffect, useCallback } from 'react';
import { ConnectionState } from '../types';

interface InteractiveOrbProps {
  connectionState: ConnectionState;
  isSpeaking: boolean;
  onClick: () => void;
  disabled: boolean;
}

class Bubble {
    x: number;
    y: number;
    r: number;
    vx: number;
    vy: number;
    angle: number;
    orbit: number;
    
    constructor(radius: number) {
        this.angle = Math.random() * Math.PI * 2;
        this.orbit = Math.random() * 50 + 20;
        this.x = 0; // Relative to center
        this.y = 0; // Relative to center
        this.r = radius;
        this.vx = (Math.random() - 0.5) * 0.1;
        this.vy = (Math.random() - 0.5) * 0.1;
    }
    
    update(speedFactor: number) {
        this.angle += 0.01 * speedFactor;
        this.x = Math.cos(this.angle) * this.orbit;
        this.y = Math.sin(this.angle) * this.orbit;
        this.orbit += this.vx * (isSpeaking ? 2 : 1);
        if (this.orbit < 20 || this.orbit > 70) {
            this.vx *= -1;
        }
    }
}

let isSpeaking = false; // Module-level variable for update function access

export const InteractiveOrb: React.FC<InteractiveOrbProps> = ({ connectionState, isSpeaking: isSpeakingProp, onClick, disabled }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const bubbles = useRef<Bubble[]>([]);

  // Synchronize prop with module-level variable
  isSpeaking = isSpeakingProp;

  const getAnimationParams = useCallback(() => {
    switch (connectionState) {
        case ConnectionState.CONNECTING:
            return { speed: 1.5, blur: 35, contrast: 25, color: 'rgba(255, 255, 0, 0.7)' }; // Yellowish
        case ConnectionState.CONNECTED:
            if (isSpeaking) {
                return { speed: 3.5, blur: 40, contrast: 30, color: 'rgba(50, 255, 255, 0.9)'}; // Bright Cyan
            }
            return { speed: 1, blur: 30, contrast: 20, color: 'rgba(0, 255, 255, 0.7)' }; // Cyan
        case ConnectionState.ERROR:
            return { speed: 0.1, blur: 20, contrast: 10, color: 'rgba(255, 0, 0, 0.6)' }; // Red
        case ConnectionState.DISCONNECTED:
        default:
            return { speed: 0.5, blur: 30, contrast: 20, color: 'rgba(100, 100, 255, 0.5)' }; // Purplish
    }
  }, [connectionState, isSpeaking]);

  const animate = useCallback((ctx: CanvasRenderingContext2D) => {
    const { width, height } = ctx.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const params = getAnimationParams();

    ctx.clearRect(0, 0, width, height);
    
    ctx.filter = `blur(${params.blur}px) contrast(${params.contrast})`;
    
    ctx.save();
    ctx.translate(centerX, centerY);

    bubbles.current.forEach(bubble => {
      ctx.beginPath();
      const gradient = ctx.createRadialGradient(bubble.x, bubble.y, 0, bubble.x, bubble.y, bubble.r);
      gradient.addColorStop(0, params.color);
      gradient.addColorStop(1, 'rgba(0, 100, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.arc(bubble.x, bubble.y, bubble.r, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.restore();
    ctx.filter = 'none';

    bubbles.current.forEach(bubble => bubble.update(params.speed));

    animationFrameId.current = requestAnimationFrame(() => animate(ctx));
  }, [getAnimationParams]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        bubbles.current = Array.from({ length: 7 }, () => new Bubble(Math.random() * 40 + 50));
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    animationFrameId.current = requestAnimationFrame(() => animate(ctx));

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [animate]);

  return (
    <canvas 
      ref={canvasRef} 
      onClick={!disabled ? onClick : undefined} 
      className={`w-full h-full rounded-full ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
      aria-label={disabled ? "AI conversation in progress" : "Start AI conversation"}
    />
  );
};