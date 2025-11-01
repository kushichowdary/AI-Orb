
import React from 'react';

interface HeaderProps {
  onLogout: () => void;
}

/**
 * Renders the main application header.
 * It displays the title "JARVIS" and a logout button when the user is logged in.
 * Uses absolute positioning for the title to ensure it's perfectly centered,
 * while the logout button is aligned to the right.
 */
export const Header: React.FC<HeaderProps> = ({ onLogout }) => (
  <header className="p-4 md:p-6 w-full flex items-center justify-end relative z-20">
    <h1 className="font-jarvis text-3xl font-bold text-white tracking-wider text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      J<span className="text-lime-400">A</span>RV<span className="text-lime-400">I</span>S
    </h1>
    <button
      onClick={onLogout}
      className="text-gray-400 hover:text-lime-400 text-sm font-semibold transition-all duration-300 hover:scale-105 hover:-translate-y-px hover:drop-shadow-[0_0_4px_rgba(184,251,60,0.6)]"
      aria-label="Logout"
    >
      Logout
    </button>
  </header>
);
