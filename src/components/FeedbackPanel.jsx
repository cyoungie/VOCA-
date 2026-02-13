import useStore from '../store/useStore';

/**
 * Real-time feedback: mic status, live transcript, AI feedback messages.
 */
export default function FeedbackPanel() {
  const micStatus = useStore((s) => s.micStatus);
  const liveTranscript = useStore((s) => s.liveTranscript);
  const currentFeedback = useStore((s) => s.currentFeedback);
  const hintsOn = useStore((s) => s.hintsOn);

  const statusLabel =
    micStatus === 'listening'
      ? 'Listening…'
      : micStatus === 'processing'
        ? 'Processing…'
        : 'Idle';

  const statusColor =
    micStatus === 'listening'
      ? 'bg-green-500'
      : micStatus === 'processing'
        ? 'bg-amber-500'
        : 'bg-slate-500';

  return (
    <div className="flex flex-col gap-3 p-4 bg-voca-surface/95 rounded-xl border border-white/10 min-h-[140px]">
      {/* Microphone status */}
      <div className="flex items-center gap-2">
        <span
          className={`w-2.5 h-2.5 rounded-full ${statusColor} ${micStatus !== 'idle' ? 'animate-pulse' : ''}`}
          aria-hidden
        />
        <span className="text-sm font-medium text-slate-300">{statusLabel}</span>
      </div>

      {/* Live transcript */}
      <div className="flex-1 min-h-[2.5rem]">
        <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
          You said
        </p>
        <p className="text-slate-200 text-sm md:text-base min-h-[1.5rem]">
          {liveTranscript || (
            <span className="italic text-slate-500">Start speaking…</span>
          )}
        </p>
      </div>

      {/* AI feedback messages */}
      <div className="space-y-1.5">
        <p className="text-xs uppercase tracking-wider text-slate-500">
          Feedback
        </p>
        {currentFeedback.length === 0 ? (
          <p className="text-slate-500 text-sm italic">
            Feedback will appear as you speak.
          </p>
        ) : (
          <ul className="space-y-1">
            {currentFeedback.map((item, i) => (
              <li
                key={i}
                className={`text-sm ${
                  item.type === 'success'
                    ? 'text-emerald-400'
                    : item.type === 'tip'
                      ? 'text-amber-300'
                      : 'text-indigo-300'
                }`}
              >
                {item.type === 'success' && '✅ '}
                {item.type === 'tip' && hintsOn && '💡 '}
                {item.type === 'goal' && '🎯 '}
                {item.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
