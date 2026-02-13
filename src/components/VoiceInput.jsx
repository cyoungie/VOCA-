import { useRef, useEffect } from 'react';
import useStore from '../store/useStore';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import MicrophoneButton from './MicrophoneButton';

const LANGUAGE = 'en-US';

/**
 * Voice input: Web Speech API, continuous listening, real-time transcript,
 * syncs with Zustand (isListening, currentTranscript, liveTranscript, addUserMessage).
 * UI states: Click to start | Listening... | Processing... | Error: [message]
 */
export default function VoiceInput() {
  const micStatus = useStore((s) => s.micStatus);
  const setMicStatus = useStore((s) => s.setMicStatus);
  const setLiveTranscript = useStore((s) => s.setLiveTranscript);
  const setCurrentTranscript = useStore((s) => s.setCurrentTranscript);
  const addUserMessage = useStore((s) => s.addUserMessage);
  const setIsListening = useStore((s) => s.setIsListening);

  const processingTimeoutRef = useRef(null);
  const accumulatedFinalRef = useRef('');

  const handleInterim = (interim) => {
    setCurrentTranscript(interim);
    const display = accumulatedFinalRef.current + interim;
    setLiveTranscript(display.trim() || '');
  };

  const handleFinal = (chunk) => {
    if (!chunk?.trim()) return;
    const text = chunk.trim();
    accumulatedFinalRef.current += chunk;
    setCurrentTranscript('');
    setLiveTranscript(accumulatedFinalRef.current.trim());
    addUserMessage(text);
    setMicStatus('processing');
    if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current);
    processingTimeoutRef.current = setTimeout(() => {
      setMicStatus('listening');
      processingTimeoutRef.current = null;
    }, 800);
  };

  const {
    isSupported,
    isListening,
    error: recognitionError,
    interimTranscript,
    finalTranscript,
    start,
    stop,
  } = useSpeechRecognition({
    language: LANGUAGE,
    onInterim: handleInterim,
    onFinal: handleFinal,
  });

  useEffect(() => {
    setIsListening(isListening);
    if (isListening) {
      setMicStatus('listening');
      accumulatedFinalRef.current = finalTranscript || '';
    } else {
      setMicStatus('idle');
    }
  }, [isListening, setIsListening, setMicStatus, finalTranscript]);

  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current);
    };
  }, []);

  const handleToggle = () => {
    if (!isSupported) return;
    if (recognitionError) {
      start();
      return;
    }
    if (isListening) {
      stop();
    } else {
      accumulatedFinalRef.current = '';
      start();
    }
  };

  const hasVoice = !!(interimTranscript?.trim() || finalTranscript?.trim());
  const errorMessage = recognitionError ?? null;

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-full w-14 h-14 bg-slate-600 flex items-center justify-center text-slate-400">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17h6a1 1 0 110 2h-6a1 1 0 01-1-1v-2.07z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <p className="text-sm text-amber-400 text-center max-w-[220px]">
          Speech recognition is not supported. Use Chrome or Edge for voice input.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <MicrophoneButton
        isListening={isListening}
        hasVoice={hasVoice}
        onClick={handleToggle}
        disabled={false}
        aria-label={isListening ? 'Stop listening' : 'Start listening'}
      />
      <p
        className={`text-sm font-medium min-h-[1.25rem] ${
          errorMessage
            ? 'text-red-400'
            : micStatus === 'processing'
              ? 'text-amber-400'
              : isListening
                ? 'text-emerald-400'
                : 'text-slate-400'
        }`}
      >
        {errorMessage
          ? `Error: ${errorMessage}`
          : micStatus === 'processing'
            ? 'Processing…'
            : isListening
              ? 'Listening…'
              : 'Click to start'}
      </p>
    </div>
  );
}
