import VRScenarioFrame from '../components/VRScenarioFrame';

export default function RestaurantScene() {
  return (
    <VRScenarioFrame
      sceneId="restaurant"
      title="You're at a restaurant"
      prompt="I'd like to see the menu"
      hint="Could I have the bill, please?"
    />
  );
}
