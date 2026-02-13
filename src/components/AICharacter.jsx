import { Suspense, Component } from 'react';
import { Canvas } from '@react-three/fiber';
import useStore from '../store/useStore';
import { getScenario } from '../data/scenarios';
import AvatarScene from './AvatarScene';

/** Use uploaded character image instead of 3D model (see public/avatars/character.png) */
const USE_IMAGE_AVATAR = true;

/** Which character from the image: 'left' (male) or 'right' (female) */
const IMAGE_AVATAR_SIDE = 'left';

/** Catches GLB load / runtime errors and shows fallback */
class AvatarErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

/** Transparent canvas background so scenario shows through */
function TransparentCanvas({ children, ...props }) {
  return (
    <Canvas
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0.3, 2.2], fov: 42 }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
      style={{ background: 'transparent' }}
      {...props}
    >
      {children}
    </Canvas>
  );
}

const PlaceholderAvatar = ({ characterRole }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center shadow-xl">
      <span className="text-4xl md:text-5xl" aria-hidden>👤</span>
    </div>
    <span className="text-white text-sm font-medium drop-shadow-lg bg-black/30 px-2 py-0.5 rounded">
      {characterRole}
    </span>
  </div>
);

/**
 * Image-based avatar: one character from the uploaded photo (cropped left or right half).
 * Subtle scale when speaking.
 */
function ImageAvatar({ isSpeaking }) {
  const objectPos = IMAGE_AVATAR_SIDE === 'right' ? 'right center' : 'left center';

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center transition-transform duration-200 ${
        isSpeaking ? 'scale-[1.02]' : 'scale-100'
      }`}
    >
      <div className="h-full max-h-[420px] w-full max-w-[280px] overflow-hidden rounded-lg shadow-2xl">
        <img
          src="/avatars/character.png"
          alt="AI character"
          className="h-full w-[200%] max-w-none object-cover"
          style={{ objectPosition: objectPos }}
        />
      </div>
    </div>
  );
}

/**
 * AI character in scenario: image avatar (uploaded photo) or 3D (Ready Player Me).
 * Idle: subtle presence. Talking: slight scale when isAISpeaking (TTS).
 */
export default function AICharacter({ scenarioId }) {
  const scenario = getScenario(scenarioId);
  const backgroundImage = scenario?.backgroundImage ?? '';
  const characterRole = scenario?.characterRole ?? 'Assistant';
  const isAISpeaking = useStore((s) => s.isAISpeaking);

  const fallback = (
    <div className="w-full h-full flex items-center justify-center">
      <PlaceholderAvatar characterRole={characterRole} />
    </div>
  );

  return (
    <div className="relative w-full h-full min-h-[280px] md:min-h-[360px] overflow-hidden rounded-xl bg-voca-surface">
      {/* Background: scenario environment */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      </div>

      {/* Character overlay – image (uploaded photo) or 3D */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {USE_IMAGE_AVATAR ? (
          <ImageAvatar isSpeaking={isAISpeaking} />
        ) : (
          <AvatarErrorBoundary fallback={fallback}>
            <div className="w-full h-full min-h-[280px] md:min-h-[360px]">
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-white/10 animate-pulse flex items-center justify-center">
                      <span className="text-2xl">👤</span>
                    </div>
                  </div>
                }
              >
                <TransparentCanvas>
                  <AvatarScene scenarioId={scenarioId} isSpeaking={isAISpeaking} />
                </TransparentCanvas>
              </Suspense>
            </div>
          </AvatarErrorBoundary>
        )}
      </div>

      {/* Role label – bottom */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
        <span className="text-white text-sm font-medium drop-shadow-lg bg-black/40 px-3 py-1 rounded-full">
          {characterRole}
        </span>
      </div>
    </div>
  );
}
