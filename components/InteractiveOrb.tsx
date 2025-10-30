import React, { useRef, useEffect, useCallback } from 'react';
import { ConnectionState } from '../types';

interface InteractiveOrbProps {
  connectionState: ConnectionState;
  isSpeaking: boolean;
  isUserSpeaking: boolean;
  onClick: () => void;
  disabled: boolean;
}

class Particle {
    angle: number;
    initialOrbit: number;
    orbitRadius: number;
    radius: number;
    speed: number;
    x: number = 0;
    y: number = 0;
    z: number; // Depth factor: 0 (far) to 1 (close)
    waveFrequency: number;
    waveAmplitude: number;
    
    constructor(baseOrbit: number) {
        this.angle = Math.random() * Math.PI * 2;
        this.initialOrbit = baseOrbit + Math.random() * 50 - 25;
        this.orbitRadius = this.initialOrbit;
        this.z = Math.random();
        // Closer particles are larger and brighter
        this.radius = (Math.random() * 1.5 + 0.5) * (this.z * 0.8 + 0.2);
        this.speed = (Math.random() * 0.005 + 0.002) * (Math.random() > 0.5 ? 1 : -1);
        this.waveFrequency = Math.random() * 5 + 2;
        this.waveAmplitude = Math.random() * 10 + 5;
    }
    
    update(speedFactor: number, centerPull: number, time: number) {
        this.angle += this.speed * speedFactor;
        
        // Create a more complex, wave-like orbit
        const wave = Math.sin(this.angle * this.waveFrequency + time * 0.01) * this.waveAmplitude;
        this.orbitRadius = this.initialOrbit + wave;

        const effectiveOrbit = this.orbitRadius * (1 - centerPull * 0.2);

        this.x = Math.cos(this.angle) * effectiveOrbit;
        this.y = Math.sin(this.angle) * effectiveOrbit;
    }
}


export const InteractiveOrb: React.FC<InteractiveOrbProps> = ({ connectionState, isSpeaking, isUserSpeaking, onClick, disabled }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const particles = useRef<Particle[]>([]);
  const time = useRef(0);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);


  const getAnimationParams = useCallback(() => {
    const baseParams = {
        speed: 1,
        auraColor: 'hsla(240, 100%, 70%, 0.1)',
        coreColor: 'hsla(240, 100%, 80%, 0.8)',
        particleColor: 'hsla(0, 0%, 100%, 0.7)',
        centerPull: 0,
    };

    switch (connectionState) {
        case ConnectionState.CONNECTING:
            baseParams.speed = 3;
            baseParams.auraColor = 'hsla(60, 100%, 70%, 0.2)';
            baseParams.coreColor = 'hsla(60, 100%, 80%, 0.9)';
            break;
        case ConnectionState.CONNECTED:
             if (isUserSpeaking) {
                const pulse = 0.8 + Math.abs(Math.sin(time.current * 0.1)) * 0.4;
                const userHue = 120 + Math.sin(time.current * 0.05) * 10;
                baseParams.speed = 4;
                baseParams.auraColor = `hsla(${userHue}, 70%, 60%, ${0.25 * pulse})`;
                baseParams.coreColor = `hsla(${userHue}, 80%, 80%, ${0.9 * pulse})`;
                baseParams.particleColor = `hsla(${userHue}, 80%, 95%, 1)`;
            } else if (isSpeaking) {
                const aiHue = 210 + Math.sin(time.current * 0.03) * 20;
                baseParams.speed = 1.5;
                baseParams.auraColor = `hsla(${aiHue}, 80%, 50%, 0.15)`;
                baseParams.coreColor = `hsla(${aiHue}, 90%, 70%, 0.8)`;
                baseParams.particleColor = `hsla(${aiHue}, 90%, 90%, 0.7)`;
            } else {
                const idleHue = 200 + Math.sin(time.current * 0.02) * 15;
                baseParams.speed = 2;
                baseParams.auraColor = `hsla(${idleHue}, 80%, 60%, 0.2)`;
                baseParams.coreColor = `hsla(${idleHue}, 90%, 80%, 0.9)`;
                baseParams.particleColor = 'hsla(0, 0%, 100%, 0.7)';
            }
            break;
        case ConnectionState.ERROR:
            baseParams.speed = 0;
            baseParams.auraColor = 'hsla(0, 80%, 60%, 0.2)';
            baseParams.coreColor = 'hsla(0, 90%, 70%, 0.8)';
            break;
        case ConnectionState.DISCONNECTED:
        default:
             break;
    }
    return baseParams;
  }, [connectionState, isSpeaking, isUserSpeaking]);

  const animate = useCallback(() => {
    time.current += 1;
    const ctx = ctxRef.current;
    if (!ctx) {
        animationFrameId.current = requestAnimationFrame(animate);
        return;
    }

    const { width, height } = ctx.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) / 3;
    const params = getAnimationParams();

    ctx.clearRect(0, 0, width, height);
    
    // 1. Draw Outer Aura
    const auraPulse = 1 + Math.sin(time.current * 0.02) * 0.05;
    const auraGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius * 1.5 * auraPulse);
    auraGradient.addColorStop(0, 'rgba(0,0,0,0)');
    auraGradient.addColorStop(0.5, params.auraColor);
    auraGradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = auraGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Core
    const corePulse = 1 + Math.sin(time.current * 0.05) * 0.1;
    // Add oscillating offsets to the gradient center for a swirling effect
    const offsetX = Math.sin(time.current * 0.022) * baseRadius * 0.1;
    const offsetY = Math.cos(time.current * 0.015) * baseRadius * 0.1;
    const coreGradient = ctx.createRadialGradient(
        centerX + offsetX, 
        centerY + offsetY, 
        0, 
        centerX, 
        centerY, 
        baseRadius * 0.4 * corePulse
    );
    coreGradient.addColorStop(0, params.coreColor);
    coreGradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
    ctx.fill();

    // 3. Draw and update particles
    ctx.save();
    ctx.translate(centerX, centerY);
    particles.current.forEach(p => {
        p.update(params.speed, params.centerPull, time.current);
        
        const alpha = (p.z * 0.7 + 0.3); // Closer particles are more opaque
        const radius = p.radius * (p.z * 0.8 + 0.2); // Closer particles appear larger
        
        // Give each particle a subtle glow
        const particleGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 3);
        const transparentColor = params.particleColor.replace(/,(\s?[\d.]+)\)/, ', 0)');
        particleGradient.addColorStop(0, params.particleColor);
        particleGradient.addColorStop(1, transparentColor);

        ctx.fillStyle = particleGradient;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius * 3, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1.0; // Reset global alpha
    ctx.restore();

    animationFrameId.current = requestAnimationFrame(animate);
  }, [getAnimationParams]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    ctxRef.current = canvas.getContext('2d');
    if (!ctxRef.current) return;

    const resizeCanvas = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        const ctx = ctxRef.current;
        if(ctx) {
            ctx.scale(dpr, dpr);
        }
        
        const baseOrbit = Math.min(rect.width, rect.height) / 3.5;
        particles.current = Array.from({ length: 150 }, () => new Particle(baseOrbit));
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    animationFrameId.current = requestAnimationFrame(animate);

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