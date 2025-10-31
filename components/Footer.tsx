
import React, { useState } from 'react';

/**
 * Renders a responsive footer.
 * Features a glowing, animated button that toggles social media links for a clean UI.
 */
export const Footer: React.FC = () => {
  const [linksVisible, setLinksVisible] = useState(false);

  // A reusable component for the social link icons to avoid repetition.
  const SocialLinkIcons = () => (
    <>
      {/* GitHub Link */}
      <a
        href="https://github.com/kushichowdary"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View my GitHub profile"
        className="text-lime-400 hover:text-white transition-all duration-300 hover:scale-110 focus:scale-110 hover:drop-shadow-[0_0_6px_rgba(184,251,60,0.7)]"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
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
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM6 9H2v12h4V9zM4 6.48C2.58 6.48 1.48 5.38 1.48 4s1.1-2.48 2.52-2.48C5.42 1.52 6.52 2.62 6.52 4S5.42 6.48 4 6.48z" />
        </svg>
      </a>
    </>
  );

  return (
      <footer className="w-full p-3 md:p-4 flex justify-between items-center z-30">
        <p className="text-[11px] text-gray-500">Made by Kushwanth</p>
        <div className="flex items-center gap-3">
          {/* Animated container for links */}
          <div className={`flex items-center gap-3 transition-all duration-300 ease-in-out ${linksVisible ? 'max-w-40 opacity-100' : 'max-w-0 opacity-0 overflow-hidden'}`}>
            <SocialLinkIcons />
          </div>
          {/* The button to toggle links */}
          <button
            onClick={() => setLinksVisible(!linksVisible)}
            aria-expanded={linksVisible}
            aria-label="Toggle social links"
            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-lime-400/80 text-black flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-lime-300 focus:outline-none focus:ring-2 focus:ring-lime-300 animate-subtle-glow"
          >
            <svg xmlns="http://www.w.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </footer>
  );
};
