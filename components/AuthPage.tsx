import React, { useState, FormEvent } from 'react';

type AuthMode = 'login' | 'signup' | 'forgotPassword';

interface AuthPageProps {
  onLoginSuccess: () => void;
}

/**
 * A full-featured, animated authentication page.
 * Handles user login, registration, and password recovery simulation.
 * All styling is designed to match the futuristic "JARVIS" theme.
 */
export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Simple Base64 "hashing" for simulation purposes.
  // In a real application, NEVER do this. Use a secure, salted hashing algorithm like bcrypt.
  const hashPassword = (pass: string) => btoa(pass);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    // Retrieve users from localStorage, or initialize if none exist.
    const users = JSON.parse(localStorage.getItem('jarvis-users') || '[]');

    if (authMode === 'login') {
      const user = users.find((u: any) => u.email === email);
      if (user && user.passwordHash === hashPassword(password)) {
        onLoginSuccess();
      } else {
        setError('Invalid email or password.');
      }
    } else if (authMode === 'signup') {
      if (users.some((u: any) => u.email === email)) {
        setError('An account with this email already exists.');
        return;
      }
      const newUser = { email, passwordHash: hashPassword(password) };
      localStorage.setItem('jarvis-users', JSON.stringify([...users, newUser]));
      setMessage('Account created successfully! Please log in.');
      setAuthMode('login');
      setPassword('');
    } else if (authMode === 'forgotPassword') {
        const userExists = users.some((u: any) => u.email === email);
        if (userExists) {
            setMessage('If an account with this email exists, a password reset link has been sent.');
        } else {
            // Show the same message for security reasons (to not reveal existing emails)
            setMessage('If an account with this email exists, a password reset link has been sent.');
        }
        setAuthMode('login');
    }
  };

  const getTitle = () => {
    switch (authMode) {
      case 'login': return 'Welcome Back';
      case 'signup': return 'Create Account';
      case 'forgotPassword': return 'Reset Password';
    }
  };

  const renderFormFields = () => (
    <>
      <div className="relative mb-4">
        <label htmlFor="email" className="sr-only">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address"
          required
          className="w-full bg-gray-900/50 text-white placeholder-gray-500 border border-gray-700 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all"
        />
      </div>
      {authMode !== 'forgotPassword' && (
        <div className="relative mb-6">
          <label htmlFor="password" className="sr-only">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required={authMode !== 'forgotPassword'}
            className="w-full bg-gray-900/50 text-white placeholder-gray-500 border border-gray-700 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all"
          />
        </div>
      )}
    </>
  );

  return (
    <div className="w-full max-w-sm mx-auto animate-fadeIn">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-white tracking-wider">
          J<span className="text-lime-400">A</span>RV<span className="text-lime-400">I</span>S
        </h1>
        <p className="text-gray-400 mt-2">Your Personal AI Assistant</p>
      </div>

      <div className="bg-black/30 backdrop-blur-sm border border-gray-800 rounded-lg shadow-2xl shadow-lime-500/5 p-8">
        <h2 className="text-2xl font-bold text-center text-white mb-6">{getTitle()}</h2>
        
        {error && <p className="text-red-400 text-center text-sm mb-4">{error}</p>}
        {message && <p className="text-lime-400 text-center text-sm mb-4">{message}</p>}

        <form onSubmit={handleSubmit}>
          {renderFormFields()}

          <button
            type="submit"
            className="w-full bg-lime-400 text-black font-bold py-3 px-4 rounded-md hover:bg-lime-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-lime-400 transition-all duration-300 animate-subtle-glow"
          >
            {authMode === 'signup' ? 'Sign Up' : authMode === 'login' ? 'Log In' : 'Send Reset Link'}
          </button>
        </form>

        <div className="text-center mt-6">
          {authMode === 'login' && (
             <>
                <button onClick={() => { setAuthMode('forgotPassword'); setError(null); }} className="text-sm text-gray-400 hover:text-lime-400 transition-colors">
                    Forgot Password?
                </button>
                <p className="text-sm text-gray-500 mt-2">
                    Don't have an account?{' '}
                    <button onClick={() => { setAuthMode('signup'); setError(null); }} className="font-semibold text-lime-400 hover:text-lime-300 transition-colors">
                        Sign up
                    </button>
                </p>
             </>
          )}
          {(authMode === 'signup' || authMode === 'forgotPassword') && (
            <p className="text-sm text-gray-500">
              Remember your password?{' '}
              <button onClick={() => { setAuthMode('login'); setError(null); }} className="font-semibold text-lime-400 hover:text-lime-300 transition-colors">
                Log In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};