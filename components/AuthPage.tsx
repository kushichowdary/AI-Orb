

import React, { useState, FormEvent } from 'react';
// FIX: Use v8 namespaced API instead of v9 modular imports.
/*
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail,
    updateProfile,
    AuthError
} from 'firebase/auth';
*/
import { auth } from '../utils/firebase';
import { playLoginSound } from '../utils/audioCues';

type AuthMode = 'login' | 'signup' | 'forgotPassword';

const getFirebaseErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
            return 'Invalid email or password.';
        case 'auth/email-already-in-use':
            return 'An account with this email already exists.';
        case 'auth/weak-password':
            return 'Password is too weak. It should be at least 6 characters.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection.';
        default:
            return 'An unexpected error occurred. Please try again.';
    }
}

/**
 * A full-featured, animated authentication page using Firebase.
 * Handles user login, registration, and password recovery.
 */
export const AuthPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
        if (authMode === 'login') {
            // FIX: Use v8 namespaced auth.signInWithEmailAndPassword
            await auth.signInWithEmailAndPassword(email, password);
            playLoginSound();
            // After successful login, onAuthStateChanged in App.tsx will handle the navigation.
        } else if (authMode === 'signup') {
            if (!name) {
                setError('Please enter your full name.');
                setIsLoading(false);
                return;
            }
            // FIX: Use v8 namespaced auth.createUserWithEmailAndPassword
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            // FIX: Use v8 user.updateProfile method
            if (userCredential.user) {
              await userCredential.user.updateProfile({ displayName: name });
            }
            playLoginSound();
            // After signup, user is automatically logged in.
            // onAuthStateChanged in App.tsx will detect this as a new user and handle navigation.

        } else if (authMode === 'forgotPassword') {
            // FIX: Use v8 namespaced auth.sendPasswordResetEmail
            await auth.sendPasswordResetEmail(email);
            setMessage('If an account with this email exists, a password reset link has been sent.');
            setResetEmailSent(true);
        }
    } catch (e) {
        // FIX: The imported `AuthError` type appears to lack the `code` property in this environment.
        // Casting to a structural type with a `code` property to resolve the type error.
        const authError = e as { code: string };
        setError(getFirebaseErrorMessage(authError.code));
    } finally {
        setIsLoading(false);
    }
  };

  const handleModeChange = (newMode: AuthMode) => {
    setAuthMode(newMode);
    setError(null);
    setMessage(null);
    setResetEmailSent(false);
    // Clear form fields for a clean state
    setName('');
    setEmail('');
    setPassword('');
  };

  const getTitle = () => {
    switch (authMode) {
      case 'login': return 'Welcome Back';
      case 'signup': return 'Create Account';
      case 'forgotPassword': return 'Reset Password';
    }
  };

  const getButtonText = () => {
    if (isLoading) return 'Processing...';
    switch (authMode) {
        case 'signup': return 'Sign Up';
        case 'login': return 'Log In';
        case 'forgotPassword': return 'Send Reset Link';
    }
  };

  const renderFormFields = () => (
    <>
      {authMode === 'signup' && (
         <div className="relative mb-4">
            <label htmlFor="name" className="sr-only">Full Name</label>
            <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            required
            disabled={isLoading}
            className="w-full bg-gray-900/50 text-white placeholder-gray-500 border border-gray-700 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
        </div>
      )}
      <div className="relative mb-4">
        <label htmlFor="email" className="sr-only">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address"
          required
          disabled={isLoading}
          className="w-full bg-gray-900/50 text-white placeholder-gray-500 border border-gray-700 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
      {authMode !== 'forgotPassword' && (
        <div className="relative mb-6">
          <label htmlFor="password" className="sr-only">Password</label>
          <input
            id="password"
            type={isPasswordVisible ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            disabled={isLoading}
            className="w-full bg-gray-900/50 text-white placeholder-gray-500 border border-gray-700 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed pr-10"
          />
           <button
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            disabled={isLoading}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-lime-400 focus:outline-none focus:text-lime-400 transition-colors disabled:opacity-50"
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
          >
            {isPasswordVisible ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074L3.707 2.293zM10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                <path d="M2 10s3.939 4 8 4 8-4 8-4-3.939-4-8-4-8 4-8 4zm10 0a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="w-full max-w-sm animate-fadeIn animate-float">
      <div className="auth-card-background bg-black/20 backdrop-blur-md border border-gray-800 rounded-lg shadow-2xl shadow-lime-500/5 p-6 sm:p-8 transition-all duration-500 animate-auth-glow">
        <h2 className="text-2xl font-bold text-center text-white mb-6">{getTitle()}</h2>
        
        {error && <p className="text-red-400 text-center text-sm mb-4">{error}</p>}
        {message && <p className="text-lime-400 text-center text-sm mb-4">{message}</p>}

        {authMode === 'forgotPassword' && resetEmailSent ? (
            <div>
                 <p className="text-center text-gray-300 mb-6">Please check your inbox and follow the instructions to reset your password.</p>
                 <button
                    onClick={() => handleModeChange('login')}
                    className="w-full bg-gray-700 text-white font-bold py-3 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-lime-400 transition-all duration-300 transform hover:scale-105 active:scale-100"
                >
                    Back to Login
                </button>
            </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {renderFormFields()}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-lime-400 text-black font-bold py-3 px-4 rounded-md hover:bg-lime-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-lime-400 transition-all duration-300 animate-subtle-glow disabled:bg-lime-400/50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-100"
            >
              {getButtonText()}
            </button>
          </form>
        )}

        {!(authMode === 'forgotPassword' && resetEmailSent) && (
            <div className="text-center mt-6">
            {authMode === 'login' ? (
                <>
                    <button onClick={() => handleModeChange('forgotPassword')} className="text-sm text-gray-400 hover:text-lime-400 transition-all duration-200 transform hover:-translate-y-px disabled:opacity-50" disabled={isLoading}>
                        Forgot Password?
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                        Don't have an account?{' '}
                        <button onClick={() => handleModeChange('signup')} className="font-semibold text-lime-400 hover:text-lime-300 transition-all duration-200 transform hover:-translate-y-px disabled:opacity-50" disabled={isLoading}>
                            Sign up
                        </button>
                    </p>
                </>
            ) : (
                <p className="text-sm text-gray-500">
                {authMode === 'signup' ? 'Already have an account?' : 'Remember your password?'}{' '}
                <button onClick={() => handleModeChange('login')} className="font-semibold text-lime-400 hover:text-lime-300 transition-all duration-200 transform hover:-translate-y-px disabled:opacity-50" disabled={isLoading}>
                    Log In
                </button>
                </p>
            )}
            </div>
        )}
      </div>
    </div>
  );
};