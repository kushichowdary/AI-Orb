
import React from 'react';
import { InteractiveOrb } from './components/InteractiveOrb';
import { useGeminiLive } from './hooks/useGeminiLive';
import { ConnectionState } from './types';
import { BubbleVisualizer as GridBackground } from './components/BubbleVisualizer';
import { playStopSound } from './utils/audioCues';

const App: React.FC = () => {
  // The API key is now provided via an environment variable for security.
  // Ensure `process.env.API_KEY` is set in your deployment environment.
  const { connectionState, startSession, stopSession, error, isSpeaking, isUserSpeaking } = useGeminiLive(process.env.API_KEY || null);

  const handleOrbClick = () => {
    const isIdle = connectionState === ConnectionState.DISCONNECTED || connectionState === ConnectionState.ERROR;
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
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0a0a0f] relative overflow-hidden p-4">
      <GridBackground />
      
      <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center z-10">
        <InteractiveOrb
          connectionState={connectionState}
          isSpeaking={isSpeaking}
          isUserSpeaking={isUserSpeaking}
          onClick={handleOrbClick}
          disabled={isSessionActive}
        />
      </div>

      {isSessionActive && (
        <button
          onClick={handleStopSession}
          aria-label="Stop Session"
          className="mt-10 bg-gray-800/50 text-gray-300 font-semibold px-8 py-3 rounded-full shadow-lg backdrop-blur-sm
                     border border-gray-700
                     hover:bg-red-900/50 hover:text-red-300 hover:border-red-700
                     focus:outline-none focus:ring-4 focus:ring-red-500/50 
                     transition-all duration-300 ease-in-out z-10"
        >
          Stop
        </button>
      )}
      
      {error && (
         <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-red-900/50 text-red-300 px-4 py-2 rounded-lg text-sm font-semibold border border-red-700 shadow-lg backdrop-blur-sm z-20">
           {error}
         </div>
      )}
    </main>
  );
};

export default App;
