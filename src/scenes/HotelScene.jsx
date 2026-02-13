import VRScenarioFrame from '../components/VRScenarioFrame';

export default function HotelScene() {
  return (
    <VRScenarioFrame
      sceneId="hotel"
      title="You're at a hotel"
      prompt="I have a reservation"
      hint="I'd like a room with a view"
    />
  );
}
