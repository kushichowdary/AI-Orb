
import React from 'react';

/**
 * Renders the main application header with the title "JARVIS".
 * It's positioned at the top and is purely presentational.
 */
export const Header: React.FC = () => (
  <header className="absolute top-0 left-0 right-0 p-6 text-center z-20 pointer-events-none">
    <h1 className="text-3xl font-bold text-white tracking-wider">JARVIS</h1>
  </header>
);
