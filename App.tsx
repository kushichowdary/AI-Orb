
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AuthPage } from './components/AuthPage';
import Card from './components/Card';
import { useGeminiLive } from './hooks/useGeminiLive';
import { useKeywordDetection } from './hooks/useKeywordDetection';
import { ConnectionState } from './types';
import { InteractiveOrb } from './components/InteractiveOrb';
import { StatusIndicator } from './components/StatusIndicator';
import { Controls } from './components/Controls';
import { Footer } from './components/Footer';
import { playStopSound } from './utils/audioCues';

type PostAuthState = 'initial' | 'showingPass' | 'showingOrb';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [postAuthState, setPostAuthState] = useState<PostAuthState>('initial');
  const [language, setLanguage] = useState('English');
  const languages = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Japanese'];
  
  // The API key is securely managed by the environment.
  const apiKey = process.env.API_KEY;

  const { 
      connectionState, 
      startSession, 
      stopSession, 
      error, 
      isSpeaking, 
      isUserSpeaking 
  } = useGeminiLive(apiKey, language);

  const isSessionActive = connectionState === ConnectionState.CONNECTING || connectionState === ConnectionState.CONNECTED;

  const handleKeywordDetected = () => {
    if (!isSessionActive) {
      startSession();
    }
  };
  
  const { permissionDenied: keywordPermissionDenied } = useKeywordDetection({
    keywords: ['hey jarvis', 'jarvis'],
    onKeywordDetected: handleKeywordDetected,
    enabled: !isSessionActive,
  });

  // Check for an existing session on component mount
  useEffect(() => {
    const sessionActive = localStorage.getItem('jarvis-session') === 'true';
    if (sessionActive) {
      setIsAuthenticated(true);
      // If session already exists, skip the pass animation and go straight to the orb.
      setPostAuthState('showingOrb');
    }
  }, []);

  const handleLoginSuccess = () => {
    localStorage.setItem('jarvis-session', 'true');
    setIsAuthenticated(true);
    // Start the post-login sequence by showing the pass animation.
    setPostAuthState('showingPass');
  };

  const handleLogout = () => {
    localStorage.removeItem('jarvis-session');
    stopSession(); // Ensure the AI session is terminated on logout
    setIsAuthenticated(false);
    setPostAuthState('initial'); // Reset the flow
  };
  
  const handleOrbClick = () => {
    if (!isSessionActive) {
      startSession();
    }
  };
  
  const handleStopSession = () => {
    playStopSound();
    stopSession();
  };

  return (
    <main className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-black text-white">
      {isAuthenticated ? (
        <>
          {postAuthState === 'showingPass' && (
            <Card onExitAnimationComplete={() => setPostAuthState('showingOrb')} />
          )}

          {postAuthState === 'showingOrb' && (
            <div className="w-full h-screen flex flex-col animate-fadeIn">
              <Header onLogout={handleLogout} />
              
              {/* Main content area that grows and centers content */}
              <div className="flex-1 w-full flex flex-col items-center justify-center p-4 overflow-hidden">
                {/* Responsive container for the orb to maintain its aspect ratio */}
                <div className="w-full max-w-xs sm:max-w-sm md:max-w-md aspect-square">
                    <InteractiveOrb
                        connectionState={connectionState}
                        isSpeaking={isSpeaking}
                        isUserSpeaking={isUserSpeaking}
                        onClick={handleOrbClick}
                        disabled={isSessionActive}
                    />
                </div>
                
                {/* UI elements below the orb */}
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
                    selectedLanguage={language}
                    onLanguageChange={setLanguage}
                    languages={languages}
                    connectionState={connectionState}
                    onRetry={() => startSession()}
                />
              </div>

              <Footer />
            </div>
          )}
        </>
      ) : (
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      )}
    </main>
  );
};

export default App;
