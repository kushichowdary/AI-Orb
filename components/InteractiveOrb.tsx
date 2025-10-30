import React, { useRef, useEffect, useCallback } from 'react';
import { ConnectionState } from '../types';

interface InteractiveOrbProps {
  connectionState: ConnectionState;
  isSpeaking: boolean;
  isUserSpeaking: boolean;
  onClick: () => void;
  disabled: boolean;
}

const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;

class NanoParticle {
    theta: number;
    phi: number;
    radius: number;
    speed: number;
    size: number;
    
    constructor() {
        this.theta = Math.random() * Math.PI * 2;
        this.phi = Math.random() * Math.PI;
        this.radius = 1.2 + Math.random() * 0.3;
        this.speed = 0.005 + Math.random() * 0.005;
        this.size = 0.5 + Math.random() * 1;
    }

    update() {
        this.theta += this.speed;
        this.phi += this.speed * 0.3;
    }
    
    getPosition(baseRadius: number) {
        const r = baseRadius * this.radius;
        const x = r * Math.sin(this.phi) * Math.cos(this.theta);
        const y = r * Math.cos(this.phi);
        const z = r * Math.sin(this.phi) * Math.sin(this.theta);
        return { x, y, z };
    }
}

export const InteractiveOrb: React.FC<InteractiveOrbProps> = ({ connectionState, isSpeaking, isUserSpeaking, onClick, disabled }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number | null>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const nanoParticles = useRef<NanoParticle[]>([]);

    const time = useRef(0);

    const smoothedProps = useRef({
        distortion: 0,
        activity: 0,
    });
    
    const init = () => {
        nanoParticles.current = Array.from({ length: 50 }, () => new NanoParticle());
    };

    const animate = useCallback(() => {
        time.current += 1;
        const ctx = ctxRef.current;
        if (!ctx) {
            animationFrameId.current = requestAnimationFrame(animate);
            return;
        }

        const { width, height } = ctx.canvas;
        const dpr = window.devicePixelRatio || 1;
        const logicalWidth = width / dpr;
        const logicalHeight = height / dpr;
        const centerX = logicalWidth / 2;
        const centerY = logicalHeight / 2;
        const baseRadius = Math.min(logicalWidth, logicalHeight) / 3.5;

        // Dark Lavender color theme
        const HUE = 270; 
        const SATURATION = 45;
        const LIGHTNESS = 60;

        let targetDistortion = 3, targetActivity = 0;

        switch (connectionState) {
            case ConnectionState.CONNECTING:
                targetDistortion = 10; targetActivity = 0.5;
                break;
            case ConnectionState.ERROR:
                targetDistortion = 2;
                break;
            case ConnectionState.CONNECTED:
                if (isUserSpeaking) {
                    targetDistortion = 12; targetActivity = 1.0;
                } else if (isSpeaking) {
                    targetDistortion = 8; targetActivity = 0.7;
                } else {
                    targetDistortion = 4;
                }
                break;
        }
        
        const s = smoothedProps.current;
        s.distortion = lerp(s.distortion, targetDistortion, 0.08);
        s.activity = lerp(s.activity, targetActivity, 0.08);

        ctx.clearRect(0, 0, logicalWidth, logicalHeight);
        const floatX = centerX + Math.sin(time.current * 0.005) * 5;
        const floatY = centerY + Math.cos(time.current * 0.007) * 5;

        // --- Frosted Glass Ring ---
        ctx.save();
        const ringOuterRadius = baseRadius * 1.6;
        const ringInnerRadius = baseRadius * 1.1;
        
        const ringPath = new Path2D();
        ringPath.arc(floatX, floatY, ringOuterRadius, 0, Math.PI * 2, false);
        ringPath.arc(floatX, floatY, ringInnerRadius, 0, Math.PI * 2, true);
        
        // Clip to the ring shape
        ctx.clip(ringPath);
        
        // Apply a blur filter
        ctx.filter = 'blur(25px)';
        
        // Fill the clipped area with a semi-transparent color to create the frosted effect
        ctx.fillStyle = 'rgba(220, 210, 255, 0.1)';
        ctx.fillRect(0, 0, logicalWidth, logicalHeight);
        
        // Restore context to remove clip and filter
        ctx.restore();

        // --- Create Morphing Path ---
        const segments = 128;
        const path = new Path2D();
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const d1 = Math.sin(time.current * 0.02 + angle * 5) * s.distortion * 0.7;
            const d2 = Math.sin(time.current * -0.03 + angle * 8) * s.distortion * 0.3;
            const d3 = (Math.sin(time.current * 0.1 * s.activity + angle * 2) * s.distortion * s.activity * 1.5);
            const r = baseRadius + d1 + d2 + d3;
            const x = floatX + Math.cos(angle) * r;
            const y = floatY + Math.sin(angle) * r;
            if (i === 0) path.moveTo(x, y); else path.lineTo(x, y);
        }
        path.closePath();

        // --- Orb Core ---
        const orbGradient = ctx.createRadialGradient(
            floatX + baseRadius * 0.2, floatY - baseRadius * 0.2, baseRadius * 0.1, 
            floatX, floatY, baseRadius
        );
        orbGradient.addColorStop(0, `hsl(${HUE}, ${SATURATION}%, 95%)`);
        orbGradient.addColorStop(0.5, `hsl(${HUE}, ${SATURATION}%, ${LIGHTNESS}%)`);
        orbGradient.addColorStop(1, `hsl(${HUE}, ${SATURATION+10}%, ${LIGHTNESS-20}%)`);
        ctx.fillStyle = orbGradient;
        ctx.fill(path);

        // --- Surface Nanotech Sheen ---
        ctx.save();
        ctx.clip(path);
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = 0.2 + s.activity * 0.3;
        for(let i=0; i<8; i++) {
            ctx.beginPath();
            const startAngle = (time.current * 0.01 * (i%2 === 0 ? 1 : -1) * (1 + i*0.2));
            const endAngle = startAngle + Math.PI * 1.5;
            ctx.strokeStyle = `hsla(${HUE + i * 5}, 100%, 80%, 0.5)`;
            ctx.lineWidth = 1 + (i/4);
            ctx.arc(floatX, floatY, baseRadius * (0.8 + (i*0.05)), startAngle, endAngle);
            ctx.stroke();
        }
        ctx.restore();

        // --- Nano Particles Orbiting ---
        nanoParticles.current.forEach(p => {
            p.update();
            const {x, y, z} = p.getPosition(baseRadius);
            const scale = (z + baseRadius * p.radius) / (baseRadius * p.radius * 2);
            
            ctx.beginPath();
            const alpha = scale * 0.7;
            // Particles with a lavender tint
            ctx.fillStyle = `rgba(220, 210, 255, ${alpha})`;
            ctx.arc(floatX + x, floatY + y, p.size * scale, 0, Math.PI * 2);
            ctx.fill();
        });

        animationFrameId.current = requestAnimationFrame(animate);
    }, [isSpeaking, isUserSpeaking, connectionState]);
    

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
            ctxRef.current?.scale(dpr, dpr);
            init();
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        animationFrameId.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [animate]);

    return (
        <canvas 
          ref={canvasRef} 
          onClick={!disabled ? onClick : undefined} 
          className={`w-full h-full ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
          aria-label={disabled ? "AI conversation in progress" : "Start AI conversation"}
        />
    );
};
