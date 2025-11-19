import React, { useState, FormEvent } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  AuthError,
} from 'firebase/auth';
import { auth } from '../utils/firebase';
import DecoderText from '../components/DecoderText';

type AuthMode = 'login' | 'signup' | 'forgotPassword';

const getFirebaseErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Access denied. Invalid credentials.';
    case 'auth/email-already-in-use':
      return 'Access ID already registered in system.';
    case 'auth/weak-password':
      return 'Security Key too weak. Minimum 6 characters required.';
    case 'auth/invalid-email':
      return 'Invalid Access ID format.';
    case 'auth/network-request-failed':
      return 'Network Uplink Failed. Check connection.';
    default:
      return 'System Error. Authentication failed.';
  }
};

export const AuthPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else if (authMode === 'signup') {
        if (!name) {
          setError('Agent Designation required.');
          setIsLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
      } else if (authMode === 'forgotPassword') {
        await sendPasswordResetEmail(auth, email);
        setMessage('Recovery sequence transmitted to Access ID.');
        setAuthMode('login');
      }
    } catch (e) {
      const authError = e as AuthError;
      setError(getFirebaseErrorMessage(authError.code));
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (authMode) {
      case 'login':
        return 'Identity Verification';
      case 'signup':
        return 'Agent Registration';
      case 'forgotPassword':
        return 'Credential Recovery';
    }
  };

  const getButtonText = () => {
    if (isLoading) return 'Processing...';
    switch (authMode) {
      case 'signup':
        return 'Initialize Protocol';
      case 'login':
        return 'Authenticate';
      case 'forgotPassword':
        return 'Transmit Override';
    }
  };

  // highlight A and I (position 1 and 4)
  const highlightIndexes = [1, 4];

  return (
    <div className="w-full max-w-sm flex flex-col items-center font-jarvis">
      <div className="text-center mb-6">
        {/* J(AI)RVS with AI highlighted in lime (no glow) */}
        <DecoderText
          text="JARVIS"
          delay={800}
          speed={9}
          highlightIndexes={highlightIndexes}
          className="text-5xl font-bold"
        />
        {/* subtitle changed to 'assistant' in lime */}
        <p className="text-lime-400 text-lg mt-2 tracking-widest">
          Assistant
        </p>
      </div>

      {/* Updated Card Styling: Transparent initially, blur on hover, with LIME GLOW EDGES */}
      <div className="w-full bg-transparent backdrop-blur-[2px] hover:backdrop-blur-xl hover:bg-black/60 border border-white/10 rounded-2xl shadow-2xl p-8 transition-all duration-500 ease-out group hover:border-lime-400/50 hover:shadow-[0_0_20px_rgba(184,251,60,0.3)]">
        <h2 className="text-2xl font-bold text-center text-white mb-6 tracking-wide group-hover:drop-shadow-[0_0_10px_rgba(184,251,60,0.5)] transition-all">{getTitle()}</h2>

        {error && <p className="text-red-400 text-center text-sm mb-4 bg-red-500/10 py-2 rounded border border-red-500/20">{error}</p>}
        {message && <p className="text-lime-400 text-center text-sm mb-4 bg-lime-500/10 py-2 rounded border border-lime-500/20">{message}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {authMode === 'signup' && (
            <div className="relative">
              <label htmlFor="name" className="sr-only">Agent Designation</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Agent Designation"
                required
                disabled={isLoading}
                className="w-full bg-white/5 text-white placeholder-gray-400 border border-white/10 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm hover:bg-white/10 text-sm tracking-wide"
              />
            </div>
          )}

          <div className="relative">
            <label htmlFor="email" className="sr-only">Access ID</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Access ID"
              required
              disabled={isLoading}
              className="w-full bg-white/5 text-white placeholder-gray-400 border border-white/10 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm hover:bg-white/10 text-sm tracking-wide"
            />
          </div>

          {authMode !== 'forgotPassword' && (
            <div className="relative">
              <label htmlFor="password" className="sr-only">Security Key</label>
              <input
                id="password"
                type={isPasswordVisible ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Security Key"
                required
                disabled={isLoading}
                className="w-full bg-white/5 text-white placeholder-gray-400 border border-white/10 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed pr-10 backdrop-blur-sm hover:bg-white/10 text-sm tracking-wide"
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                disabled={isLoading}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-lime-400 focus:outline-none focus:text-lime-400 transition-colors disabled:opacity-50"
                aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
              >
                {isPasswordVisible ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074L3.707 2.293zM10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                    <path d="M2 10s3.939 4 8 4 8-4 8-4-3.939-4-8-4-8 4-8 4zm10 0a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                )}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-lime-400 text-black font-bold py-3 px-4 rounded-lg hover:bg-lime-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-lime-400 transition-all duration-300 shadow-[0_0_15px_rgba(184,251,60,0.3)] hover:shadow-[0_0_25px_rgba(184,251,60,0.6)] disabled:bg-lime-400/50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] tracking-wider"
          >
            {getButtonText()}
          </button>
        </form>

        <div className="text-center mt-6 space-y-2">
          {authMode === 'login' ? (
            <>
              <button
                onClick={() => { setAuthMode('forgotPassword'); setError(null); setMessage(null); }}
                className="text-xs text-gray-400 hover:text-lime-400 transition-colors duration-200 disabled:opacity-50 uppercase tracking-wider"
                disabled={isLoading}
              >
                Lost Credentials?
              </button>
              <p className="text-xs text-gray-500">
                UNREGISTERED?{' '}
                <button
                  onClick={() => { setAuthMode('signup'); setError(null); setMessage(null); }}
                  className="font-semibold text-lime-400 hover:text-lime-300 transition-colors duration-200 disabled:opacity-50 ml-1 uppercase tracking-wider"
                  disabled={isLoading}
                >
                  Register New Agent
                </button>
              </p>
            </>
          ) : (
            <p className="text-xs text-gray-500">
              Have Credentials?{' '}
              <button
                onClick={() => { setAuthMode('login'); setError(null); setMessage(null); }}
                className="font-semibold text-lime-400 hover:text-lime-300 transition-colors duration-200 disabled:opacity-50 ml-1 uppercase tracking-wider"
                disabled={isLoading}
              >
                Access Existing Node
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;