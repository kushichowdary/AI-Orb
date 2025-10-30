import React from 'react';
import { ConnectionState } from '../types';

interface ControlsProps {
  connectionState: ConnectionState;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}

const IconButton: React.FC<{ onClick: () => void; disabled: boolean; children: React.ReactNode; className?: string, 'aria-label': string }> = ({ onClick, disabled, children, className = '', ...props }) => {
  const baseClasses = "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed";
  const finalClassName = `${baseClasses} ${className}`;
  return (
    <button onClick={onClick} disabled={disabled} className={finalClassName} {...props}>
      {children}
    </button>
  );
};

export const Controls: React.FC<ControlsProps> = ({ connectionState, onStart, onStop, onReset }) => {
  const isIdle = connectionState === ConnectionState.DISCONNECTED || connectionState === ConnectionState.ERROR;
  const isConnecting = connectionState === ConnectionState.CONNECTING;
  const isConnected = connectionState === ConnectionState.CONNECTED;

  return (
    <div className="flex items-center justify-center p-4 space-x-4">
      <IconButton 
        onClick={onStart}
        disabled={!isIdle}
        className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/40 focus:ring-cyan-500/50 disabled:hover:bg-cyan-500/20"
        aria-label="Start Session"
      >
        {isConnecting ? (
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
        )}
      </IconButton>
      
      <IconButton 
        onClick={onStop}
        disabled={!isConnected}
        className="bg-red-500/20 text-red-300 hover:bg-red-500/40 focus:ring-red-500/50 disabled:hover:bg-red-500/20"
        aria-label="Stop Session"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 16 16">
          <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/>
        </svg>
      </IconButton>
      
      <IconButton 
        onClick={onReset}
        disabled={!isConnected}
        className="bg-gray-500/20 text-gray-300 hover:bg-gray-500/40 focus:ring-gray-500/50 disabled:hover:bg-gray-500/20"
        aria-label="Reset Conversation"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 15M20 20l-1.5-1.5A9 9 0 003.5 9" />
        </svg>
      </IconButton>
    </div>
  );
};