import { getScenario } from '../data/scenarios';

/**
 * Main video area: AI character in scenario background.
 * Placeholder avatar + background image; character appears "in" the environment.
 */
export default function AICharacter({ scenarioId }) {
  const scenario = getScenario(scenarioId);
  const backgroundImage = scenario?.backgroundImage ?? '';
  const characterRole = scenario?.characterRole ?? 'Assistant';

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

      {/* Character: centered, "in" the scene */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          {/* Placeholder avatar – replace with real asset or animated character */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center shadow-xl animate-pulse">
            <span className="text-4xl md:text-5xl" aria-hidden>
              👤
            </span>
          </div>
          <span className="text-white text-sm md:text-base font-medium drop-shadow-lg bg-black/30 px-2 py-0.5 rounded">
            {characterRole}
          </span>
        </div>
      </div>
    </div>
  );
}
