import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useVoiceInput — wraps the Web Speech API (SpeechRecognition / webkitSpeechRecognition).
 *
 * Returns { supported, listening, transcript, error, start, stop }.
 * - SSR-safe: support is detected lazily inside the browser only.
 * - Graceful fallback: when the API is missing, `supported` is false and
 *   start() sets a human-readable error instead of throwing.
 * - Transcript accumulates final results across the session; interim results
 *   are ignored so consumers only see committed text.
 */

interface VoiceResultAlternative {
  transcript: string;
  confidence: number;
}

interface VoiceResult {
  isFinal: boolean;
  length: number;
  [index: number]: VoiceResultAlternative;
}

interface VoiceResultEvent extends Event {
  resultIndex: number;
  results: { length: number; [index: number]: VoiceResult };
}

interface VoiceRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: VoiceResultEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type RecognitionCtor = new () => VoiceRecognition;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface VoiceInput {
  supported: boolean;
  listening: boolean;
  transcript: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  clear: () => void;
}

export function useVoiceInput(lang = "en-IN"): VoiceInput {
  const [supported] = useState<boolean>(() => getRecognitionCtor() !== null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<VoiceRecognition | null>(null);

  const stop = useCallback(() => {
    recRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setError("Voice input is not supported in this browser. Try Chrome or Edge.");
      return;
    }
    // Tear down any previous session before starting a fresh one.
    recRef.current?.abort();
    setError(null);

    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = (event: VoiceResultEvent) => {
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result?.isFinal) {
          for (let j = 0; j < result.length; j++) {
            const alt = result[j];
            if (alt) finalText += alt.transcript;
          }
        }
      }
      if (finalText.trim()) {
        setTranscript((prev) => (prev ? `${prev} ${finalText.trim()}` : finalText.trim()));
      }
    };
    rec.onerror = () => {
      setError("Couldn't hear that — try again or type instead.");
      setListening(false);
    };
    rec.onend = () => {
      setListening(false);
      recRef.current = null;
    };

    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setError("Couldn't start the microphone. Check browser permissions.");
      setListening(false);
    }
  }, [lang]);

  const clear = useCallback(() => {
    setTranscript("");
    setError(null);
  }, []);

  // Never leave a dangling recognition session when the component unmounts.
  useEffect(() => {
    return () => {
      recRef.current?.abort();
      recRef.current = null;
    };
  }, []);

  return { supported, listening, transcript, error, start, stop, clear };
}
