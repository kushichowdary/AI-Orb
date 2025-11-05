

import React, { useState, useEffect, useRef } from 'react';
// FIX: Use v8 namespaced API instead of v9 modular imports
// import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './utils/firebase';
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
import { DecoderText } from './components/DecoderText';

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
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [postAuthState, setPostAuthState] = useState<PostAuthState>('initial');
  const [language, setLanguage] = useState('English');
  const languages = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Japanese', 'Telugu'];
  
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

  // Centralized effect to manage authentication state and UI flow.
  useEffect(() => {
    // FIX: Use v8 namespaced auth.onAuthStateChanged
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsAuthenticated(true);
        
        const creationTime = user.metadata.creationTime ? new Date(user.metadata.creationTime).getTime() : 0;
        const lastSignInTime = user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).getTime() : 0;
        // A new user is detected if their last sign-in is within a few seconds of their creation time.
        const isNewUser = (lastSignInTime - creationTime) < 5000;

        if (isNewUser) {
          // For a new user, the displayName set during signup might not be immediately available.
          // We must reload the user object to fetch the latest profile from Firebase.
          await user.reload();
          
          // Now that the profile is updated, store the correct name.
          localStorage.setItem('jarvis-user-name', user.displayName || 'Agent');
          
          // Only new users should see the digital pass animation.
          setPostAuthState('showingPass');
        } else {
          // For existing users who are logging in, just store their name.
          localStorage.setItem('jarvis-user-name', user.displayName || 'Agent');
          
          // They will see the system boot sequence, not the digital pass.
          setPostAuthState('bootingSequence');
        }

      } else {
        setIsAuthenticated(false);
        localStorage.removeItem('jarvis-user-name');
        setPostAuthState('initial'); // Reset flow on logout
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const handleLogout = () => {
    stopSession(); // Ensure the AI session is terminated on logout
    // FIX: Use v8 namespaced auth.signOut
    auth.signOut().catch(error => console.error("Logout error:", error));
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
  
  if (isAuthLoading) {
    return <div className="h-screen w-full flex items-center justify-center bg-black" aria-label="Loading application"></div>;
  }

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
        <div className="w-full h-full flex flex-col items-center justify-center relative">
            <div id="particle-container">
              {Array.from({ length: 30 }).map((_, i) => (
                <span key={i} className="particle" />
              ))}
            </div>

            <div className="text-center mb-8 z-10 animate-fadeIn">
              <h1 className="font-jarvis text-4xl sm:text-5xl font-bold text-white tracking-wider">
                <DecoderText text="JARVIS" />
              </h1>
              <p className="text-gray-400 mt-2"> AI Assistant </p>
            </div>

            <div className="relative z-10">
              <AuthPage />
            </div>
        </div>
      )}
    </main>
  );
};

export default App;
