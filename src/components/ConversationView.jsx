import { useState } from 'react';
import useStore from '../store/useStore';
import { getScenario } from '../data/scenarios';
import AICharacter from './AICharacter';
import FeedbackPanel from './FeedbackPanel';
import ProgressBar from './ProgressBar';

/**
 * Main 2D conversation interface: character + background, feedback panel, progress, controls.
 * Duolingo-meets-Zoom style; placeholder behavior until real AI integration.
 */
export default function ConversationView() {
  const currentScene = useStore((s) => s.currentScene);
  const exitToResults = useStore((s) => s.exitToResults);
  const goHome = useStore((s) => s.goHome);
  const setMicStatus = useStore((s) => s.setMicStatus);
  const setLiveTranscript = useStore((s) => s.setLiveTranscript);
  const addFeedback = useStore((s) => s.addFeedback);
  const advanceGoal = useStore((s) => s.advanceGoal);
  const currentGoalIndex = useStore((s) => s.currentGoalIndex);
  const hintsOn = useStore((s) => s.hintsOn);
  const setHintsOn = useStore((s) => s.setHintsOn);
  const playbackSpeed = useStore((s) => s.playbackSpeed);
  const setPlaybackSpeed = useStore((s) => s.setPlaybackSpeed);

  const [muted, setMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const scenario = getScenario(currentScene);
  const goals = scenario?.goals ?? [];
  const totalGoals = goals.length;
  const allGoalsDone = totalGoals > 0 && currentGoalIndex >= totalGoals;

  const handleEndConversation = () => {
    exitToResults({
      score: 85,
      newWordsCount: 5,
      pronunciationGrade: 'B+',
      fluencyFeedback: 'Great job!',
    });
  };

  /* Placeholder: simulate listening → transcript → feedback (for demo) */
  const handleDemoSpeak = () => {
    setMicStatus('listening');
    setLiveTranscript('');
    setTimeout(() => {
      setLiveTranscript("I'd like a coffee, please.");
      setMicStatus('processing');
    }, 800);
    setTimeout(() => {
      setMicStatus('idle');
      addFeedback({ type: 'success', text: 'Great pronunciation!' });
      if (currentGoalIndex < totalGoals) advanceGoal();
    }, 1600);
  };

  const handleDemoHint = () => {
    addFeedback({
      type: 'tip',
      text: "Try saying: 'May I have a coffee, please?'",
    });
  };

  const handleDemoGoal = () => {
    addFeedback({
      type: 'goal',
      text: "Good! Now ask about the price.",
    });
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-voca-dark text-white overflow-hidden">
      {/* Top: scenario progress */}
      <header className="shrink-0 p-3 md:p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <button
            type="button"
            onClick={goHome}
            className="text-slate-400 hover:text-white text-sm font-medium"
          >
            ← Exit
          </button>
          <span className="text-slate-400 text-sm font-medium">
            {scenario?.title ?? currentScene}
          </span>
        </div>
        <ProgressBar />
      </header>

      {/* Main: AI character + background */}
      <section className="flex-1 min-h-0 px-3 md:px-4 pb-2">
        <AICharacter scenarioId={currentScene} />
      </section>

      {/* Bottom third: feedback panel */}
      <section className="shrink-0 px-3 md:px-4 pb-3 md:pb-4">
        <div className="max-w-2xl mx-auto">
          <FeedbackPanel />
        </div>
      </section>

      {/* Controls: mute, end, settings */}
      <div className="shrink-0 flex items-center justify-end gap-2 px-3 md:px-4 pb-4">
        {/* Placeholder demo buttons – remove when real mic/AI is wired */}
        <div className="flex gap-2 mr-auto">
          <button
            type="button"
            onClick={handleDemoSpeak}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            Demo: Speak
          </button>
          <button
            type="button"
            onClick={handleDemoHint}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-600 hover:bg-amber-500 text-white"
          >
            Demo: Hint
          </button>
          <button
            type="button"
            onClick={handleDemoGoal}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            Demo: Goal
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className={`p-2.5 rounded-full transition-colors ${
            muted ? 'bg-red-600/80 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'
          }`}
          title={muted ? 'Unmute' : 'Mute'}
          aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {muted ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.776L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.797-3.797a1 1 0 011.414 0zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.113-.878-4.027-2.293-5.414a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17h6a1 1 0 110 2h-6a1 1 0 01-1-1v-2.07z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSettings((s) => !s)}
            className="p-2.5 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-colors"
            title="Settings"
            aria-label="Open settings"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286 1.048c-1.372-.836-2.942.734-2.106 2.106a1.532 1.532 0 01-1.048 2.286C3.57 8.995 3 9.58 3 10.25s.57 1.255 1.273 1.945c.386.37.886.574 1.273.574.228 0 .454-.052.658-.154 1.372-.836 2.942.734 2.106 2.106a1.532 1.532 0 01-2.286 1.048 1.532 1.532 0 01-1.048-2.286c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.286-1.048 1.532 1.532 0 01-1.048-2.286c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.286 1.048 1.532 1.532 0 01-.836-2.106c.836-1.372.734-2.942-2.106-2.106a1.532 1.532 0 01-1.048-2.286C.93 5.57 1.515 5 2.185 5H2.25c.58 0 1.127.228 1.545.63.418.403.652.95.652 1.545 0 .228-.052.454-.154.658-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.286 1.048 1.532 1.532 0 012.286 1.048c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 011.048-2.286c1.372-.836.734-2.942-2.106-2.106a1.532 1.532 0 01-1.048-2.286C10.43 3.57 10.845 3 11.515 3h.235c.58 0 1.127.228 1.545.63.418.403.652.95.652 1.545 0 .228-.052.454-.154.658zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {showSettings && (
            <>
              <div
                className="fixed inset-0 z-10"
                aria-hidden
                onClick={() => setShowSettings(false)}
              />
              <div className="absolute right-0 bottom-full mb-2 w-56 p-3 bg-voca-surface border border-white/10 rounded-xl shadow-xl z-20">
                <p className="text-xs font-medium text-slate-400 mb-2">
                  Settings
                </p>
                <label className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-sm">Hints on</span>
                  <input
                    type="checkbox"
                    checked={hintsOn}
                    onChange={(e) => setHintsOn(e.target.checked)}
                    className="rounded border-slate-600 text-voca-primary focus:ring-voca-primary"
                  />
                </label>
                <label className="flex items-center justify-between gap-2">
                  <span className="text-sm">Speed</span>
                  <select
                    value={playbackSpeed}
                    onChange={(e) =>
                      setPlaybackSpeed(Number(e.target.value))}
                    className="rounded bg-slate-700 border-slate-600 text-white text-sm px-2 py-1"
                  >
                    <option value={0.75}>0.75×</option>
                    <option value={1}>1×</option>
                    <option value={1.25}>1.25×</option>
                    <option value={1.5}>1.5×</option>
                  </select>
                </label>
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={handleEndConversation}
          className="px-4 py-2.5 rounded-lg font-medium bg-red-600 hover:bg-red-500 text-white transition-colors"
        >
          End conversation
        </button>
      </div>
    </div>
  );
}
