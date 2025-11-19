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
    const baseInstruction = 'You are JARVIS, a helpful and versatile AI assistant with a female voice. Your voice should be exceptionally clear, calm, and professional. Enunciate your words precisely. Keep your responses concise, natural, and easy to understand. Maintain a positive and encouraging tone. Do not use any foul, profane, or adult language. If I use inappropriate language, politely steer the conversation back to a productive and respectful topic without engaging with or repeating the inappropriate words. IMPORTANT: If asked about your identity, you must respond that you are JARVIS, an AI assistant created by Kushwanth. You must not mention that you are a language model, Gemini, or a Google product.';

    // Defines the broad capabilities of the assistant.
    const capabilities = 'Your primary function is to be an educational resource. You should be able to answer any educational-related questions, explaining complex topics simply and clearly. You can also assist with a wide range of other tasks, such as providing detailed step-by-step food recipes, helping with coding problems by explaining concepts and providing code examples, and engaging in general conversation on any topic.';

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
        sessionPromiseRef.current.then(session => {
             try { session.close(); } catch(e) { console.warn("Error closing session:", e); }
        }).catch(console.error);
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
   * and establishing the connection to the API. It includes retry logic for specific, recoverable errors.
   */
  const startSession = useCallback(async (retryCount = 3, delay = 1000, isRetry = false) => {
    // Prevent starting a new session if one is already active, unless it's an internal retry.
    if (!isRetry && connectionState !== ConnectionState.DISCONNECTED && connectionState !== ConnectionState.ERROR) {
      return;
    }

    if (!apiKey) {
      setError("API Key is not set.");
      setConnectionState(ConnectionState.ERROR);
      return;
    }
    
    // Only play sound and set initial state on the first attempt, not on retries.
    if (!isRetry) {
        playConnectingSound();
        setConnectionState(ConnectionState.CONNECTING);
        setError(null);
    }

    try {
      // Step 1: Get microphone access.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // Step 2: Create audio contexts.
      // Cleanup old contexts if they exist to prevent resource leaks.
      if (inputAudioContextRef.current?.state !== 'closed') await inputAudioContextRef.current?.close();
      if (outputAudioContextRef.current?.state !== 'closed') await outputAudioContextRef.current?.close();

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      inputAudioContextRef.current = new AudioContextClass({ sampleRate: INPUT_SAMPLE_RATE });
      outputAudioContextRef.current = new AudioContextClass({ sampleRate: OUTPUT_SAMPLE_RATE });
      
      // Ensure contexts are running (handling browser autoplay policies)
      if (inputAudioContextRef.current.state === 'suspended') await inputAudioContextRef.current.resume();
      if (outputAudioContextRef.current.state === 'suspended') await outputAudioContextRef.current.resume();

      const ai = new GoogleGenAI({ apiKey });

      // Step 3: Initiate connection.
      // We define the promise logic but also attach a catch handler immediately to handle initial handshake failures.
      const sessionPromise = ai.live.connect({
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
            playConnectedSound();
            setConnectionState(ConnectionState.CONNECTED);
            
            // Step 4: Set up audio processing pipeline.
            if (!inputAudioContextRef.current || !mediaStreamRef.current) return;

            const source = inputAudioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
            mediaStreamSourceRef.current = source;
            
            // Create script processor for recording
            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              if (!isSilent(inputData)) {
                setIsUserSpeaking(true);
                if (userSpeakingTimeoutRef.current) clearTimeout(userSpeakingTimeoutRef.current);
                userSpeakingTimeoutRef.current = window.setTimeout(() => setIsUserSpeaking(false), 500);
              }
              
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                // Clip and convert to 16-bit PCM
                int16[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
              }
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };

              // Send data only if the session is established
              sessionPromiseRef.current?.then((session) => {
                try {
                   session.sendRealtimeInput({ media: pcmBlob });
                } catch(e) {
                   console.error("Error sending input:", e);
                }
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.interrupted) {
              audioPlaybackStateRef.current.sources.forEach(source => source.stop());
              audioPlaybackStateRef.current.sources.clear();
              audioPlaybackStateRef.current.nextStartTime = 0;
              setIsSpeaking(false);
            }
            
            // Handle audio playback
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              if (!isSpeaking) setIsSpeaking(true);
              const audioCtx = outputAudioContextRef.current;
              if (!audioCtx) return;

              const { sources } = audioPlaybackStateRef.current;
              let nextStartTime = Math.max(audioPlaybackStateRef.current.nextStartTime, audioCtx.currentTime);
              
              try {
                const audioBuffer = await decodeAudioData(decode(audioData), audioCtx, OUTPUT_SAMPLE_RATE, 1);
                const source = audioCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioCtx.destination);
                source.onended = () => {
                    sources.delete(source);
                    if (sources.size === 0) setIsSpeaking(false);
                };
                source.start(nextStartTime);
                audioPlaybackStateRef.current.nextStartTime = nextStartTime + audioBuffer.duration;
                sources.add(source);
              } catch(e) {
                console.error("Audio decoding failed:", e);
              }
            }
          },
          onerror: (e: ErrorEvent) => {
            const error = e as any;
            const errorMessage = (error.message || '').toLowerCase();
            console.error('Gemini Live API Error:', error);
            
            const isRetryable503 = errorMessage.includes('503') || errorMessage.includes('service unavailable');
            if (isRetryable503) {
              console.warn('Live session error (503), attempting automatic reconnect...');
              stopSession();
              setTimeout(() => startSession(), 1000); 
              return;
            }

            const isConflict409 = errorMessage.includes('409') || errorMessage.includes('conflict');
            if (isConflict409) {
                playErrorSound();
                setError('A session conflict occurred. Please try starting a new session.');
                setConnectionState(ConnectionState.ERROR);
                stopSession();
                return;
            }

            playErrorSound();
            // Provide a more friendly message for generic network errors
            if (errorMessage.includes('network error') || errorMessage.includes('failed to fetch')) {
                setError('Network connection failed. Please check your internet or API key.');
            } else {
                setError('A connection error occurred. Please try again.');
            }
            setConnectionState(ConnectionState.ERROR);
            stopSession();
          },
          onclose: () => {
            // console.log('Session closed');
            stopSession();
          },
        },
      });

      // Assign the promise to the ref
      sessionPromiseRef.current = sessionPromise;

      // Catch initial handshake/connection failures that occur before callbacks
      sessionPromise.catch((err) => {
         console.error("Connection handshake failed:", err);
         playErrorSound();
         setConnectionState(ConnectionState.ERROR);
         setError("Failed to establish connection. Please check your API key and network.");
         stopSession();
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message.toLowerCase() : 'an unknown error occurred.';
      const isRetryable = errorMessage.includes('503') || errorMessage.includes('service unavailable') || errorMessage.includes('409') || errorMessage.includes('conflict');

      if (isRetryable && retryCount > 0) {
        console.warn(`Session start failed, retrying in ${delay}ms... (${retryCount} retries left). Error: ${errorMessage}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        await startSession(retryCount - 1, delay * 2, true); 
        return; 
      }
      
      playErrorSound();
      console.error('Failed to start session:', err);

      if (errorMessage.includes('api key not valid') || errorMessage.includes('invalid api key')) {
        setError('Invalid API key. Please ensure it is correct and has permissions.');
      } else if (errorMessage.includes('permission denied') || errorMessage.includes('not-allowed')) {
        setError('Microphone permission denied. Please enable it in your browser settings.');
      } else if (isRetryable) {
         setError('The service is temporarily unavailable. Please try again later.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setConnectionState(ConnectionState.ERROR);
      stopSession();
    }
  }, [apiKey, connectionState, language, stopSession]);
  
  return { 
    connectionState, 
    startSession, 
    stopSession, 
    error, 
    isSpeaking, 
    isUserSpeaking,
  };
};
