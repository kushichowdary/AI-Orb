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
    const baseInstruction = 'You are JARVIS, a helpful and versatile AI assistant with a female voice. Your voice should be exceptionally clear, calm, and professional. Enunciate your words precisely. Keep your responses concise, natural, and easy to understand. Maintain a positive and encouraging tone. Do not use any foul, profane, or adult language. If I use inappropriate language, politely steer the conversation back to a productive and respectful topic without engaging with or repeating the inappropriate words. IMPORTANT: If asked about your identity, you must respond that you are JARVIS, an AI assistant. You must not mention that you are a language model, or a Google product. If asked who created you, you must say that you were created by Kushwanth.';

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
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: INPUT_SAMPLE_RATE });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: OUTPUT_SAMPLE_RATE });
      
      const ai = new GoogleGenAI({ apiKey });

      // Step 3: Initiate connection.
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
            playConnectedSound();
            setConnectionState(ConnectionState.CONNECTED);
            
            // Step 4: Set up audio processing pipeline.
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            mediaStreamSourceRef.current = source;
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              if (!isSilent(inputData)) {
                // User is speaking, so update state and reset the silence timer.
                setIsUserSpeaking(true);
                if (userSpeakingTimeoutRef.current) {
                  clearTimeout(userSpeakingTimeoutRef.current);
                }
                userSpeakingTimeoutRef.current = window.setTimeout(() => {
                  setIsUserSpeaking(false);
                }, 200); // User speaking detection timeout (decreased from 500ms)

                // Create a Blob-like object with the PCM data for the API.
                // The API expects a Base64 encoded string of the raw audio bytes.
                const pcmBlob: Blob = {
                  data: encode(new Uint8Array(new Int16Array(inputData.map(v => v * 32768)).buffer)),
                  mimeType: 'audio/pcm;rate=16000',
                };
                
                // IMPORTANT: Send data only after the session promise resolves to avoid race conditions.
                sessionPromiseRef.current?.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              }
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
            if (base64EncodedAudioString) {
              const audioCtx = outputAudioContextRef.current;
              if (audioCtx) {
                // When new audio arrives, we are "speaking".
                setIsSpeaking(true);

                // Schedule playback to start at the end of the last chunk to avoid overlaps.
                const playbackState = audioPlaybackStateRef.current;
                playbackState.nextStartTime = Math.max(
                  playbackState.nextStartTime,
                  audioCtx.currentTime,
                );
                
                const audioBuffer = await decodeAudioData(
                  decode(base64EncodedAudioString),
                  audioCtx,
                  OUTPUT_SAMPLE_RATE,
                  1, // Mono audio
                );

                const source = audioCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioCtx.destination);
                
                source.addEventListener('ended', () => {
                  playbackState.sources.delete(source);
                  // If there are no more sounds queued, we are no longer "speaking".
                  if (playbackState.sources.size === 0) {
                    setIsSpeaking(false);
                  }
                });

                source.start(playbackState.nextStartTime);
                playbackState.nextStartTime += audioBuffer.duration;
                playbackState.sources.add(source);
              }
            }
          },
          onerror: (e: any) => {
            console.error("Gemini Live session error:", e);
            playErrorSound();
            setError("A connection error occurred.");
            setConnectionState(ConnectionState.ERROR);
            stopSession();
          },
          onclose: () => {
            // The connection closed, so run the full cleanup.
            stopSession();
          },
        },
      });
    } catch (e: any) {
        console.error("Failed to start session:", e);
        if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
            setError("Microphone permission was denied.");
        } else if (e.message?.includes("Requested entity was not found")) {
            // This is a specific error indicating a potential API key issue.
            // Retry logic will handle this by re-initiating the process.
            if (retryCount > 0) {
                setTimeout(() => startSession(retryCount - 1, delay, true), delay);
                return;
            }
            setError("Failed to connect. The resource may not be available.");
        } else {
            setError("Failed to start session. Please check microphone permissions.");
        }
        playErrorSound();
        setConnectionState(ConnectionState.ERROR);
        stopSession();
    }
  }, [apiKey, language, connectionState, stopSession]);

  return { connectionState, startSession, stopSession, error, isSpeaking, isUserSpeaking };
};