import React, { useState, useRef, useEffect } from 'react';
import { ConnectionState } from '../types';

interface ControlsProps {
  isSessionActive: boolean;
  onStopSession: () => void;
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  languages: string[];
  connectionState: ConnectionState;
  onRetry: () => void;
}

/**
 * Renders the primary user controls: "Stop" button during a session,
 * "Retry" button on error, and a custom language selector when idle.
 */
export const Controls: React.FC<ControlsProps> = ({
  isSessionActive,
  onStopSession,
  selectedLanguage,
  onLanguageChange,
  languages,
  connectionState,
  onRetry,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Effect to close the dropdown when clicking outside of it.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderContent = () => {
    if (isSessionActive) {
      return (
        <button
          onClick={onStopSession}
          aria-label="Stop Session"
          className="bg-gray-200 text-gray-900 font-semibold px-8 py-3 rounded-full shadow-lg 
                    border border-transparent
                    hover:bg-red-500 hover:text-white hover:shadow-xl hover:shadow-red-500/20
                    focus:outline-none focus:ring-4 focus:ring-red-500/50 
                    transition-all duration-300 ease-in-out animate-fadeIn"
        >
          Stop
        </button>
      );
    }
    if (connectionState === ConnectionState.ERROR) {
      return (
        <button
          onClick={onRetry}
          aria-label="Retry Connection"
          className="bg-lime-400 text-black font-semibold px-8 py-3 rounded-full shadow-lg
                    border border-transparent
                    hover:bg-lime-300 hover:shadow-xl hover:shadow-lime-400/20
                    focus:outline-none focus:ring-4 focus:ring-lime-400/50 
                    transition-all duration-300 ease-in-out animate-fadeIn animate-subtle-glow"
        >
          Retry
        </button>
      );
    }
    // Custom dropdown for language selection
    return (
      <div ref={dropdownRef} className="relative w-44 animate-fadeIn">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          aria-haspopup="listbox"
          aria-expanded={isDropdownOpen}
          aria-label="Select language"
          className="w-full bg-gray-800 text-white text-sm rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400/80 cursor-pointer transition-all duration-300 hover:bg-gray-700 flex justify-between items-center animate-subtle-glow"
        >
          <span>{selectedLanguage}</span>
          <svg className={`fill-current h-4 w-4 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </button>

        {isDropdownOpen && (
          <ul
            role="listbox"
            className="absolute bottom-full mb-2 w-full bg-gray-900/90 backdrop-blur-sm border border-lime-400/30 rounded-lg shadow-2xl p-1 overflow-y-auto max-h-48 z-20 animate-slideUpFadeIn animate-subtle-glow"
          >
            {languages.map(lang => (
              <li
                key={lang}
                role="option"
                aria-selected={lang === selectedLanguage}
                onClick={() => {
                  onLanguageChange(lang);
                  setIsDropdownOpen(false);
                }}
                className={`px-3 py-1.5 text-sm rounded-md cursor-pointer transition-all duration-200 text-center relative ${
                  lang === selectedLanguage
                    ? 'font-semibold text-lime-400'
                    : 'text-gray-300 hover:text-white hover:bg-lime-500/10'
                }`}
              >
                {lang === selectedLanguage && (
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-1 bg-lime-400 rounded-full shadow-[0_0_4px_rgba(184,251,60,0.8)]"></span>
                )}
                {lang}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
  
  return (
    <div className="h-16 z-10 flex items-center justify-center">
      {renderContent()}
    </div>
  );
};
