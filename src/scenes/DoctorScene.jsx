import VRScenarioFrame from '../components/VRScenarioFrame';

export default function DoctorScene() {
  return (
    <VRScenarioFrame
      sceneId="doctor"
      title="You're at the doctor's"
      prompt="I have a headache"
      hint="I've had it for two days"
    />
  );
}
