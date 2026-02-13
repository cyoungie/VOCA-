import VRScenarioFrame from '../components/VRScenarioFrame';

export default function ShoppingScene() {
  return (
    <VRScenarioFrame
      sceneId="shopping"
      title="You're at a market"
      prompt="How much is this?"
      hint="Can I get a discount if I buy two?"
    />
  );
}
