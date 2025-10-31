
import React from 'react';

interface ControlsProps {
  isSessionActive: boolean;
  onStopSession: () => void;
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  languages: string[];
}

/**
 * Renders the primary user controls: the "Stop" button during an active session,
 * and the language selector when the application is idle.
 */
export const Controls: React.FC<ControlsProps> = ({
  isSessionActive,
  onStopSession,
  selectedLanguage,
  onLanguageChange,
  languages,
}) => {
  return (
    <div className="h-16 z-10 flex items-center justify-center">
      {isSessionActive ? (
        <button
          onClick={onStopSession}
          aria-label="Stop Session"
          className="bg-gray-200 text-gray-900 font-semibold px-8 py-3 rounded-full shadow-lg 
                    border border-transparent
                    hover:bg-red-500 hover:text-white hover:shadow-xl hover:shadow-red-500/20
                    focus:outline-none focus:ring-4 focus:ring-red-500/50 
                    transition-all duration-300 ease-in-out"
        >
          Stop
        </button>
      ) : (
        <div className="relative">
          <select
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-gray-800 text-white rounded-full px-5 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
            aria-label="Select language"
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      )}
    </div>
  );
};
