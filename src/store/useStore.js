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
  // App flow: 'home' | 'vr' | 'results' | 'profile'
  screen: 'home',

  currentScene: 'cafe',

  conversationHistory: [],

  // Conversation UI state
  currentFeedback: [], // { type: 'success'|'tip'|'goal', text: string }[]
  micStatus: 'idle', // 'idle' | 'listening' | 'processing'
  liveTranscript: '', // what user is saying now (interim) or last final
  currentTranscript: '', // interim only; liveTranscript shows in UI
  isListening: false,
  isAISpeaking: false, // true when TTS is playing (for lip-sync / talking state)
  currentGoalIndex: 0,
  hintsOn: true,
  playbackSpeed: 1,

  vocabularyLearned: [],

  userProgress: {
    xp: 0,
    level: 1,
  },

  // User profile
  profile: {
    avatar: null, // URL or null (use default)
    username: 'Language Learner',
    streak: 0, // days practicing in a row
    bestStreak: 0, // best streak ever
    lastPracticeDate: null, // YYYY-MM-DD
    memberSince: new Date().toISOString().split('T')[0], // YYYY-MM-DD
  },

  // Stats
  stats: {
    totalPracticeTimeMinutes: 0, // total minutes spent in scenarios
    weeklyPracticeTimeMinutes: 0, // this week's minutes
    lastWeekPracticeTimeMinutes: 0, // last week's minutes
    scenariosCompleted: [], // [{ scenarioId, completedAt: ISO string, durationMinutes }]
    phrasesLearned: 0, // count from vocabularyLearned
    practiceCalendar: {}, // { 'YYYY-MM-DD': minutes } for heatmap
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
        currentTranscript: '',
        isListening: false,
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
      currentTranscript: '',
      isListening: false,
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

  goToProfile: () => set({ screen: 'profile' }),

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
  addUserMessage: (text) =>
    set((state) => ({
      conversationHistory: [
        ...state.conversationHistory,
        { role: 'user', text: text?.trim() || '' },
      ],
    })),
  addAssistantMessage: (text) =>
    set((state) => ({
      conversationHistory: [
        ...state.conversationHistory,
        { role: 'assistant', text: text?.trim() || '' },
      ],
    })),
  setConversationHistory: (history) =>
    set({ conversationHistory: Array.isArray(history) ? history : [] }),
  clearConversationHistory: () => set({ conversationHistory: [] }),
  setIsListening: (value) => set({ isListening: !!value }),
  setCurrentTranscript: (text) => set({ currentTranscript: text ?? '' }),

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
  setIsAISpeaking: (value) => set({ isAISpeaking: !!value }),

  // --- Vocabulary ---
  addVocabularyLearned: (word) =>
    set((state) => {
      const updated = state.vocabularyLearned.includes(word)
        ? state.vocabularyLearned
        : [...state.vocabularyLearned, word];
      return {
        vocabularyLearned: updated,
        stats: {
          ...state.stats,
          phrasesLearned: updated.length,
        },
      };
    }),
  setVocabularyLearned: (words) =>
    set({
      vocabularyLearned: Array.isArray(words) ? words : [],
    }),

  // --- Progress ---
  addXP: (amount) =>
    set((state) => {
      const xp = state.userProgress.xp + (amount ?? 0);
      const level = Math.floor(xp / 100) + 1;
      // Update streak when XP is added (user practiced)
      const today = new Date().toISOString().split('T')[0];
      const lastPractice = state.profile.lastPracticeDate || null;
      const streak = lastPractice === today ? state.profile.streak : lastPractice === getYesterday() ? state.profile.streak + 1 : 1;
      return {
        userProgress: {
          ...state.userProgress,
          xp,
          level,
        },
      profile: {
        ...state.profile,
        streak,
        bestStreak: Math.max(state.profile.bestStreak || 0, streak),
        lastPracticeDate: today,
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

  // --- Profile ---
  updateProfile: (updates) =>
    set((state) => ({
      profile: { ...state.profile, ...updates },
    })),
  setAvatar: (avatarUrl) =>
    set((state) => ({
      profile: { ...state.profile, avatar: avatarUrl },
    })),
  setUsername: (username) =>
    set((state) => ({
      profile: { ...state.profile, username: username?.trim() || 'Language Learner' },
    })),

  // --- Stats ---
  addPracticeTime: (minutes) =>
    set((state) => {
      const today = new Date().toISOString().split('T')[0];
      const calendar = { ...state.stats.practiceCalendar };
      calendar[today] = (calendar[today] || 0) + minutes;
      return {
        stats: {
          ...state.stats,
          totalPracticeTimeMinutes: state.stats.totalPracticeTimeMinutes + minutes,
          weeklyPracticeTimeMinutes: getThisWeekMinutes(calendar),
          lastWeekPracticeTimeMinutes: getLastWeekMinutes(calendar),
          practiceCalendar: calendar,
        },
      };
    }),
  addCompletedScenario: (scenarioId, durationMinutes) =>
    set((state) => ({
      stats: {
        ...state.stats,
        scenariosCompleted: [
          ...state.stats.scenariosCompleted,
          { scenarioId, completedAt: new Date().toISOString(), durationMinutes },
        ],
      },
    })),
  updatePhrasesCount: () =>
    set((state) => ({
      stats: {
        ...state.stats,
        phrasesLearned: state.vocabularyLearned.length,
      },
    })),
}));

function getThisWeekMinutes(calendar) {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  weekStart.setHours(0, 0, 0, 0);
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const key = d.toISOString().split('T')[0];
    total += calendar[key] || 0;
  }
  return total;
}

function getLastWeekMinutes(calendar) {
  const today = new Date();
  const lastWeekStart = new Date(today);
  lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
  lastWeekStart.setHours(0, 0, 0, 0);
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(lastWeekStart);
    d.setDate(lastWeekStart.getDate() + i);
    const key = d.toISOString().split('T')[0];
    total += calendar[key] || 0;
  }
  return total;
}

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export default useStore;
