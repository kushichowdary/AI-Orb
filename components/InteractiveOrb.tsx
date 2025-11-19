
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
 * Updated to support state-driven physics (Speaking vs Listening).
 */
class NanoParticle {
    theta: number; // angle on the XY plane
    phi: number;   // angle on the XZ plane
    baseRadiusPct: number; // Base distance from center (relative to orb radius)
    speed: number;
    size: number;
    
    // New properties for varied movement
    noiseOffset: number;
    orbitTilt: number;
    
    constructor() {
        this.theta = Math.random() * Math.PI * 2;
        // Uniform distribution on sphere
        this.phi = Math.acos((Math.random() * 2) - 1); 
        
        // PARTICLES "OUT OF ORB":
        // Orbit significantly outside the solid surface (1.3x to 1.8x radius)
        this.baseRadiusPct = 1.3 + Math.random() * 0.5;
        
        // Slightly faster for dynamic "satellite" feel
        this.speed = 0.004 + Math.random() * 0.006;
        
        // Larger particles since count is lower
        this.size = 1.2 + Math.random() * 1.8;
        
        this.noiseOffset = Math.random() * 100;
        this.orbitTilt = (Math.random() - 0.5) * 0.5; 
    }

    /**
     * Advances the particle's orbital position and calculates dynamic offsets.
     * @param localDispersion 0 to 1 value indicating how agitated this particle is by the mouse.
     * @param isSpeaking AI is speaking
     * @param isUserSpeaking User is speaking
     * @param time Global time counter
     * @returns The momentary radius modifier for this frame.
     */
    advance(localDispersion: number, isSpeaking: boolean, isUserSpeaking: boolean, time: number) {
        let activeSpeed = this.speed;

        // 1. Speed Calculation based on State
        if (localDispersion > 0) {
            // Highest priority: Mouse interaction (Explosive speed)
            activeSpeed *= (1 + localDispersion * 12);
        } else if (isSpeaking) {
            // High priority: AI Speaking (Fast, fluid flow)
            activeSpeed *= 3.5;
        } else if (isUserSpeaking) {
            // Medium priority: User input (Agitated, jittery)
            activeSpeed *= 2.0;
        }

        // 2. Position Updates
        this.theta += activeSpeed;
        
        // Stable Orbital Motion:
        // Reduced wobble on phi to create cleaner, more consistent ring-like paths
        // instead of random swarming.
        this.phi += Math.sin(time * 0.002 + this.noiseOffset) * 0.001;

        // 3. Radius Modulation (The visual "reaction")
        let radiusMod = 0;
        
        if (isSpeaking) {
            // AI Speaking: Rhythmic, wave-like expansion
            radiusMod = Math.sin(time * 0.15 + this.theta * 4 + this.noiseOffset) * 0.08;
        } else if (isUserSpeaking) {
            // User Speaking: High frequency noise/jitter
            radiusMod = (Math.random() - 0.5) * 0.05;
        }

        return radiusMod;
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
    
    // Interaction state tracking
    // Stores position relative to canvas and active state
    const mouseRef = useRef({ x: 0, y: 0, active: false });

    // A simple counter to drive time-based animations.
    const time = useRef(0);

    // We use smoothed properties to make the orb's transitions feel fluid and organic.
    const smoothedProps = useRef({
        distortion: 0, // How much the orb's shape is warped.
        activity: 0,   // How much internal energy/animation is visible.
    });
    
    // Initialize the particles once.
    const init = () => {
        // DECREASED COUNT: 200 -> 50 for a cleaner, orbital look
        nanoParticles.current = Array.from({ length: 50 }, () => new NanoParticle());
    };

    /**
     * The main animation loop, called for every frame.
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
        
        // INCREASED RADIUS: Divisor changed from 4.5 to 3.2 for a larger presence
        const baseRadius = Math.min(logicalWidth, logicalHeight) / 3.2;

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
        
        // Step 2: Clear Canvas
        ctx.clearRect(0, 0, logicalWidth, logicalHeight);
        
        // Add a subtle float to the entire orb
        const floatX = centerX + Math.sin(time.current * 0.005) * 5;
        const floatY = centerY + Math.cos(time.current * 0.007) * 5;

        // --- DRAW SOLID ORB LAYERS ---
        // We draw the solid parts first. We will then use 'destination-out' to mask them
        // based on cursor position, and finally draw particles on top.
        
        ctx.save();

        // --- Main Orb Shape (Calculated Path) ---
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
        if (isSpeaking) {
            ctx.save();
            const glowAlpha = (0.4 + Math.sin(time.current * 0.08) * 0.2); 
            ctx.globalAlpha = glowAlpha;
            ctx.strokeStyle = `hsl(${HUE}, ${SATURATION}%, 75%)`;
            ctx.lineWidth = 20;
            ctx.filter = 'blur(25px)';
            ctx.stroke(path);
            ctx.filter = 'none';
            ctx.restore();
        }

        // --- User Speaking Pulse ---
        if (isUserSpeaking) {
            ctx.save();
            const pulseCycle = 30; 
            const pulseProgress = (time.current % pulseCycle) / pulseCycle;
            const pulseRadius = baseRadius * 0.8 * pulseProgress;
            const pulseAlpha = (1.0 - pulseProgress); 
            
            ctx.strokeStyle = `hsla(${HUE}, ${SATURATION}%, 80%, ${pulseAlpha * 0.7})`;
            ctx.lineWidth = 1 + (2 * pulseProgress); 
            ctx.beginPath();
            ctx.arc(floatX, floatY, pulseRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        
        // --- Orb Outline ---
        ctx.strokeStyle = `hsl(${HUE}, ${SATURATION}%, ${LIGHTNESS}%)`;
        ctx.lineWidth = 1.5;
        ctx.stroke(path);

        // --- Internal Arcs ---
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = (0.1 + s.activity * 0.2);
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
        
        // --- Orb Core ---
        ctx.save();
        const coreBaseRadius = baseRadius * 0.15;
        const breath = Math.sin(time.current * 0.03) * 0.1 + 0.95;
        const coreRadius = coreBaseRadius * breath;
        const glowRadius = coreRadius * 2.5;

        const glowGradient = ctx.createRadialGradient(floatX, floatY, coreRadius, floatX, floatY, glowRadius);
        glowGradient.addColorStop(0, `hsla(${HUE}, ${SATURATION}%, ${LIGHTNESS + 20}%, 0.6)`);
        glowGradient.addColorStop(1, `hsla(${HUE}, ${SATURATION}%, ${LIGHTNESS}%, 0)`);
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(floatX, floatY, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `hsl(${HUE}, ${SATURATION}%, ${LIGHTNESS + 30}%)`;
        ctx.shadowColor = `hsl(${HUE}, 100%, 80%)`;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(floatX, floatY, coreRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // --- MASKING STEP ---
        // If mouse is active, erase the solid orb parts under the cursor
        if (mouseRef.current.active) {
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            const mx = mouseRef.current.x; // Already logical coords
            const my = mouseRef.current.y;
            // Scaled interaction radius based on orb size
            const maskRadius = baseRadius * 1.2; 

            const gradient = ctx.createRadialGradient(mx, my, maskRadius * 0.2, mx, my, maskRadius);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 1)'); // Fully erased at center
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Intact at edge

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(mx, my, maskRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        ctx.restore(); // Finish solid orb layer

        // --- DRAW PARTICLES ---
        // Particles handle their own interaction logic and state
        nanoParticles.current.forEach(p => {
             // Check Distance to Mouse for Local Dispersion
            let localDispersion = 0;
            if (mouseRef.current.active) {
                const mx = mouseRef.current.x;
                const my = mouseRef.current.y;
                
                // Calculate approx position for hit testing
                const rBase = baseRadius * p.baseRadiusPct;
                const px = floatX + rBase * Math.sin(p.phi) * Math.cos(p.theta);
                const py = floatY + rBase * Math.cos(p.phi);

                const dx = px - mx;
                const dy = py - my;
                const dist = Math.sqrt(dx*dx + dy*dy);
                const interactionRadius = baseRadius * 1.5; // Interaction scales with orb size

                if (dist < interactionRadius) {
                    // Calculate intensity (0 to 1) based on proximity
                    const ratio = 1 - (dist / interactionRadius);
                    // Use cubic easing for sharp, localized falloff
                    localDispersion = ratio * ratio * ratio;
                }
            }

            // 1. Advance Particle Logic (State Physics)
            const stateRadiusMod = p.advance(localDispersion, isSpeaking, isUserSpeaking, time.current);
            
            // 2. Calculate Final 3D Position
            // Couple particle radius to orb distortion for "following" effect
            // When orb distorts (activity), particles push out slightly to match the core expansion
            const dynamicFollow = (s.distortion / 15) * 0.2; // Scaling factor
            const currentRadius = baseRadius * (p.baseRadiusPct + stateRadiusMod + dynamicFollow);
            
            let x = currentRadius * Math.sin(p.phi) * Math.cos(p.theta);
            let y = currentRadius * Math.cos(p.phi);
            let z = currentRadius * Math.sin(p.phi) * Math.sin(p.theta);

            // 3. Apply Dispersion Expansion
            // Expand outward from orb center based on local dispersion
            const expansion = 1 + localDispersion * 1.2; 
            x *= expansion;
            y *= expansion;
            z *= expansion;

            const screenX = floatX + x;
            const screenY = floatY + y;

            // 4. Draw
            // Z-sorting approximation for scaling
            const zScale = (z + baseRadius * 2) / (baseRadius * 2);
            const scale = Math.max(0.1, Math.min(1.8, zScale));
            
            ctx.beginPath();
            
            // Particles are faint normally, brighter when active or dispersed
            const baseAlpha = 0.4;
            const alphaStateMod = (isSpeaking || isUserSpeaking) ? 0.4 : 0;
            const alpha = Math.min(1, baseAlpha + alphaStateMod + localDispersion * 0.7);
            
            ctx.fillStyle = `rgba(255, 255, 220, ${alpha})`; 
            ctx.arc(screenX, screenY, p.size * scale * (1 + localDispersion), 0, Math.PI * 2);
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

    // Mouse interaction handlers to update coordinate ref
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (disabled) return;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                active: true
            };
        }
    };

    const handleMouseLeave = () => {
        mouseRef.current.active = false;
    };

    // Touch support for mobile
    const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
         if (disabled) return;
         const rect = canvasRef.current?.getBoundingClientRect();
         const touch = e.touches[0];
         if (rect && touch) {
             mouseRef.current = {
                 x: touch.clientX - rect.left,
                 y: touch.clientY - rect.top,
                 active: true
             };
         }
    };

    return (
        <canvas 
          ref={canvasRef} 
          onClick={!disabled ? onClick : undefined} 
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchMove} // Trigger on start too
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseLeave}
          className={`w-full h-full ${disabled ? 'cursor-default' : 'cursor-pointer'} touch-none`}
          aria-label={disabled ? "AI conversation in progress" : "Start AI conversation"}
        />
    );
};
