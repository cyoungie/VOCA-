import { useCallback, useEffect, useRef, useState } from 'react';

const SpeechRecognitionAPI =
  typeof window !== 'undefined' &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

const DEFAULT_LANG = 'en-US';

/**
 * Custom hook for Web Speech API (speech recognition).
 * Continuous listening, interim results, auto-restart on end when listening.
 * Chrome/Edge recommended.
 */
export function useSpeechRecognition(options = {}) {
  const { language = DEFAULT_LANG, onInterim, onFinal, onError } = options;

  const [isSupported] = useState(!!SpeechRecognitionAPI);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');

  const recognitionRef = useRef(null);
  const shouldRestartRef = useRef(false);
  const accumulatedFinalRef = useRef('');

  const start = useCallback(() => {
    if (!SpeechRecognitionAPI) {
      setError('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    setError(null);
    setInterimTranscript('');
    setFinalTranscript('');
    accumulatedFinalRef.current = '';

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = '';
      let finalChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          finalChunk += transcript;
          accumulatedFinalRef.current += transcript;
        } else {
          interim += transcript;
        }
      }
      if (interim) {
        setInterimTranscript(interim);
        onInterim?.(interim);
      }
      if (finalChunk) {
        setFinalTranscript(accumulatedFinalRef.current);
        onFinal?.(finalChunk);
      }
    };

    recognition.onerror = (event) => {
      const err = event.error;
      if (err === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone permission.');
        shouldRestartRef.current = false;
      } else if (err === 'no-speech') {
        // No speech heard; don't show as error, just keep listening
        setError(null);
      } else if (err === 'network') {
        setError('Network error. Check your connection and try again.');
        shouldRestartRef.current = false;
      } else if (err === 'aborted') {
        setError(null);
      } else {
        setError(err ? `Error: ${err}` : 'Speech recognition error.');
        shouldRestartRef.current = false;
      }
    };

    recognition.onend = () => {
      if (shouldRestartRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          setIsListening(false);
          shouldRestartRef.current = false;
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
    shouldRestartRef.current = true;
    try {
      recognition.start();
      setIsListening(true);
    } catch (e) {
      setError(e?.message || 'Failed to start microphone.');
      shouldRestartRef.current = false;
    }
  }, [language, onInterim, onFinal, onError]);

  const stop = useCallback(() => {
    shouldRestartRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => {
      shouldRestartRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    isSupported,
    isListening,
    error,
    interimTranscript,
    finalTranscript,
    start,
    stop,
  };
}

export default useSpeechRecognition;
