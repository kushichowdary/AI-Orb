
import React, { useState } from 'react';
import { InteractiveOrb } from './components/InteractiveOrb';
import { useGeminiLive } from './hooks/useGeminiLive';
import { useKeywordDetection } from './hooks/useKeywordDetection';
import { ConnectionState } from './types';
import { playStopSound } from './utils/audioCues';

const LANGUAGES = ['English', 'Telugu', 'Spanish', 'French', 'German', 'Hindi'];

/**
 * Generates a user-friendly status message based on the application's current state.
 * This helps the user understand what's happening at any given moment.
 */
const getStatusText = (
  state: ConnectionState, 
  isSpeaking: boolean, 
  isUserSpeaking: boolean, 
  error: string | null,
  keywordPermissionDenied: boolean
): string => {
  if (error) return error;
  switch (state) {
    case ConnectionState.DISCONNECTED:
      if (keywordPermissionDenied) {
        return "Mic permission denied for \"Hey JARVIS\". Tap orb to start.";
      }
      return "Select your language, then say \"Hey JARVIS\" or tap orb to begin.";
    case ConnectionState.CONNECTING:
      return "Connecting...";
    case ConnectionState.ERROR:
       return "An error occurred. Please tap to retry.";
    case ConnectionState.CONNECTED:
      if (isSpeaking) return "Listening to JARVIS...";
      if (isUserSpeaking) return "I hear you...";
      return "I'm listening.";
    default:
      // This should never be reached, but it's good practice to have a default.
      return "";
  }
};

const App: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);

  // The core hook that manages the Gemini Live session.
  const { connectionState, startSession, stopSession, error, isSpeaking, isUserSpeaking } = useGeminiLive(process.env.API_KEY || null, selectedLanguage);

  // A helper boolean to determine if the app is in a state where a new session can be started.
  const isIdle = connectionState === ConnectionState.DISCONNECTED || connectionState === ConnectionState.ERROR;
  
  // A helper boolean to determine if a session is currently active or trying to connect.
  const isSessionActive = connectionState === ConnectionState.CONNECTING || connectionState === ConnectionState.CONNECTED;

  // The hook that listens for the "Hey JARVIS" keyword.
  // It's only enabled when the app is idle to save resources.
  const { permissionDenied: keywordPermissionDenied } = useKeywordDetection({
    keywords: ['start', 'hey jarvis'],
    onKeywordDetected: startSession,
    enabled: isIdle,
  });

  const handleOrbClick = () => {
    // The orb can only start a session, not stop it.
    if (isIdle) {
      startSession();
    }
  };

  const handleStopSession = () => {
    // Play a sound cue to confirm the action.
    playStopSound();
    stopSession();
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden p-4 bg-black text-white">
      <header className="absolute top-0 left-0 right-0 p-6 text-center z-20 pointer-events-none">
        <h1 className="text-3xl font-bold text-white tracking-wider">JARVIS</h1>
      </header>
      
      <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center z-10">
        <InteractiveOrb
          connectionState={connectionState}
          isSpeaking={isSpeaking}
          isUserSpeaking={isUserSpeaking}
          onClick={handleOrbClick}
          disabled={isSessionActive}
        />
      </div>

      <div className="h-20 flex items-center justify-center z-10 text-center">
        <p className={`transition-opacity duration-300 text-base ${error || (isIdle && keywordPermissionDenied) ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
          {getStatusText(connectionState, isSpeaking, isUserSpeaking, error, keywordPermissionDenied)}
        </p>
      </div>

      <div className="h-16 z-10 flex items-center justify-center">
        {isSessionActive ? (
          // Show the 'Stop' button only when a session is active.
          <button
            onClick={handleStopSession}
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
          // Show the language selector when idle.
           <div className="relative">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-gray-800 text-white rounded-full px-5 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
              aria-label="Select language"
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
            {/* Simple dropdown arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default App;
