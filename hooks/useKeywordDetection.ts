
import { useEffect, useRef, useCallback, useState } from 'react';

interface KeywordDetectionOptions {
  keywords: string[];
  onKeywordDetected: () => void;
  enabled?: boolean;
}

// Fix for SpeechRecognition types not being available in all environments by defining them manually.
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

// Check for browser support and type definitions
interface CustomWindow extends Window {
  SpeechRecognition: SpeechRecognitionStatic;
  webkitSpeechRecognition: SpeechRecognitionStatic;
}
declare var window: CustomWindow;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognition;

export const useKeywordDetection = ({
  keywords,
  onKeywordDetected,
  enabled = true,
}: KeywordDetectionOptions) => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const isDeniedRef = useRef(false);

  // Use a ref for the callback to avoid re-running the effect when it changes
  const onKeywordDetectedRef = useRef(onKeywordDetected);
  onKeywordDetectedRef.current = onKeywordDetected;

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // May throw if already started, which is fine.
      }
    }
  }, []);
  
  const stopListening = useCallback(() => {
     if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // May throw if not running, which is fine.
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled || !isSpeechRecognitionSupported || permissionDenied) {
      if (recognitionRef.current) stopListening();
      return;
    }

    isDeniedRef.current = false;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript.trim().toLowerCase();
      
      if (keywords.some(keyword => transcript.includes(keyword))) {
        onKeywordDetectedRef.current();
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'not-allowed') {
        console.error('SpeechRecognition permission denied. Keyword detection is disabled.');
        isDeniedRef.current = true;
        setPermissionDenied(true);
      } else if (event.error !== 'aborted') {
          console.error('SpeechRecognition error:', event.error);
      }
    };
    
    recognition.onend = () => {
      // The service may stop due to silence or other reasons.
      // We restart it as long as the component intends for it to be enabled.
      if (enabled && !isDeniedRef.current) {
        startListening();
      }
    };

    startListening();

    return () => {
      recognition.onend = null;
      stopListening();
      recognitionRef.current = null;
    };
  }, [enabled, keywords, startListening, stopListening, permissionDenied]);

  return { permissionDenied };
};
