import React from 'react';
import DecoderText from './DecoderText';

interface HeaderProps {
  onLogout: () => void;
}

/**
 * Header for main orb page.
 * Uses DecoderText with A and I colored lime (no glow), other letters white (with glow).
 * Font size reduced for the main orb page as requested.
 */
export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  // J A R V I S  -> indices 0 1 2 3 4 5
  // highlight A (1) and I (4)
  const highlightIndexes = [1, 4];

  return (
    <header className="p-4 md:p-6 w-full flex items-center justify-end relative z-20">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <DecoderText
          text="JARVIS"
          delay={600}
          speed={8}
          highlightIndexes={highlightIndexes}
          className="text-2xl md:text-3xl font-bold"
        />
      </div>

      <button
        onClick={onLogout}
        className="text-gray-400 hover:text-lime-400 text-sm font-semibold transition-all duration-300 hover:scale-105 hover:-translate-y-px hover:drop-shadow-[0_0_4px_rgba(184,251,60,0.6)]"
        aria-label="Logout"
      >
        Logout
      </button>
    </header>
  );
};

export default Header;
