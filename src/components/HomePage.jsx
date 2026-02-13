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

  return (
    <div className="home">
      <header className="home__header">
        <h1 className="home__title">VOCA</h1>
        <p className="home__subtitle">Immersive language learning through AI-powered conversations</p>
      </header>

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
