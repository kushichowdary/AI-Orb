
import React from 'react';
import { InteractiveOrb } from './components/InteractiveOrb';
import { useGeminiLive } from './hooks/useGeminiLive';
import { useKeywordDetection } from './hooks/useKeywordDetection';
import { ConnectionState } from './types';
import { playStopSound } from './utils/audioCues';

const getStatusText = (
  state: ConnectionState, 
  isSpeaking: boolean, 
  isUserSpeaking: boolean, 
  error: string | null
): string => {
  if (error) return error;
  switch (state) {
    case ConnectionState.DISCONNECTED:
      return "Say \"Hey JARVIS\" or tap the orb to begin.";
    case ConnectionState.CONNECTING:
      return "Connecting...";
    case ConnectionState.ERROR:
       return "An error occurred. Please tap to retry.";
    case ConnectionState.CONNECTED:
      if (isSpeaking) return "Listening to JARVIS...";
      if (isUserSpeaking) return "I hear you...";
      return "I'm listening.";
    default:
      return "";
  }
};

const App: React.FC = () => {
  const { connectionState, startSession, stopSession, error, isSpeaking, isUserSpeaking } = useGeminiLive(process.env.API_KEY || null);

  const isIdle = connectionState === ConnectionState.DISCONNECTED || connectionState === ConnectionState.ERROR;

  useKeywordDetection({
    keywords: ['start', 'hey jarvis'],
    onKeywordDetected: startSession,
    enabled: isIdle,
  });

  const handleOrbClick = () => {
    if (isIdle) {
      startSession();
    }
  };

  const handleStopSession = () => {
    playStopSound();
    stopSession();
  };

  const isSessionActive = connectionState === ConnectionState.CONNECTING || connectionState === ConnectionState.CONNECTED;

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
        <p className={`transition-opacity duration-300 text-base ${error ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
          {getStatusText(connectionState, isSpeaking, isUserSpeaking, error)}
        </p>
      </div>

      <div className="h-16 z-10">
        {isSessionActive && (
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
        )}
      </div>
    </main>
  );
};

export default App;