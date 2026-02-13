/**
 * Text-to-speech for AI character: ElevenLabs (natural voice) with Web Speech fallback.
 * onStart / onEnd drive character mouth animation (isAISpeaking).
 */

const DEFAULT_LANG = 'en-US';
const ELEVENLABS_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

function getElevenLabsKey() {
  return typeof import.meta !== 'undefined' && import.meta.env?.VITE_ELEVENLABS_API_KEY;
}

function getElevenLabsVoiceId() {
  return (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ELEVENLABS_VOICE_ID) || 'EXAVITQu4vr4xnSDxMaL';
}

function getSynthesis() {
  if (typeof window === 'undefined') return null;
  return window.speechSynthesis || null;
}

function getVoice(lang = DEFAULT_LANG) {
  const syn = getSynthesis();
  if (!syn) return null;
  const voices = syn.getVoices();
  return voices.find((v) => v.lang.startsWith(lang) && v.localService)
    || voices.find((v) => v.lang.startsWith(lang))
    || voices.find((v) => v.default)
    || null;
}

/**
 * Speak using ElevenLabs API: fetch audio, play via Audio element, fire onStart/onEnd.
 */
function speakElevenLabs(text, options) {
  const apiKey = getElevenLabsKey();
  if (!apiKey) return false;

  const voiceId = getElevenLabsVoiceId();
  const { rate = 1, onStart, onEnd, onError } = options;

  const url = `${ELEVENLABS_URL}/${voiceId}`;
  const body = JSON.stringify({
    text: text.trim(),
    model_id: 'eleven_multilingual_v2',
  });

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body,
  })
    .then((res) => {
      if (!res.ok) return res.json().then((j) => Promise.reject(new Error(j?.detail?.message || j?.message || `ElevenLabs ${res.status}`)));
      return res.arrayBuffer();
    })
    .then((arrayBuffer) => {
      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const objectUrl = URL.createObjectURL(blob);
      const audio = new window.Audio(objectUrl);
      audio.playbackRate = Math.max(0.5, Math.min(2, rate));

      audio.onplay = () => {
        onStart?.();
      };
      audio.onended = () => {
        URL.revokeObjectURL(objectUrl);
        onEnd?.();
      };
      audio.onerror = (e) => {
        URL.revokeObjectURL(objectUrl);
        onError?.(new Error(e?.message || 'Playback error'));
        onEnd?.();
      };

      audio.play().catch((err) => {
        URL.revokeObjectURL(objectUrl);
        onError?.(err);
        onEnd?.();
      });
    })
    .catch((err) => {
      onError?.(err);
      onEnd?.();
    });

  return true;
}

/**
 * Speak using Web Speech Synthesis (fallback when ElevenLabs key is not set).
 */
function speakWebSpeech(text, options) {
  const syn = getSynthesis();
  if (!syn) {
    options.onError?.(new Error('Speech synthesis not supported'));
    return;
  }

  const { lang = DEFAULT_LANG, rate = 1, pitch = 1, onStart, onEnd, onError } = options;

  syn.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = Math.max(0.5, Math.min(2, rate));
  utterance.pitch = Math.max(0.5, Math.min(2, pitch));
  utterance.volume = 1;

  const voice = getVoice(lang);
  if (voice) utterance.voice = voice;

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => {
    onError?.(new Error('Speech synthesis error'));
    onEnd?.();
  };

  syn.speak(utterance);
}

/**
 * Speak text: uses ElevenLabs if VITE_ELEVENLABS_API_KEY is set, otherwise Web Speech.
 * @param {string} text - Text to speak
 * @param {Object} [options]
 * @param {string} [options.lang] - Language (Web fallback only)
 * @param {number} [options.rate] - Speed (default 1)
 * @param {number} [options.pitch] - Pitch (Web fallback only)
 * @param {() => void} [options.onStart] - When speech starts → set isAISpeaking true
 * @param {() => void} [options.onEnd] - When speech ends → set isAISpeaking false
 * @param {(e: Error) => void} [options.onError] - On error
 */
export function speak(text, options = {}) {
  if (!text?.trim()) {
    options.onEnd?.();
    return;
  }
  const used = speakElevenLabs(text, options);
  if (!used) speakWebSpeech(text, options);
}

/**
 * Stop any current speech (Web Speech only; ElevenLabs playback would need ref to Audio).
 */
export function stopSpeaking() {
  const syn = getSynthesis();
  if (syn) syn.cancel();
}

export function isSpeechSupported() {
  return !!getSynthesis() || !!getElevenLabsKey();
}

/** Whether ElevenLabs is configured (avatar will use natural voice). */
export function isElevenLabsEnabled() {
  return !!getElevenLabsKey();
}

export default speak;
