import useStore from '../store/useStore';

const SCENARIO_LABELS = {
  cafe: 'Cafe',
  interview: 'Interview',
  airport: 'Airport',
  doctor: 'Doctor',
  shopping: 'Shopping',
  dating: 'Dating',
  hotel: 'Hotel',
  restaurant: 'Restaurant',
  taxi: 'Taxi',
};

export default function HomePage() {
  const enterVR = useStore((s) => s.enterVR);
  const goToProfile = useStore((s) => s.goToProfile);

  return (
    <div className="home">
      <header className="home__header">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="home__title">VOCA</h1>
            <p className="home__subtitle">Immersive language learning through AI-powered conversations</p>
          </div>
          <button
            type="button"
            onClick={goToProfile}
            className="p-2 rounded-lg bg-voca-surface hover:bg-voca-surface/80 border border-white/10 transition-colors"
            title="Profile"
            aria-label="Go to profile"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>

      <section className="home__scenarios">
        <h2 className="home__scenarios-title">Browse Scenarios</h2>
        <div className="home__grid">
          {Object.entries(SCENARIO_LABELS).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className="home__card"
              onClick={() => enterVR(id)}
            >
              <span className="home__card-label">{label}</span>
              <span className="home__card-hint">Click → Enter VR</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
