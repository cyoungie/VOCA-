import useStore from '../store/useStore';

const DEFAULT_RESULTS = {
  score: 0,
  newWordsCount: 0,
  pronunciationGrade: '—',
  fluencyFeedback: '—',
};

export default function ResultsScreen() {
  const lastSessionResults = useStore((s) => s.lastSessionResults);
  const tryAgain = useStore((s) => s.tryAgain);
  const nextScenario = useStore((s) => s.nextScenario);

  const r = lastSessionResults ?? DEFAULT_RESULTS;
  const score = r.score ?? 0;
  const newWords = r.newWordsCount ?? 0;
  const pronunciation = r.pronunciationGrade ?? '—';
  const fluency = r.fluencyFeedback ?? '—';

  return (
    <div className="results">
      <header className="results__header">
        <h1 className="results__title">Session Results</h1>
      </header>

      <div className="results__stats">
        <div className="results__stat">
          <span className="results__stat-icon">📊</span>
          <span className="results__stat-label">Score</span>
          <span className="results__stat-value">{score}/100</span>
        </div>
        <div className="results__stat">
          <span className="results__stat-icon">⭐</span>
          <span className="results__stat-label">New words</span>
          <span className="results__stat-value">{newWords}</span>
        </div>
        <div className="results__stat">
          <span className="results__stat-icon">🎯</span>
          <span className="results__stat-label">Pronunciation</span>
          <span className="results__stat-value">{pronunciation}</span>
        </div>
        <div className="results__stat">
          <span className="results__stat-icon">💬</span>
          <span className="results__stat-label">Fluency</span>
          <span className="results__stat-value">{fluency}</span>
        </div>
      </div>

      <div className="results__actions">
        <button type="button" className="results__btn results__btn--secondary" onClick={tryAgain}>
          Try Again
        </button>
        <button type="button" className="results__btn results__btn--primary" onClick={nextScenario}>
          Next Scenario
        </button>
      </div>
    </div>
  );
}
