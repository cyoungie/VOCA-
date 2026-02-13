import { getScenario } from '../data/scenarios';
import useStore from '../store/useStore';

/**
 * Scenario progress: current goal label + progress indicator.
 */
export default function ProgressBar() {
  const currentScene = useStore((s) => s.currentScene);
  const currentGoalIndex = useStore((s) => s.currentGoalIndex);

  const scenario = getScenario(currentScene);
  const goals = scenario?.goals ?? [];
  const total = goals.length;
  const currentGoal = goals[currentGoalIndex];
  const progress = total > 0 ? ((currentGoalIndex + 1) / total) * 100 : 0;

  return (
    <div className="w-full px-4 py-3 bg-voca-surface/90 rounded-xl border border-white/10">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-sm font-medium text-slate-300 truncate">
          {currentGoal
            ? `Goal ${currentGoalIndex + 1}/${total}: ${currentGoal}`
            : total === 0
              ? 'No goals set'
              : 'All goals complete!'}
        </span>
      </div>
      <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-voca-primary rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
    </div>
  );
}
