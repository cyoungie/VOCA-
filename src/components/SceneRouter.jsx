import { useEffect, useState } from 'react';
import useStore from '../store/useStore';
import CafeScene from '../scenes/CafeScene';
import AirportScene from '../scenes/AirportScene';
import ShoppingScene from '../scenes/ShoppingScene';
import InterviewScene from '../scenes/InterviewScene';
import DoctorScene from '../scenes/DoctorScene';
import DatingScene from '../scenes/DatingScene';
import HotelScene from '../scenes/HotelScene';
import RestaurantScene from '../scenes/RestaurantScene';
import TaxiScene from '../scenes/TaxiScene';

const SCENE_MAP = {
  cafe: CafeScene,
  interview: InterviewScene,
  airport: AirportScene,
  doctor: DoctorScene,
  shopping: ShoppingScene,
  dating: DatingScene,
  hotel: HotelScene,
  restaurant: RestaurantScene,
  taxi: TaxiScene,
};

const TRANSITION_MS = 400;

export default function SceneRouter() {
  const currentScene = useStore((s) => s.currentScene);
  const goHome = useStore((s) => s.goHome);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayScene, setDisplayScene] = useState(currentScene);

  useEffect(() => {
    if (currentScene === displayScene) return;
    setIsTransitioning(true);
    const t = setTimeout(() => {
      setDisplayScene(currentScene);
      setIsTransitioning(false);
    }, TRANSITION_MS);
    return () => clearTimeout(t);
  }, [currentScene, displayScene]);

  const SceneComponent = SCENE_MAP[displayScene] ?? CafeScene;

  if (isTransitioning) {
    return (
      <div className="scene-router scene-router--loading" aria-busy="true">
        <div className="scene-loading">
          <div className="scene-loading__spinner" />
          <p className="scene-loading__text">Loading scene…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="scene-router" data-current-scene={displayScene}>
      <button type="button" className="scene-router__back" onClick={goHome}>
        ← Back to home
      </button>
      <SceneComponent />
    </div>
  );
}
