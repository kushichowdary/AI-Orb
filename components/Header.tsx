import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center py-6">
      <h1 className="text-4xl md:text-5xl font-bold text-cyan-300 tracking-wider">
        Echo Lingua AI
      </h1>
      <p className="text-cyan-500 mt-2">Your Real-Time Language Practice Partner</p>
    </header>
  );
};