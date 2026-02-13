import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import CharacterLoader from './CharacterLoader';

/** Idle + talking animation: subtle breathing and listening/talking motion */
function AnimatedCharacter({ scenarioId, isSpeaking }) {
  const groupRef = useRef(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    // Idle: subtle breathing (scale) and slight sway
    const breathe = 1 + Math.sin(t * 0.8) * 0.015;
    const sway = Math.sin(t * 0.3) * 0.02;
    const nod = Math.sin(t * 0.5) * 0.03;
    groupRef.current.scale.setScalar(breathe);
    groupRef.current.rotation.y = sway;
    groupRef.current.rotation.x = nod;
    // Talking: slightly more movement (lip-sync placeholder)
    if (isSpeaking) {
      const talk = Math.sin(t * 12) * 0.015;
      groupRef.current.rotation.x += talk;
    }
  });

  return (
    <group ref={groupRef} position={[0, -1.2, 0]} scale={1.4}>
      <CharacterLoader scenarioId={scenarioId} isSpeaking={isSpeaking} />
    </group>
  );
}

export default function AvatarScene({ scenarioId, isSpeaking = false }) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 5]} intensity={1.2} />
      <directionalLight position={[-2, 3, 2]} intensity={0.4} />
      <pointLight position={[0, 3, 2]} intensity={0.4} color="#fff5e6" />
      <AnimatedCharacter scenarioId={scenarioId} isSpeaking={isSpeaking} />
    </>
  );
}
