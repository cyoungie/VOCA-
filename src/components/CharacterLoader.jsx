import { Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import { getAvatarUrl } from '../data/avatars';

/**
 * Loads and renders a Ready Player Me GLB by scenario.
 * Used inside AvatarScene (Three.js context).
 */
function Model({ scenarioId, ...props }) {
  const url = getAvatarUrl(scenarioId);
  const { scene } = useGLTF(url);
  return <primitive object={scene} {...props} />;
}

export function CharacterLoader({ scenarioId, ...props }) {
  return (
    <Suspense fallback={null}>
      <Model scenarioId={scenarioId} {...props} />
    </Suspense>
  );
}

export default CharacterLoader;
