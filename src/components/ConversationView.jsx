import { useState, useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { getScenario, getGoals } from '../data/scenarios';
import AICharacter from './AICharacter';
import FeedbackPanel from './FeedbackPanel';
import ProgressBar from './ProgressBar';
import VoiceInput from './VoiceInput';
import { getAIResponse } from '../services/aiService';
import { speak as speakTTS } from '../services/speechService';

/**
 * Main 2D conversation interface: voice → OpenAI → TTS → character animation + feedback.
 */
export default function ConversationView() {
  const currentScene = useStore((s) => s.currentScene);
  const conversationHistory = useStore((s) => s.conversationHistory);
  const currentGoalIndex = useStore((s) => s.currentGoalIndex);
  const playbackSpeed = useStore((s) => s.playbackSpeed);
  const exitToResults = useStore((s) => s.exitToResults);
  const goHome = useStore((s) => s.goHome);
  const addFeedback = useStore((s) => s.addFeedback);
  const addAssistantMessage = useStore((s) => s.addAssistantMessage);
  const setMicStatus = useStore((s) => s.setMicStatus);
  const setIsAISpeaking = useStore((s) => s.setIsAISpeaking);
  const hintsOn = useStore((s) => s.hintsOn);
  const setHintsOn = useStore((s) => s.setHintsOn);
  const setPlaybackSpeed = useStore((s) => s.setPlaybackSpeed);

  const [showSettings, setShowSettings] = useState(false);
  const [aiError, setAiError] = useState(null);
  const lastProcessedRef = useRef(0);
  const isProcessingRef = useRef(false);

  const scenario = getScenario(currentScene);
  const goals = getGoals(currentScene);
  const currentGoal = goals[currentGoalIndex] ?? null;

  // When user sends a message → call OpenAI → add reply + feedback → TTS (character animates)
  useEffect(() => {
    const history = conversationHistory;
    if (!history.length || isProcessingRef.current) return;
    const last = history[history.length - 1];
    if (last?.role !== 'user' || history.length <= lastProcessedRef.current) return;

    const userText = last.text?.trim();
    if (!userText) return;

    lastProcessedRef.current = history.length;
    isProcessingRef.current = true;
    setAiError(null);
    setMicStatus('processing');

    getAIResponse({
      userMessage: userText,
      conversationHistory: history.slice(0, -1),
      scenarioTitle: scenario?.title ?? currentScene,
      characterRole: scenario?.characterRole ?? 'Assistant',
      currentGoal,
      goals,
      goalIndex: currentGoalIndex,
    })
      .then(({ reply, feedback }) => {
        addAssistantMessage(reply);
        feedback.forEach((item) => addFeedback(item));
        if (reply?.trim()) {
          speakTTS(reply.trim(), {
            rate: playbackSpeed,
            onStart: () => setIsAISpeaking(true),
            onEnd: () => {
              setIsAISpeaking(false);
              setMicStatus('listening');
              isProcessingRef.current = false;
            },
            onError: () => {
              setIsAISpeaking(false);
              setMicStatus('listening');
              isProcessingRef.current = false;
            },
          });
        } else {
          setMicStatus('listening');
          isProcessingRef.current = false;
        }
      })
      .catch((err) => {
        setAiError(err?.message ?? 'AI error');
        addFeedback({ type: 'tip', text: 'Could not get a response. Try again.' });
        setMicStatus('listening');
        setIsAISpeaking(false);
        isProcessingRef.current = false;
      });
  }, [conversationHistory, currentScene, scenario, currentGoal, goals, currentGoalIndex, playbackSpeed, addAssistantMessage, addFeedback, setMicStatus, setIsAISpeaking]);

  const handleEndConversation = () => {
    exitToResults({
      score: 85,
      newWordsCount: 5,
      pronunciationGrade: 'B+',
      fluencyFeedback: 'Great job!',
    });
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

      {/* AI error banner */}
      {aiError && (
        <div className="shrink-0 px-3 md:px-4 py-2 bg-red-900/50 border-b border-red-700/50 flex items-center justify-between gap-2">
          <span className="text-red-200 text-sm">{aiError}</span>
          <button
            type="button"
            onClick={() => setAiError(null)}
            className="text-red-300 hover:text-white text-sm font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Bottom third: feedback panel */}
      <section className="shrink-0 px-3 md:px-4 pb-3 md:pb-4">
        <div className="max-w-2xl mx-auto">
          <FeedbackPanel />
        </div>
      </section>

      {/* Controls: voice input, demo hints, settings, end */}
      <div className="shrink-0 flex items-center justify-end gap-3 px-3 md:px-4 pb-4 flex-wrap">
        <VoiceInput />

        <div className="flex gap-2">
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
