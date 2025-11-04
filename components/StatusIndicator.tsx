import React from 'react';
import { ConnectionState } from '../types';

interface StatusIndicatorProps {
  connectionState: ConnectionState;
  isSpeaking: boolean;
  isUserSpeaking: boolean;
  error: string | null;
  keywordPermissionDenied: boolean;
}

/**
 * Generates a user-friendly status message based on the application's current state.
 * This helps the user understand what's happening at any given moment.
 */
const getStatusText = (
  state: ConnectionState, 
  isSpeaking: boolean, 
  isUserSpeaking: boolean, 
  error: string | null,
  keywordPermissionDenied: boolean
): string => {
  if (error) return error;
  switch (state) {
    case ConnectionState.DISCONNECTED:
      if (keywordPermissionDenied) {
        return "Mic permission denied for \"Hey JARVIS\". Tap orb to start.";
      }
      return "Select your language, then say \"Hey JARVIS\" or tap orb to begin.";
    case ConnectionState.CONNECTING:
      return "Connecting...";
    case ConnectionState.ERROR:
       return "An error occurred. Please use the retry button.";
    case ConnectionState.CONNECTED:
      if (isSpeaking) return "Listening to JARVIS...";
      if (isUserSpeaking) return "I hear you...";
      return "I'm listening.";
    default:
      return "";
  }
};

/**
 * Displays the current status of the application, such as "Connecting...", "I'm listening.", or error messages.
 * The text and color change dynamically based on the application's state.
 */
export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  connectionState,
  isSpeaking,
  isUserSpeaking,
  error,
  keywordPermissionDenied,
}) => {
  const isIdle = connectionState === ConnectionState.DISCONNECTED || connectionState === ConnectionState.ERROR;
  const statusText = getStatusText(connectionState, isSpeaking, isUserSpeaking, error, keywordPermissionDenied);
  const textColor = error || (isIdle && keywordPermissionDenied) ? 'text-red-400 font-medium' : 'text-gray-400';

  return (
    <div className="h-16 md:h-20 flex items-center justify-center z-10 text-center px-2">
      <p className={`transition-opacity duration-300 text-sm sm:text-base ${textColor}`}>
        {statusText}
      </p>
    </div>
  );
};