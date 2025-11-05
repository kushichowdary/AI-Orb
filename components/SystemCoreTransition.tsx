import React, { useState, useEffect } from 'react';
import { playBootSequenceSound } from '../utils/audioCues';

interface SystemCoreTransitionProps {
  onComplete: () => void;
}

// Timings for the animation sequence
const TOTAL_DURATION = 6000;
const LINE_INTERVAL = 700;
const FADE_OUT_START = TOTAL_DURATION - 1000;

const logSequence = [
    'INITIATING CONNECTION...',
    'AUTHENTICATING USER...',
    'SECURE LINK ESTABLISHED.',
    'VERIFYING DIGITAL PASS SIGNATURE...',
    'PASS VERIFIED. ACCESS GRANTED.',
    'LOADING NEURAL INTERFACE...',
    'LOADING YOUR ASSISTANCE...',
    'PROCESSING....',
];

export const SystemCoreTransition: React.FC<SystemCoreTransitionProps> = ({ onComplete }) => {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const stopSound = playBootSequenceSound();
    const timeouts: number[] = [];

    // Schedule each log line to appear, starting after the initial animations.
    logSequence.forEach((line, index) => {
      // FIX: Use window.setTimeout to ensure the browser's implementation is used, which returns a number.
      const timeout = window.setTimeout(() => {
        setDisplayedLines(prev => [...prev, line]);
      }, 1000 + index * LINE_INTERVAL);
      timeouts.push(timeout);
    });

    // Schedule the final welcome message.
    // FIX: Use window.setTimeout to ensure the browser's implementation is used, which returns a number.
    const finalMessageTimer = window.setTimeout(() => {
      const userName = localStorage.getItem('jarvis-user-name')?.toUpperCase() || 'AGENT';
      const finalLine = `> WELCOME, ${userName}.`;
      setDisplayedLines(prev => [...prev, finalLine]);
      setIsComplete(true);
    }, 1000 + logSequence.length * LINE_INTERVAL);
    timeouts.push(finalMessageTimer);

    // Schedule the fade-out effect to begin before the sequence ends.
    // FIX: Use window.setTimeout to ensure the browser's implementation is used, which returns a number.
    const fadeTimer = window.setTimeout(() => {
      setIsFading(true);
    }, FADE_OUT_START);
    timeouts.push(fadeTimer);

    // Schedule the final transition to the main app.
    // FIX: Use window.setTimeout to ensure the browser's implementation is used, which returns a number.
    const completeTimer = window.setTimeout(onComplete, TOTAL_DURATION);
    timeouts.push(completeTimer);

    // Cleanup function to clear all timers and stop sounds on component unmount.
    return () => {
      // FIX: Use window.clearTimeout to match window.setTimeout.
      timeouts.forEach(window.clearTimeout);
      stopSound();
    };
  }, [onComplete]);

  return (
    <div className="calibration-container">
      {/* Background Effects */}
      <div className="core-grid" />
      <div className="core-scanline" />
      <div className="core-vignette" />

      {/* The main animated HUD */}
      <div className={`calibration-hud ${isFading ? 'fade-out' : ''}`}>
        <svg viewBox="-200 -200 400 400" className="calibration-hud-svg">
          {/* Sonar rings expanding outwards */}
          <circle className="sonar-ring" r="100" style={{'--delay': '0s'} as React.CSSProperties} />
          <circle className="sonar-ring" r="100" style={{'--delay': '0.8s'} as React.CSSProperties} />
          <circle className="sonar-ring" r="100" style={{'--delay': '1.6s'} as React.CSSProperties} />

          {/* Ambient Glow Layers */}
          <circle className="orb-glow-layer" r="125" style={{ '--delay': '1s' } as React.CSSProperties} />
          <circle className="orb-glow-layer" r="150" style={{ '--delay': '1.5s' } as React.CSSProperties} />
          
          {/* Main structural arcs that draw themselves to form the orb */}
          <path className="structure-arc" style={{'--delay': '1s'} as React.CSSProperties} d="M -100 0 A 100 100 0 0 1 100 0" />
          <path className="structure-arc" style={{'--delay': '1.2s'} as React.CSSProperties} d="M 100 0 A 100 100 0 0 1 -100 0" />
          <path className="structure-arc glow" style={{'--delay': '1.5s'} as React.CSSProperties} d="M 0 -120 A 120 120 0 0 1 0 120" />
          <path className="structure-arc glow" style={{'--delay': '1.7s'} as React.CSSProperties} d="M 0 120 A 120 120 0 0 1 0 -120" />
          
          {/* Inner decorative arcs */}
          <path className="structure-arc" style={{'--delay': '2.2s'} as React.CSSProperties} d="M 0 -70 A 70 70 0 0 1 70 0" />
          <path className="structure-arc" style={{'--delay': '2.2s'} as React.CSSProperties} d="M 0 70 A 70 70 0 0 1 -70 0" />

          {/* Central Core */}
          <circle className="calibration-core" r="15" />
        </svg>
      </div>

      {/* Terminal-style text log */}
      <div className={`core-text-container ${isFading ? 'fade-out' : ''}`}>
          {displayedLines.map((line, index) => (
              <span key={index} className="log-line">
                  {line}
              </span>
          ))}
          {!isComplete && <span className="blinking-cursor" />}
      </div>
    </div>
  );
};
