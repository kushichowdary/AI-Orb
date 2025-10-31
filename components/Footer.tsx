
import React, { useState } from 'react';

/**
 * Renders an interactive footer. It displays an info button that, when clicked,
 * reveals a panel with social media links and creator credit.
 * The panel appears with a smooth animation.
 */
export const Footer: React.FC = () => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="absolute bottom-4 right-4 z-30">
      {/* Main container for the button and the pop-up panel */}
      <div className="relative flex flex-col items-end">

        {/* The info panel that appears on click */}
        <div 
          className={`
            flex flex-col items-end gap-3 mb-3
            p-3 rounded-xl 
            bg-gray-900/80 backdrop-blur-sm 
            shadow-lg shadow-lime-500/10
            border border-lime-500/20
            transform transition-all duration-300 ease-in-out
            ${showInfo ? 'translate-y-0 opacity-100 visible' : 'translate-y-4 opacity-0 invisible'}
          `}
          aria-hidden={!showInfo}
        >
          
          
          {/* GitHub Link */}
          <a 
            href="https://github.com/kushichowdary" 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="View my GitHub profile"
            className="text-lime-400 hover:text-white transition-all duration-300 hover:scale-110 focus:scale-110 hover:drop-shadow-[0_0_6px_rgba(184,251,60,0.7)]"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
          
          {/* LinkedIn Link */}
          <a 
            href="https://linkedin.com/in/kushichowdary/"
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="View my LinkedIn profile"
            className="text-lime-400 hover:text-white transition-all duration-300 hover:scale-110 focus:scale-110 hover:drop-shadow-[0_0_6px_rgba(184,251,60,0.7)]"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM6 9H2v12h4V9zM4 6.48C2.58 6.48 1.48 5.38 1.48 4s1.1-2.48 2.52-2.48C5.42 1.52 6.52 2.62 6.52 4S5.42 6.48 4 6.48z" />
            </svg>
          </a>
        </div>

        {/* The clickable button to toggle the panel */}
        <button
          onClick={() => setShowInfo(!showInfo)}
          aria-label="Show creator information"
          aria-expanded={showInfo}
          className="
            animate-subtle-glow
            w-10 h-10 rounded-full bg-gray-800/80 backdrop-blur-sm
            border border-gray-700
            flex items-center justify-center 
            text-gray-400 hover:text-white hover:border-lime-500
            focus:outline-none focus:ring-2 focus:ring-lime-500
            transition-all duration-200
          "
        >
          {/* Info icon SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

      </div>
    </div>
  );
};