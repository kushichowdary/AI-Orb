
export interface TranscriptEntry {
  speaker: 'user' | 'ai';
  text: string;
}

export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}
