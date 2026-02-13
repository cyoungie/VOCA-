import VRScenarioFrame from '../components/VRScenarioFrame';

export default function AirportScene() {
  return (
    <VRScenarioFrame
      sceneId="airport"
      title="You're at the airport"
      prompt="I have a connecting flight"
      hint="Where is the gate for my connecting flight?"
    />
  );
}
