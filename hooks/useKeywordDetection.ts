import { useEffect, useRef, useCallback, useState } from 'react';

interface KeywordDetectionOptions {
  keywords: string[];
  onKeywordDetected: () => void;
  enabled?: boolean;
}

// The Web Speech API is still experimental and not fully standardized.
// We define the necessary interfaces here to ensure TypeScript compatibility
// across browsers that might have different vendor prefixes (e.g., webkitSpeechRecognition).
interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  readonly [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

// Attach the types to the window object for global access.
interface CustomWindow extends Window {
  SpeechRecognition: SpeechRecognitionStatic;
  webkitSpeechRecognition: SpeechRecognitionStatic;
}
declare var window: CustomWindow;

// Get the browser's implementation of SpeechRecognition, if it exists.
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognition;

/**
 * A hook for detecting specific keywords using the browser's Web Speech API.
 * It handles the setup, teardown, and common quirks of the API.
 */
export const useKeywordDetection = ({
  keywords,
  onKeywordDetected,
  enabled = true,
}: KeywordDetectionOptions) => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  // A ref to track permission state internally to avoid race conditions in the `onend` handler.
  const isDeniedRef = useRef(false);

  // Use a ref for the callback to prevent the main useEffect from re-running every time the callback changes.
  const onKeywordDetectedRef = useRef(onKeywordDetected);
  onKeywordDetectedRef.current = onKeywordDetected;

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        // This might throw an error if it's already started, which we can safely ignore.
        recognitionRef.current.start();
      } catch (e) {
        // console.warn("SpeechRecognition.start() failed:", e);
      }
    }
  }, []);
  
  const stopListening = useCallback(() => {
     if (recognitionRef.current) {
      try {
        // This might throw if not running, which is also fine.
        recognitionRef.current.stop();
      } catch (e) {
        // console.warn("SpeechRecognition.stop() failed:", e);
      }
    }
  }, []);

  useEffect(() => {
    // If the feature is disabled, not supported, or permission has been denied, stop and do nothing.
    if (!enabled || !isSpeechRecognitionSupported || permissionDenied) {
      if (recognitionRef.current) {
        stopListening();
      }
      return;
    }

    isDeniedRef.current = false;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    // `continuous` means it will keep listening, not stop after the first utterance.
    recognition.continuous = true;
    recognition.lang = 'en-US';
    // Enable interim results to get faster feedback, making wake-word detection more responsive.
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript.trim().toLowerCase();
      
      // For a wake-word, we check if the utterance *starts* with one of our keywords.
      // This is a stricter, more accurate check than simply including the keyword,
      // which significantly reduces false positives from hearing the keyword mid-sentence.
      if (keywords.some(keyword => transcript.startsWith(keyword))) {
        onKeywordDetectedRef.current();
        // The parent component (App.tsx) will set `enabled` to false upon successful detection,
        // which will trigger the cleanup for this effect and stop the current recognition instance.
        // This prevents multiple triggers from a single utterance.
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // 'aborted' is expected when we call stop(), so we can ignore it.
      if (event.error === 'aborted') {
        return;
      }
      
      // 'not-allowed' is a permanent error. We set state to disable the hook and prevent restarts.
      if (event.error === 'not-allowed') {
        console.error('SpeechRecognition permission denied. Keyword detection is disabled.');
        isDeniedRef.current = true;
        setPermissionDenied(true);
        return;
      }

      // For other transient errors (like 'network', 'service-not-allowed'), we log a warning.
      // The `onend` event will fire subsequently and handle the restart logic.
      console.warn(`SpeechRecognition error: "${event.error}". An automatic restart will be attempted.`);
    };
    
    // The SpeechRecognition service can stop for various reasons (e.g., network error, long silence).
    // This handler ensures that we restart it automatically to maintain a persistent listening state.
    recognition.onend = () => {
      // Only restart if the hook is still enabled and we haven't hit a permanent permission error.
      if (enabled && !isDeniedRef.current) {
        // A short delay is crucial to prevent the browser from rate-limiting the service
        // in cases of rapid, repeated errors (like a flaky network connection).
        setTimeout(() => startListening(), 500);
      }
    };

    startListening();

    // Cleanup function: stop listening when the component unmounts or `enabled` becomes false.
    return () => {
      if (recognitionRef.current) {
        // Nullify all handlers to prevent any lingering async events from firing after cleanup.
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        stopListening();
        recognitionRef.current = null;
      }
    };
  }, [enabled, keywords, startListening, stopListening, permissionDenied]);

  return { permissionDenied };
};
