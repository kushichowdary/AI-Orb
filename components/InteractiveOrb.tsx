
import React, { useRef, useEffect, useCallback } from 'react';
import { ConnectionState } from '../types';

interface InteractiveOrbProps {
  connectionState: ConnectionState;
  isSpeaking: boolean;
  isUserSpeaking: boolean;
  onClick: () => void;
  disabled: boolean;
}

// A simple linear interpolation function for smooth transitions.
const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;

/**
 * Represents a single small particle floating around the main orb.
 * They give the orb a sense of depth and complexity.
 */
class NanoParticle {
    theta: number; // angle on the XY plane
    phi: number;   // angle on the XZ plane
    radius: number;// distance from the center
    speed: number;
    size: number;
    
    constructor() {
        this.theta = Math.random() * Math.PI * 2;
        this.phi = Math.random() * Math.PI;
        this.radius = 1.2 + Math.random() * 0.3; // start outside the main orb
        this.speed = 0.005 + Math.random() * 0.005;
        this.size = 0.5 + Math.random() * 1;
    }

    update() {
        this.theta += this.speed;
        this.phi += this.speed * 0.3;
    }
    
    // Calculate 3D position using spherical coordinates
    getPosition(baseRadius: number) {
        const r = baseRadius * this.radius;
        const x = r * Math.sin(this.phi) * Math.cos(this.theta);
        const y = r * Math.cos(this.phi);
        const z = r * Math.sin(this.phi) * Math.sin(this.theta);
        return { x, y, z };
    }
}

/**
 * A dynamic, interactive orb rendered on a <canvas> element.
 * It provides visual feedback for the application's state through various animations.
 */
export const InteractiveOrb: React.FC<InteractiveOrbProps> = ({ connectionState, isSpeaking, isUserSpeaking, onClick, disabled }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number | null>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const nanoParticles = useRef<NanoParticle[]>([]);

    // A simple counter to drive time-based animations.
    const time = useRef(0);

    // We use smoothed properties to make the orb's transitions feel fluid and organic.
    // Instead of jumping between states, it smoothly interpolates to the target values.
    const smoothedProps = useRef({
        distortion: 0, // How much the orb's shape is warped.
        activity: 0,   // How much internal energy/animation is visible.
    });
    
    // Initialize the particles once.
    const init = () => {
        nanoParticles.current = Array.from({ length: 50 }, () => new NanoParticle());
    };

    /**
     * The main animation loop, called for every frame.
     * It's responsible for clearing the canvas and drawing all visual elements.
     */
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

        // The primary color theme of the orb, based on Tailwind's lime-300 (#B8FB3C)
        const HUE = 79; 
        const SATURATION = 96;
        const LIGHTNESS = 61;

        // Step 1: Determine the target animation properties based on app state.
        let targetDistortion = 3, targetActivity = 0;

        switch (connectionState) {
            case ConnectionState.CONNECTING:
                targetDistortion = 10; targetActivity = 0.5;
                break;
            case ConnectionState.ERROR:
                // A subtle, "unhealthy" distortion for the error state.
                targetDistortion = 2;
                break;
            case ConnectionState.CONNECTED:
                if (isUserSpeaking) {
                    targetDistortion = 12; targetActivity = 1.0;
                } else if (isSpeaking) {
                    targetDistortion = 8; targetActivity = 0.7;
                } else {
                    // The idle "breathing" state.
                    targetDistortion = 4;
                }
                break;
        }
        
        // Step 2: Smoothly interpolate the current properties towards the target.
        const s = smoothedProps.current;
        s.distortion = lerp(s.distortion, targetDistortion, 0.08);
        s.activity = lerp(s.activity, targetActivity, 0.08);

        // Step 3: Draw everything.
        ctx.clearRect(0, 0, logicalWidth, logicalHeight);
        // Add a subtle float to the entire orb for a more dynamic feel.
        const floatX = centerX + Math.sin(time.current * 0.005) * 5;
        const floatY = centerY + Math.cos(time.current * 0.007) * 5;

        // --- Main Orb Shape ---
        // The shape is a circle deformed by several sine waves for a "wobbly" effect.
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

        // --- AI Speaking Glow ---
        // A soft, blurred glow behind the main shape when the AI is speaking.
        if (isSpeaking) {
            ctx.save();
            const glowAlpha = 0.4 + Math.sin(time.current * 0.08) * 0.2; // pulsing opacity
            ctx.globalAlpha = glowAlpha;
            ctx.strokeStyle = `hsl(${HUE}, ${SATURATION}%, 75%)`;
            ctx.lineWidth = 20;
            ctx.filter = 'blur(25px)';
            ctx.stroke(path);
            ctx.filter = 'none';
            ctx.restore();
        }

        // --- User Speaking Pulse ---
        // An expanding ripple effect when the user is speaking.
        if (isUserSpeaking) {
            ctx.save();
            const pulseCycle = 30; // duration of one pulse in frames
            const pulseProgress = (time.current % pulseCycle) / pulseCycle;
            const pulseRadius = baseRadius * 0.8 * pulseProgress;
            const pulseAlpha = 1.0 - pulseProgress; // fades out as it expands
            
            ctx.strokeStyle = `hsla(${HUE}, ${SATURATION}%, 80%, ${pulseAlpha * 0.7})`;
            ctx.lineWidth = 1 + (2 * pulseProgress); // gets thicker as it expands
            ctx.beginPath();
            ctx.arc(floatX, floatY, pulseRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        
        // --- Orb Outline ---
        // The crisp main line of the orb.
        ctx.strokeStyle = `hsl(${HUE}, ${SATURATION}%, ${LIGHTNESS}%)`;
        ctx.lineWidth = 1.5;
        ctx.stroke(path);

        // --- Internal Arcs ---
        // Decorative arcs inside the orb that react to "activity".
        ctx.save();
        ctx.globalCompositeOperation = 'lighter'; // Additive blending looks nice on black.
        ctx.globalAlpha = 0.1 + s.activity * 0.2;
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

        // --- Nano Particles ---
        // Renders the small particles, creating a 3D effect by scaling them based on their Z position.
        nanoParticles.current.forEach(p => {
            p.update();
            const {x, y, z} = p.getPosition(baseRadius);
            // "Project" the 3D position to 2D. Particles with a higher Z value appear larger and more opaque.
            const scale = (z + baseRadius * p.radius) / (baseRadius * p.radius * 2);
            
            ctx.beginPath();
            const alpha = scale * 0.7;
            ctx.fillStyle = `rgba(255, 255, 220, ${alpha})`; // A soft yellow-white
            ctx.arc(floatX + x, floatY + y, p.size * scale, 0, Math.PI * 2);
            ctx.fill();
        });

        animationFrameId.current = requestAnimationFrame(animate);
    }, [isSpeaking, isUserSpeaking, connectionState]);
    

    // Effect for setting up and tearing down the canvas and animation loop.
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        ctxRef.current = canvas.getContext('2d');
        if (!ctxRef.current) return;
        
        // Handles resizing the canvas to match its display size, accounting for high-DPI screens.
        const resizeCanvas = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctxRef.current?.scale(dpr, dpr);
            init(); // Re-initialize particles on resize
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
