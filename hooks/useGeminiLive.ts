import { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";
import { ConnectionState } from '../types';
import { encode, decode, decodeAudioData } from '../utils/audioUtils';
import { playConnectingSound, playConnectedSound, playErrorSound } from '../utils/audioCues';

// The Gemini Live API expects audio input at a 16kHz sample rate.
const INPUT_SAMPLE_RATE = 16000;
// The API provides audio output at a 24kHz sample rate.
const OUTPUT_SAMPLE_RATE = 24000;

/**
 * Creates a dynamic system instruction for the AI based on the selected language.
 * This primes the AI with its persona (JARVIS, a versatile AI assistant) and its goal.
 */
const createSystemInstruction = (language: string): string => {
    // The base persona for JARVIS.
    const baseInstruction = 'You are JARVIS, a helpful and versatile AI assistant with a female voice. Your voice should be exceptionally clear, calm, and professional. Enunciate your words precisely. Keep your responses concise, natural, and easy to understand. Maintain a positive and encouraging tone. Do not use any foul, profane, or adult language. If I use inappropriate language, politely steer the conversation back to a productive and respectful topic without engaging with or repeating the inappropriate words.';

    // Defines the broad capabilities of the assistant.
    const capabilities = 'You are capable of a wide range of tasks. You can explain complex topics simply for educational purposes, provide detailed step-by-step food recipes, and help with coding problems by explaining concepts and providing code examples. You can also engage in general conversation on any topic.';

    // Add language-specific instructions.
    if (language.toLowerCase() === 'english') {
        return `${baseInstruction} ${capabilities} The user wants to converse in English. Be a helpful and engaging conversation partner.`;
    } else {
        return `${baseInstruction} ${capabilities} The user has chosen to converse in ${language}. Please conduct the conversation primarily in ${language}. Your goal is to be a helpful and patient conversation partner in their chosen language.`;
    }
};

/**
 * A simple utility to detect if the user is speaking based on microphone input volume.
 * @param data The raw audio data from the microphone.
 * @returns true if speech is detected, false otherwise.
 */
const isSilent = (data: Float32Array): boolean => {
    const rms = Math.sqrt(data.reduce((sum, val) => sum + val * val, 0) / data.length);
    // This threshold is empirical and may need tuning for different microphones.
    return rms < 0.02; 
};

/**
 * A comprehensive hook to manage the entire lifecycle of a Gemini Live API session.
 * It handles connection, microphone input, audio output, state management, and cleanup.
 */
export const useGeminiLive = (apiKey: string | null, language: string) => {
  // State for the UI to react to connection status.
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [error, setError] = useState<string | null>(null);
  
  // State to drive the visualizer animations.
  const [isSpeaking, setIsSpeaking] = useState(false); // AI is speaking
  const [isUserSpeaking, setIsUserSpeaking] = useState(false); // User is speaking

  // Refs to hold onto session objects and browser APIs that don't need to trigger re-renders.
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const userSpeakingTimeoutRef = useRef<number | null>(null);

  // Manages the queue of audio chunks coming from the API to ensure gapless playback.
  const audioPlaybackStateRef = useRef({
    nextStartTime: 0,
    sources: new Set<AudioBufferSourceNode>(),
  });

  /**
   * Gracefully tears down the entire session, closing connections and releasing all resources.
   * This is crucial for preventing memory leaks and unnecessary background processing.
   */
  const stopSession = useCallback(() => {
    // 1. Close the Gemini Live session.
    if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => session.close()).catch(console.error);
        sessionPromiseRef.current = null;
    }

    // 2. Disconnect the audio processing pipeline.
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
    }

    // 3. Stop the microphone tracks.
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // 4. Close the Web Audio API contexts.
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      inputAudioContextRef.current.close().catch(console.error);
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      outputAudioContextRef.current.close().catch(console.error);
    }
    
    // 5. Stop any queued audio playback.
    audioPlaybackStateRef.current.sources.forEach(source => source.stop());
    audioPlaybackStateRef.current.sources.clear();
    audioPlaybackStateRef.current.nextStartTime = 0;

    // 6. Clear any pending timers and reset UI state.
     if (userSpeakingTimeoutRef.current) {
      clearTimeout(userSpeakingTimeoutRef.current);
    }
    setIsSpeaking(false);
    setIsUserSpeaking(false);
    setConnectionState(ConnectionState.DISCONNECTED);
  }, []);

  /**
   * Initiates a new Gemini Live session.
   * This involves getting microphone permissions, setting up audio contexts,
   * and establishing the connection to the API.
   */
  const startSession = useCallback(async () => {
    if (connectionState !== ConnectionState.DISCONNECTED && connectionState !== ConnectionState.ERROR) return;

    if (!apiKey) {
      setError("API Key is not set.");
      setConnectionState(ConnectionState.ERROR);
      return;
    }

    playConnectingSound();
    setConnectionState(ConnectionState.CONNECTING);
    setError(null);

    try {
      // Step 1: Get microphone access with enhanced audio processing enabled.
      // This helps filter out background noise and echo for clearer input.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // Step 2: Create separate AudioContexts for input and output.
      // This is necessary because they use different sample rates.
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: INPUT_SAMPLE_RATE });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: OUTPUT_SAMPLE_RATE });
      
      const ai = new GoogleGenAI({ apiKey });

      // Step 3: Initiate the connection. The `connect` method returns a promise
      // that resolves with the session object. We store the promise itself in a ref.
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: createSystemInstruction(language),
        },
        callbacks: {
          onopen: () => {
            // Connection successful!
            playConnectedSound();
            setConnectionState(ConnectionState.CONNECTED);
            
            // Step 4: Set up the audio processing pipeline.
            // MediaStreamSource -> ScriptProcessor -> Destination (optional, for monitoring)
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            mediaStreamSourceRef.current = source;

            // The ScriptProcessorNode is a bit old, but it's the most compatible way
            // to get raw audio data from the microphone.
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);

              // User speaking detection for UI feedback.
              if (!isSilent(inputData)) {
                setIsUserSpeaking(true);
                if (userSpeakingTimeoutRef.current) {
                  clearTimeout(userSpeakingTimeoutRef.current);
                }
                userSpeakingTimeoutRef.current = window.setTimeout(() => {
                  setIsUserSpeaking(false);
                }, 500); // Reset after 500ms of silence
              }
              
              // Convert the Float32Array to 16-bit PCM, then to a Base64 string.
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
              }
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };

              // Send the audio data to Gemini. We use the promise ref to ensure
              // we don't send data before the session is established.
              sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            // We connect to the destination to avoid a bug in some browsers where
            // the onaudioprocess event stops firing if the node isn't connected to an output.
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // The model can interrupt its own speech. If so, clear the audio queue.
            if (message.serverContent?.interrupted) {
              audioPlaybackStateRef.current.sources.forEach(source => source.stop());
              audioPlaybackStateRef.current.sources.clear();
              audioPlaybackStateRef.current.nextStartTime = 0;
              setIsSpeaking(false);
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              if (!isSpeaking) setIsSpeaking(true);

              const audioCtx = outputAudioContextRef.current!;
              const { sources } = audioPlaybackStateRef.current;
              
              // This is the core of gapless playback: schedule the next chunk to play
              // exactly when the previous one finishes.
              let nextStartTime = Math.max(audioPlaybackStateRef.current.nextStartTime, audioCtx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(audioData), audioCtx, OUTPUT_SAMPLE_RATE, 1);
              const source = audioCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioCtx.destination);
              
              source.onended = () => {
                sources.delete(source);
                // Only set isSpeaking to false when the *last* chunk has finished playing.
                if (sources.size === 0) {
                    setIsSpeaking(false);
                }
              };

              source.start(nextStartTime);
              // Update the start time for the *next* chunk.
              audioPlaybackStateRef.current.nextStartTime = nextStartTime + audioBuffer.duration;
              sources.add(source);
            }
          },
          onerror: (e: ErrorEvent) => {
            playErrorSound();
            console.error('Gemini Live API Error:', e);
            setError('A network error occurred. Please check your connection and try again.');
            setConnectionState(ConnectionState.ERROR);
            stopSession();
          },
          onclose: () => {
            // The session was closed, likely by the server or network issues.
            stopSession();
          },
        },
      });
    } catch (err) {
      playErrorSound();
      console.error('Failed to start session:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';

      if (errorMessage.includes('API key not valid') || errorMessage.includes('invalid API key')) {
        setError('Invalid API key. Please ensure it is correct and has permissions.');
      } else if (errorMessage.includes('Permission denied') || errorMessage.includes('not-allowed')) {
        setError('Microphone permission denied. Please enable it in your browser settings.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setConnectionState(ConnectionState.ERROR);
      stopSession();
    }
  }, [apiKey, connectionState, language, stopSession]);
  
  return { connectionState, startSession, stopSession, error, isSpeaking, isUserSpeaking };
};
