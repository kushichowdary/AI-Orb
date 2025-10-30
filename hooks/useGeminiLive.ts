import { useState, useRef, useCallback } from 'react';
// FIX: Removed non-exported type `LiveSession`.
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";
import { ConnectionState, TranscriptEntry } from '../types';
import { encode, decode, decodeAudioData } from '../utils/audioUtils';

const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

export const useGeminiLive = (onTranscriptUpdate?: (newEntries: TranscriptEntry[]) => void) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);

  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const speakingTimeoutRef = useRef<number | null>(null);
  const userSpeakingTimeoutRef = useRef<number | null>(null);

  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');
  
  const audioPlaybackStateRef = useRef({
    nextStartTime: 0,
    sources: new Set<AudioBufferSourceNode>(),
  });

  const stopSession = useCallback(() => {
    if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => session.close());
        sessionPromiseRef.current = null;
    }

    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }

    if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      inputAudioContextRef.current.close();
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      outputAudioContextRef.current.close();
    }
    
    audioPlaybackStateRef.current.sources.forEach(source => source.stop());
    audioPlaybackStateRef.current.sources.clear();
    audioPlaybackStateRef.current.nextStartTime = 0;

    if (speakingTimeoutRef.current) {
      clearTimeout(speakingTimeoutRef.current);
    }
     if (userSpeakingTimeoutRef.current) {
      clearTimeout(userSpeakingTimeoutRef.current);
    }
    setIsSpeaking(false);
    setIsUserSpeaking(false);
    
    setConnectionState(ConnectionState.DISCONNECTED);
  }, []);

  const startSession = useCallback(async () => {
    if (connectionState !== ConnectionState.DISCONNECTED) return;

    setConnectionState(ConnectionState.CONNECTING);
    setError(null);
    currentInputTranscriptionRef.current = '';
    currentOutputTranscriptionRef.current = '';

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: INPUT_SAMPLE_RATE });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: OUTPUT_SAMPLE_RATE });
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: 'You are a friendly and helpful language learning partner. Your goal is to help me practice my English speaking skills. Feel free to correct my mistakes gently and ask engaging questions. Keep your responses concise and natural.'
        },
        callbacks: {
          onopen: () => {
            setConnectionState(ConnectionState.CONNECTED);
            
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            mediaStreamSourceRef.current = source;

            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);

              // User speaking detection
              let sum = 0.0;
              for (let i = 0; i < inputData.length; ++i) {
                sum += inputData[i] * inputData[i];
              }
              const rms = Math.sqrt(sum / inputData.length);
              if (rms > 0.02) { // Threshold for speech detection
                setIsUserSpeaking(true);
                if (userSpeakingTimeoutRef.current) {
                  clearTimeout(userSpeakingTimeoutRef.current);
                }
                userSpeakingTimeoutRef.current = window.setTimeout(() => {
                  setIsUserSpeaking(false);
                }, 500); // Reset after 500ms of silence
              }
              
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
            }
            if (message.serverContent?.outputTranscription) {
              currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
                const newEntries: TranscriptEntry[] = [];
                if(currentInputTranscriptionRef.current.trim()){
                    newEntries.push({ speaker: 'user', text: currentInputTranscriptionRef.current.trim() });
                }
                if(currentOutputTranscriptionRef.current.trim()){
                    newEntries.push({ speaker: 'ai', text: currentOutputTranscriptionRef.current.trim() });
                }
                if(onTranscriptUpdate && newEntries.length > 0) {
                    onTranscriptUpdate(newEntries);
                }
                currentInputTranscriptionRef.current = '';
                currentOutputTranscriptionRef.current = '';
            }

            if (message.serverContent?.interrupted) {
              audioPlaybackStateRef.current.sources.forEach(source => source.stop());
              audioPlaybackStateRef.current.sources.clear();
              audioPlaybackStateRef.current.nextStartTime = 0;
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              setIsSpeaking(true);
              if (speakingTimeoutRef.current) {
                clearTimeout(speakingTimeoutRef.current);
              }
              speakingTimeoutRef.current = window.setTimeout(() => {
                setIsSpeaking(false);
              }, 2000);

              const audioCtx = outputAudioContextRef.current!;
              let { nextStartTime, sources } = audioPlaybackStateRef.current;
              
              nextStartTime = Math.max(nextStartTime, audioCtx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(audioData), audioCtx, OUTPUT_SAMPLE_RATE, 1);
              const source = audioCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioCtx.destination);
              
              source.onended = () => {
                sources.delete(source);
              };

              source.start(nextStartTime);
              audioPlaybackStateRef.current.nextStartTime = nextStartTime + audioBuffer.duration;
              sources.add(source);
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Gemini Live API Error:', e);
            setError(`Connection error. Please try again.`);
            setConnectionState(ConnectionState.ERROR);
            stopSession();
          },
          onclose: () => {
            stopSession();
          },
        },
      });
    } catch (err) {
      console.error('Failed to start session:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      if (errorMessage.includes('Permission denied')) {
        setError('Microphone permission denied. Please enable it in your browser settings.');
      } else {
        setError(errorMessage);
      }
      setConnectionState(ConnectionState.ERROR);
      stopSession();
    }
  }, [connectionState, stopSession, onTranscriptUpdate]);
  
  return { connectionState, startSession, stopSession, error, isSpeaking, isUserSpeaking };
};