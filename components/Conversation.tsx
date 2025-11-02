import React, { useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ConversationProps {
  history: Message[];
  currentUserLine: string;
  currentModelLine: string;
  isSessionActive: boolean;
}

export const Conversation: React.FC<ConversationProps> = ({ history, currentUserLine, currentModelLine, isSessionActive }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, currentUserLine, currentModelLine]);

  return (
    <div ref={scrollRef} className="conversation-container">
      <div className="conversation-content">
        {history.map((msg, index) => (
          <div key={index} className={`message-bubble ${msg.role === 'user' ? 'user-message' : 'jarvis-message'}`}>
            <span className="message-role">{msg.role === 'user' ? 'You' : 'JARVIS'}</span>
            <p>{msg.text}</p>
          </div>
        ))}
        {isSessionActive && currentUserLine && (
          <div className="message-bubble user-message interim">
            <span className="message-role">You</span>
            <p>{currentUserLine}<span className="typing-indicator">...</span></p>
          </div>
        )}
        {isSessionActive && currentModelLine && (
           <div className="message-bubble jarvis-message interim">
            <span className="message-role">JARVIS</span>
            <p>{currentModelLine}<span className="typing-indicator">...</span></p>
          </div>
        )}
      </div>
    </div>
  );
};
