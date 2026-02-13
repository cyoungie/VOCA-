import { create } from 'zustand';

export const SCENARIOS = [
  'cafe',
  'interview',
  'airport',
  'doctor',
  'shopping',
  'dating',
  'hotel',
  'restaurant',
  'taxi',
];

const VALID_SCENES = new Set(SCENARIOS);

const useStore = create((set) => ({
  // App flow: 'home' | 'vr' | 'results'
  screen: 'home',

  currentScene: 'cafe',

  conversationHistory: [],

  // Conversation UI state
  currentFeedback: [], // { type: 'success'|'tip'|'goal', text: string }[]
  micStatus: 'idle', // 'idle' | 'listening' | 'processing'
  liveTranscript: '',
  currentGoalIndex: 0,
  hintsOn: true,
  playbackSpeed: 1,

  vocabularyLearned: [],

  userProgress: {
    xp: 0,
    level: 1,
  },

  // Last session results (after exiting VR)
  lastSessionResults: null,

  // --- Screen flow ---
  enterVR: (scene) =>
    set((state) => {
      if (!VALID_SCENES.has(scene)) return state;
      return {
        screen: 'vr',
        currentScene: scene,
        conversationHistory: [],
        currentFeedback: [],
        micStatus: 'idle',
        liveTranscript: '',
        currentGoalIndex: 0,
      };
    }),

  exitToResults: (results) =>
    set({
      screen: 'results',
      lastSessionResults: results ?? null,
    }),

  tryAgain: () =>
    set((state) => ({
      screen: 'vr',
      conversationHistory: [],
      currentFeedback: [],
      micStatus: 'idle',
      liveTranscript: '',
      currentGoalIndex: 0,
    })),

  nextScenario: () =>
    set({
      screen: 'home',
      lastSessionResults: null,
    }),

  goHome: () =>
    set({
      screen: 'home',
      lastSessionResults: null,
    }),

  // --- Scene ---
  setCurrentScene: (scene) =>
    set((state) => {
      if (!VALID_SCENES.has(scene)) return state;
      return { currentScene: scene };
    }),

  // --- Conversation ---
  addToConversationHistory: (entry) =>
    set((state) => ({
      conversationHistory: [...state.conversationHistory, entry],
    })),
  setConversationHistory: (history) =>
    set({ conversationHistory: Array.isArray(history) ? history : [] }),
  clearConversationHistory: () => set({ conversationHistory: [] }),

  // Conversation feedback & mic
  setCurrentFeedback: (feedback) =>
    set({
      currentFeedback: Array.isArray(feedback) ? feedback : [],
    }),
  addFeedback: (item) =>
    set((state) => ({
      currentFeedback: [...state.currentFeedback, item].slice(-5),
    })),
  setMicStatus: (status) =>
    set({
      micStatus: status === 'idle' || status === 'listening' || status === 'processing' ? status : 'idle',
    }),
  setLiveTranscript: (text) => set({ liveTranscript: text ?? '' }),
  setCurrentGoalIndex: (index) =>
    set((state) => ({
      currentGoalIndex: Math.max(0, Math.floor(index)),
    })),
  advanceGoal: () =>
    set((state) => ({
      currentGoalIndex: state.currentGoalIndex + 1,
    })),
  setHintsOn: (on) => set({ hintsOn: !!on }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: Number(speed) || 1 }),

  // --- Vocabulary ---
  addVocabularyLearned: (word) =>
    set((state) => ({
      vocabularyLearned: state.vocabularyLearned.includes(word)
        ? state.vocabularyLearned
        : [...state.vocabularyLearned, word],
    })),
  setVocabularyLearned: (words) =>
    set({
      vocabularyLearned: Array.isArray(words) ? words : [],
    }),

  // --- Progress ---
  addXP: (amount) =>
    set((state) => {
      const xp = state.userProgress.xp + (amount ?? 0);
      const level = Math.floor(xp / 100) + 1;
      return {
        userProgress: {
          ...state.userProgress,
          xp,
          level,
        },
      };
    }),
  setUserProgress: (progress) =>
    set((state) => ({
      userProgress: { ...state.userProgress, ...progress },
    })),
  resetProgress: () =>
    set({
      userProgress: { xp: 0, level: 1 },
    }),
}));

export default useStore;
