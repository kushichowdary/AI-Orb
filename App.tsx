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
import { SystemCoreTransition } from './components/SystemCoreTransition';

type PostAuthState = 'initial' | 'showingPass' | 'bootingSequence' | 'showingOrb';

/**
 * A small, single-use component to display a personalized welcome message.
 */
const WelcomeTitle: React.FC = () => {
  const name = localStorage.getItem('jarvis-user-name') || 'Agent';

  return (
    <div className="text-center">
      <h2 className="font-jarvis text-4xl md:text-5xl font-bold text-white tracking-wider">
        Welcome, <span className="text-lime-400">{name}</span>
      </h2>
      <p className="text-gray-400 mt-2">Initializing Digital Pass...</p>
    </div>
  );
};


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [postAuthState, setPostAuthState] = useState<PostAuthState>('initial');
  const [language, setLanguage] = useState('English');
  const languages = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Japanese', 'Telugu'];
  
  // The API key is securely managed by the environment.
  const apiKey = process.env.API_KEY;

  const { 
      connectionState, 
      startSession, 
      stopSession, 
      error, 
      isSpeaking, 
      isUserSpeaking,
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
    enabled: isAuthenticated && postAuthState === 'showingOrb' && !isSessionActive,
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
    localStorage.removeItem('jarvis-user-name');
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
             <div className="relative w-full h-full">
                <div className="absolute top-[15%] left-0 right-0 z-20 pointer-events-none animate-fadeInAndOut">
                    <WelcomeTitle />
                </div>
                <Card onExitAnimationComplete={() => setPostAuthState('bootingSequence')} />
            </div>
          )}
          
          {postAuthState === 'bootingSequence' && (
            <SystemCoreTransition onComplete={() => setPostAuthState('showingOrb')} />
          )}

          {postAuthState === 'showingOrb' && (
            <div className="w-full h-screen flex flex-col animate-fadeIn nebula-background">
              <Header onLogout={handleLogout} />
              
              {/* Main content area that grows and centers content */}
              <div className="flex-1 w-full flex flex-col p-4 overflow-hidden min-h-0">
                {/* Container for conversation and orb, with relative positioning */}
                <div className="flex-1 w-full flex flex-col items-center justify-center min-h-0 relative">
                  
                  {/* Orb container, centered in the remaining space */}
                  <div className="w-full max-w-xs sm:max-w-sm md:max-w-md aspect-square">
                      <InteractiveOrb
                          connectionState={connectionState}
                          isSpeaking={isSpeaking}
                          isUserSpeaking={isUserSpeaking}
                          onClick={handleOrbClick}
                          disabled={isSessionActive}
                      />
                  </div>
                </div>
                
                {/* Controls are in a container at the bottom of this flex area */}
                <div className="flex-shrink-0">
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
              </div>

              <Footer />
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
            <div id="particle-container">
              {Array.from({ length: 30 }).map((_, i) => (
                <span key={i} className="particle" />
              ))}
            </div>
            <div className="relative">
              <AuthPage onLoginSuccess={handleLoginSuccess} />
            </div>
        </div>
      )}
    </main>
  );
};

export default App;
