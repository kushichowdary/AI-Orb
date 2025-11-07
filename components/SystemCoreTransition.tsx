import React, { useState, useEffect } from 'react';
import { playBootSequenceSound } from '../utils/audioCues';

interface SystemCoreTransitionProps {
  onComplete: () => void;
}

const TOTAL_DURATION = 6000;
const LINE_INTERVAL = 700;
const INITIAL_DELAY = 1000;
const FADE_OUT_START = TOTAL_DURATION - 1000;

const logSequence = [
    'INITIATING CONNECTION...',
    'AUTHENTICATING USER...',
    'SECURE LINK ESTABLISHED.',
    'VERIFYING DIGITAL PASS SIGNATURE...',
    'PASS VERIFIED. ACCESS GRANTED.',
    'LOADING NEURAL INTERFACE...',
];

export const SystemCoreTransition: React.FC<SystemCoreTransitionProps> = ({ onComplete }) => {
  const [linesToRender, setLinesToRender] = useState(0);
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [finalMessage, setFinalMessage] = useState('');
  const [cursorVisible, setCursorVisible] = useState(false);

  useEffect(() => {
    const stopSound = playBootSequenceSound();
    const timeouts: number[] = [];

    const cursorStartTimer = window.setTimeout(() => setCursorVisible(true), INITIAL_DELAY);
    timeouts.push(cursorStartTimer);

    logSequence.forEach((_, index) => {
      const timeout = window.setTimeout(() => {
        setLinesToRender(prev => prev + 1);
      }, INITIAL_DELAY + index * LINE_INTERVAL);
      timeouts.push(timeout);
    });

    const finalMessageTime = INITIAL_DELAY + logSequence.length * LINE_INTERVAL;
    const finalMessageTimer = window.setTimeout(() => {
      const userName = localStorage.getItem('jarvis-user-name')?.toUpperCase() || 'AGENT';
      setFinalMessage(`> WELCOME, ${userName}.`);
      setShowFinalMessage(true);
      setCursorVisible(false); // Hide cursor when final message appears
    }, finalMessageTime);
    timeouts.push(finalMessageTimer);

    const fadeTimer = window.setTimeout(() => {
      setIsFading(true);
    }, FADE_OUT_START);
    timeouts.push(fadeTimer);

    const completeTimer = window.setTimeout(onComplete, TOTAL_DURATION);
    timeouts.push(completeTimer);

    return () => {
      timeouts.forEach(window.clearTimeout);
      stopSound();
    };
  }, [onComplete]);

  return (
    <div className="calibration-container">
      <div className="core-grid" />
      <div className="core-scanline" />
      <div className="core-vignette" />
      <div className={`calibration-hud ${isFading ? 'fade-out' : ''}`}>
        <svg viewBox="-200 -200 400 400" className="calibration-hud-svg">
          <circle className="sonar-ring" r="100" style={{'--delay': '0s'} as React.CSSProperties} />
          <circle className="sonar-ring" r="100" style={{'--delay': '0.8s'} as React.CSSProperties} />
          <circle className="sonar-ring" r="100" style={{'--delay': '1.6s'} as React.CSSProperties} />
          <circle className="orb-glow-layer" r="125" style={{ '--delay': '1s' } as React.CSSProperties} />
          <circle className="orb-glow-layer" r="150" style={{ '--delay': '1.5s' } as React.CSSProperties} />
          <path className="structure-arc" style={{'--delay': '1s'} as React.CSSProperties} d="M -100 0 A 100 100 0 0 1 100 0" />
          <path className="structure-arc" style={{'--delay': '1.2s'} as React.CSSProperties} d="M 100 0 A 100 100 0 0 1 -100 0" />
          <path className="structure-arc glow" style={{'--delay': '1.5s'} as React.CSSProperties} d="M 0 -120 A 120 120 0 0 1 0 120" />
          <path className="structure-arc glow" style={{'--delay': '1.7s'} as React.CSSProperties} d="M 0 120 A 120 120 0 0 1 0 -120" />
          <path className="structure-arc" style={{'--delay': '2.2s'} as React.CSSProperties} d="M 0 -70 A 70 70 0 0 1 70 0" />
          <path className="structure-arc" style={{'--delay': '2.2s'} as React.CSSProperties} d="M 0 70 A 70 70 0 0 1 -70 0" />
          <circle className="calibration-core" r="15" />
        </svg>
      </div>
      <div className={`core-text-container ${isFading ? 'fade-out' : ''}`}>
          {logSequence.slice(0, linesToRender).map((line, index) => (
              <div key={index} className="log-line">
                  {line}
              </div>
          ))}
          {showFinalMessage && (
            <div className="log-line final-message">
              {finalMessage}
            </div>
          )}
          {cursorVisible && <span className="blinking-cursor" />}
      </div>
    </div>
  );
};