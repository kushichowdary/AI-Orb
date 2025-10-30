import React, { useEffect, useRef } from 'react';
import type { TranscriptEntry } from '../types';

interface ConversationProps {
  transcript: TranscriptEntry[];
}

export const Conversation: React.FC<ConversationProps> = ({ transcript }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  if (transcript.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-cyan-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 animate-pulse text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        <h2 className="text-2xl font-bold">Welcome to Echo Lingua AI</h2>
        <p className="mt-2 text-cyan-500">Press the microphone button below to begin your session.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transcript.map((entry, index) => (
        <div key={index} className={`flex items-end gap-2 ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
           {entry.speaker === 'ai' && <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex-shrink-0 flex items-center justify-center font-bold text-cyan-400 text-xs">AI</div>}
          <div className={`p-3 rounded-lg max-w-lg text-white ${
            entry.speaker === 'user' 
              ? 'bg-cyan-500/30' 
              : 'bg-white/10'
          }`}>
            <p>{entry.text}</p>
          </div>
        </div>
      ))}
      <div ref={endOfMessagesRef} />
    </div>
  );
};