
import React from 'react';

interface HeaderProps {
  onLogout: () => void;
}

/**
 * Renders the main application header.
 * It displays the title "JARVIS" and a logout button when the user is logged in.
 * Uses a grid layout to ensure the title is perfectly centered.
 */
export const Header: React.FC<HeaderProps> = ({ onLogout }) => (
  <header className="p-4 md:p-6 grid grid-cols-3 items-center z-20 w-full">
    {/* Empty left cell for spacing, ensuring the title is centered in the middle cell */}
    <div /> 
    <h1 className="font-jarvis text-3xl font-bold text-white tracking-wider text-center col-start-2">
      J<span className="text-lime-400">A</span>RV<span className="text-lime-400">I</span>S
    </h1>
    <div className="flex justify-end col-start-3">
      <button
        onClick={onLogout}
        className="text-gray-400 hover:text-lime-400 text-sm font-semibold transition-all duration-300 hover:scale-105 hover:-translate-y-px hover:drop-shadow-[0_0_4px_rgba(184,251,60,0.6)]"
        aria-label="Logout"
      >
        Logout
      </button>
    </div>
  </header>
);
