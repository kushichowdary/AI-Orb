import React from 'react';

interface HeaderProps {
  onLogout: () => void;
}

/**
 * Renders the main application header.
 * It displays the title "JARVIS" and a logout button when the user is logged in.
 */
export const Header: React.FC<HeaderProps> = ({ onLogout }) => (
  <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 w-full">
    <div className="w-20" /> {/* Spacer to balance the logout button */}
    <h1 className="text-3xl font-bold text-white tracking-wider text-center flex-1">
      J<span className="text-lime-400">A</span>RV<span className="text-lime-400">I</span>S
    </h1>
    <div className="w-20 flex justify-end">
      <button
        onClick={onLogout}
        className="text-gray-400 hover:text-white text-sm font-semibold transition-colors duration-200"
        aria-label="Logout"
      >
        Logout
      </button>
    </div>
  </header>
);