
export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}

// FIX: Added missing TranscriptEntry type used in Conversation.tsx.
export interface TranscriptEntry {
  speaker: 'user' | 'ai';
  text: string;
}
