
import React from 'react';
import { ConnectionState } from '../types';

interface StatusIndicatorProps {
  state: ConnectionState;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ state }) => {
  let color = 'bg-gray-500';
  let text = 'Inactive';
  let pulse = false;

  switch (state) {
    case ConnectionState.CONNECTED:
      color = 'bg-green-500';
      text = 'Connected & Listening';
      pulse = true;
      break;
    case ConnectionState.CONNECTING:
      color = 'bg-yellow-500';
      text = 'Connecting...';
      pulse = true;
      break;
    case ConnectionState.DISCONNECTED:
      color = 'bg-red-500';
      text = 'Disconnected';
      break;
    case ConnectionState.ERROR:
      color = 'bg-red-700';
      text = 'Error';
      break;
  }

  return (
    <div className="flex items-center mb-4 md:mb-0 md:mr-6">
      <div className={`w-4 h-4 rounded-full ${color} ${pulse ? 'animate-pulse' : ''} mr-3`}></div>
      <span className="text-cyan-400 font-medium">{text}</span>
    </div>
  );
};
