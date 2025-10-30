import React, { useCallback, useState } from 'react';
import { InteractiveOrb } from './components/InteractiveOrb';
import { useGeminiLive } from './hooks/useGeminiLive';
import { ConnectionState } from './types';

const App: React.FC = () => {
  // Transcript updates are no longer displayed in the UI.
  const onTranscriptUpdate = useCallback(() => {}, []);
  const [showApiMessage, setShowApiMessage] = useState(true);

  const { connectionState, startSession, stopSession, error, isSpeaking } = useGeminiLive(onTranscriptUpdate);

  const handleStartSession = () => {
    const isIdle = connectionState === ConnectionState.DISCONNECTED || connectionState === ConnectionState.ERROR;
    if (isIdle) {
      startSession();
    }
  };

  const isSessionActive = connectionState === ConnectionState.CONNECTING || connectionState === ConnectionState.CONNECTED;

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0c0a1a] relative overflow-hidden p-4">
      {showApiMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-cyan-900/50 border border-cyan-400/30 text-cyan-200 text-center p-3 rounded-lg shadow-lg text-sm z-20">
          <strong>Note:</strong> Your API key is managed securely via an environment variable. You do not need to enter it here.
          <button 
            onClick={() => setShowApiMessage(false)} 
            className="absolute top-1 right-2 text-cyan-400 hover:text-white transition-colors"
            aria-label="Dismiss message"
          >
            &times;
          </button>
        </div>
      )}

      <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center">
        {/* Animated Gradient Ring */}
        <div
          className={`
            absolute inset-[-3px] rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500
            transition-opacity duration-500
            ${isSessionActive ? 'opacity-70 animate-[rotate_4s_linear_infinite]' : 'opacity-30'}
          `}
        />
        {/* Inner mask to create the ring effect */}
        <div className="absolute inset-0 bg-[#0c0a1a] rounded-full" />
        
        {/* Orb container */}
        <div className="relative z-10 w-[95%] h-[95%]">
            <InteractiveOrb
              connectionState={connectionState}
              isSpeaking={isSpeaking}
              onClick={handleStartSession}
              disabled={isSessionActive}
            />
        </div>
      </div>

      {isSessionActive && (
        <button
          onClick={stopSession}
          aria-label="Stop Session"
          className="mt-10 bg-red-500/20 text-red-300 font-semibold px-8 py-3 rounded-full 
                     hover:bg-red-500/40 focus:outline-none focus:ring-4 focus:ring-red-500/50 
                     transition-all duration-300 ease-in-out"
        >
          Stop
        </button>
      )}
      
      {error && (
         <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-red-500/20 text-red-300 px-4 py-2 rounded-lg text-sm font-semibold selection:bg-red-300 selection:text-black">
           {error}
         </div>
      )}
    </main>
  );
};

export default App;