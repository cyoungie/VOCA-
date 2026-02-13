/**
 * Text-to-speech for AI character responses.
 * Uses Web Speech Synthesis API (built-in, no key required).
 * onStart / onEnd drive character mouth animation (isAISpeaking).
 */

const DEFAULT_LANG = 'en-US';

let synthesis = null;

function getSynthesis() {
  if (typeof window === 'undefined') return null;
  if (!window.speechSynthesis) return null;
  return window.speechSynthesis;
}

/**
 * Get a natural-sounding voice for the given language.
 * Prefer a local, non-robotic voice.
 */
function getVoice(lang = DEFAULT_LANG) {
  const syn = getSynthesis();
  if (!syn) return null;
  const voices = syn.getVoices();
  const match = voices.find((v) => v.lang.startsWith(lang) && v.localService) ||
    voices.find((v) => v.lang.startsWith(lang)) ||
    voices.find((v) => v.default);
  return match || null;
}

/**
 * Speak text with Web Speech Synthesis.
 * @param {string} text - Text to speak
 * @param {Object} [options]
 * @param {string} [options.lang] - Language code (default: en-US)
 * @param {number} [options.rate] - Speed 0.1–10 (default: 1)
 * @param {number} [options.pitch] - Pitch 0–2 (default: 1)
 * @param {() => void} [options.onStart] - Called when speech starts (e.g. set isAISpeaking true)
 * @param {() => void} [options.onEnd] - Called when speech ends (e.g. set isAISpeaking false)
 * @param {(e: Error) => void} [options.onError] - Called on error
 */
export function speak(text, options = {}) {
  const syn = getSynthesis();
  if (!syn) {
    options.onError?.(new Error('Speech synthesis not supported'));
    return;
  }

  const {
    lang = DEFAULT_LANG,
    rate = 1,
    pitch = 1,
    onStart,
    onEnd,
    onError,
  } = options;

  syn.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = Math.max(0.5, Math.min(2, rate));
  utterance.pitch = Math.max(0.5, Math.min(2, pitch));
  utterance.volume = 1;

  const voice = getVoice(lang);
  if (voice) utterance.voice = voice;

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    onEnd?.();
  };

  utterance.onerror = (e) => {
    onError?.(new Error(e?.error || 'Speech synthesis error'));
    onEnd?.();
  };

  syn.speak(utterance);
}

/**
 * Stop any current speech.
 */
export function stopSpeaking() {
  const syn = getSynthesis();
  if (syn) syn.cancel();
}

/**
 * Check if speech synthesis is available.
 */
export function isSpeechSupported() {
  return !!getSynthesis();
}

export default speak;
