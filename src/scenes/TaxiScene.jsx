import VRScenarioFrame from '../components/VRScenarioFrame';

export default function TaxiScene() {
  return (
    <VRScenarioFrame
      sceneId="taxi"
      title="You're in a taxi"
      prompt="Take me to the station, please"
      hint="How long will it take?"
    />
  );
}
