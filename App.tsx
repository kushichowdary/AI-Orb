
import React, { useState, useEffect } from 'react';
import { InteractiveOrb } from './components/InteractiveOrb';
import { useGeminiLive } from './hooks/useGeminiLive';
import { useKeywordDetection } from './hooks/useKeywordDetection';
import { ConnectionState } from './types';
import { playStopSound } from './utils/audioCues';
import { Header } from './components/Header';
import { StatusIndicator } from './components/StatusIndicator';
import { Controls } from './components/Controls';
import { Footer } from './components/Footer';
import { AuthPage } from './components/AuthPage';

const LANGUAGES = ['English', 'Telugu', 'Spanish', 'French', 'German', 'Hindi'];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);

  // Check for an existing session on component mount
  useEffect(() => {
    const sessionActive = localStorage.getItem('jarvis-session') === 'true';
    if (sessionActive) {
      setIsAuthenticated(true);
    }
  }, []);

  const { connectionState, startSession, stopSession, error, isSpeaking, isUserSpeaking } = useGeminiLive(process.env.API_KEY || null, selectedLanguage);
  
  const isIdle = connectionState === ConnectionState.DISCONNECTED || connectionState === ConnectionState.ERROR;
  const isSessionActive = connectionState === ConnectionState.CONNECTING || connectionState === ConnectionState.CONNECTED;

  const { permissionDenied: keywordPermissionDenied } = useKeywordDetection({
    keywords: ['start', 'hey jarvis'],
    onKeywordDetected: startSession,
    enabled: isIdle && isAuthenticated, // Only enable keyword detection when logged in and idle
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

  const handleLoginSuccess = () => {
    localStorage.setItem('jarvis-session', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('jarvis-session');
    if (isSessionActive) {
      stopSession();
    }
    setIsAuthenticated(false);
  };
  
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden p-4 bg-black text-white">
      {isAuthenticated ? (
        <>
          <Header onLogout={handleLogout} />
          
          <div className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center z-10">
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
        </>
      ) : (
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      )}
    </main>
  );
};

export default App;