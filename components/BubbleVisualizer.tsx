import React, { useRef, useEffect, useCallback } from 'react';
import { ConnectionState } from '../types';

interface BubbleVisualizerProps {
  connectionState: ConnectionState;
  isSpeaking: boolean;
}

class Bubble {
    x: number;
    y: number;
    r: number;
    vx: number;
    vy: number;
    
    constructor(width: number, height: number) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.r = Math.random() * 50 + 20;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
    }
    
    update(width: number, height: number, speedFactor: number) {
        this.x += this.vx * speedFactor;
        this.y += this.vy * speedFactor;
        
        if (this.x > width + this.r) this.x = -this.r;
        if (this.x < -this.r) this.x = width + this.r;
        if (this.y > height + this.r) this.y = -this.r;
        if (this.y < -this.r) this.y = height + this.r;
    }
}

export const BubbleVisualizer: React.FC<BubbleVisualizerProps> = ({ connectionState, isSpeaking }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const bubbles = useRef<Bubble[]>([]);

  const getSpeedFactor = useCallback(() => {
    if (isSpeaking) return 2.5;
    if (connectionState === ConnectionState.CONNECTED) return 1;
    if (connectionState === ConnectionState.CONNECTING) return 0.5;
    return 0.2;
  }, [connectionState, isSpeaking]);


  const animate = useCallback((ctx: CanvasRenderingContext2D) => {
    const { width, height } = ctx.canvas;
    ctx.clearRect(0, 0, width, height);
    
    // Metaball effect setup
    ctx.filter = 'blur(30px) contrast(20)';

    bubbles.current.forEach(bubble => {
      ctx.beginPath();
      const gradient = ctx.createRadialGradient(bubble.x, bubble.y, 0, bubble.x, bubble.y, bubble.r);
      gradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
      gradient.addColorStop(1, 'rgba(0, 100, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.arc(bubble.x, bubble.y, bubble.r, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Reset filter for next frame logic
    ctx.filter = 'none';

    bubbles.current.forEach(bubble => bubble.update(width, height, getSpeedFactor()));

    animationFrameId.current = requestAnimationFrame(() => animate(ctx));
  }, [getSpeedFactor]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const numBubbles = Math.floor((canvas.width * canvas.height) / 40000);
      bubbles.current = Array.from({ length: numBubbles }, () => new Bubble(canvas.width, canvas.height));
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

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0" />;
};