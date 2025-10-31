
import React, { useState } from 'react';
import { InteractiveOrb } from './components/InteractiveOrb';
import { useGeminiLive } from './hooks/useGeminiLive';
import { useKeywordDetection } from './hooks/useKeywordDetection';
import { ConnectionState } from './types';
import { playStopSound } from './utils/audioCues';
import { Header } from './components/Header';
import { StatusIndicator } from './components/StatusIndicator';
import { Controls } from './components/Controls';
import { Footer } from './components/Footer';

const LANGUAGES = ['English', 'Telugu', 'Spanish', 'French', 'German', 'Hindi'];

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
      <Header />
      
      <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center z-10">
        <InteractiveOrb
          connectionState={connectionState}
          isSpeaking={isSpeaking}
          isUserSpeaking={isUserSpeaking}
          onClick={handleOrbClick}
          disabled={isSessionActive}
        />
      </div>

      <StatusIndicator
        connectionState={connectionState}
        isSpeaking={isSpeaking}
        isUserSpeaking={isUserSpeaking}
        error={error}
        keywordPermissionDenied={keywordPermissionDenied}
      />

      <Controls
        isSessionActive={isSessionActive}
        onStopSession={handleStopSession}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        languages={LANGUAGES}
      />

      <Footer />
      
      {/* Centered Creator Credit */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-600 z-20 pointer-events-none">
        Made by Kushwanth
      </div>
    </main>
  );
};

export default App;