
import React, { useState } from 'react';

interface ApiKeyDialogProps {
  onApiKeySubmit: (apiKey: string) => void;
  error?: string | null;
}

export const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ onApiKeySubmit, error }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySubmit(apiKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#101018]/80 border border-gray-700 rounded-2xl shadow-xl p-8 max-w-md w-full text-white">
        <h2 className="text-2xl font-bold mb-4 text-center text-purple-300">Enter Gemini API Key</h2>
        <p className="text-gray-400 mb-6 text-center text-sm">
          To use this application, you need a Gemini API key from{' '}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:underline"
          >
            Google AI Studio
          </a>
          .
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-2">
              API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              placeholder="Enter your API key here"
              aria-describedby="error-message"
              required
            />
          </div>
          {error && (
             <p id="error-message" className="text-red-400 text-sm mb-4 text-center">{error}</p>
          )}
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};
