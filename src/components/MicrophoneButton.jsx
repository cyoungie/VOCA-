/**
 * Visual control: pulse when listening, waveform when voice detected, gray when idle.
 */
export default function MicrophoneButton({
  isListening,
  hasVoice,
  onClick,
  disabled,
  className = '',
  'aria-label': ariaLabel,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel ?? (isListening ? 'Stop listening' : 'Start listening')}
      className={`
        relative flex items-center justify-center w-14 h-14 rounded-full
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-voca-dark
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
        ${isListening ? 'bg-red-500/90 hover:bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-slate-600 hover:bg-slate-500 text-white'}
        ${isListening ? 'animate-pulse' : ''}
      `}
    >
      {/* Outer pulse ring when listening */}
      {isListening && (
        <span
          className="absolute inset-0 rounded-full bg-red-500/40 animate-ping"
          aria-hidden
          style={{ animationDuration: '1.5s' }}
        />
      )}

      {/* Waveform bars when voice detected */}
      {hasVoice && isListening ? (
        <span className="relative flex items-end justify-center gap-0.5 h-6" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="w-1 min-h-[6px] bg-white rounded-full animate-waveform origin-bottom"
              style={{
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </span>
      ) : (
        <svg
          className="w-6 h-6 relative z-10"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17h6a1 1 0 110 2h-6a1 1 0 01-1-1v-2.07z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
}
