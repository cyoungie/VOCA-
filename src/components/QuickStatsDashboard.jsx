import useStore from '../store/useStore';
import { SCENARIOS } from '../data/scenarios';

function formatTime(minutes) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  return `${hrs}h ${mins}m`;
}

function getScenarioCategory(scenarioId) {
  const categories = {
    cafe: 'Daily Life',
    restaurant: 'Daily Life',
    shopping: 'Daily Life',
    taxi: 'Daily Life',
    hotel: 'Travel',
    airport: 'Travel',
    interview: 'Professional',
    doctor: 'Professional',
    dating: 'Social',
  };
  return categories[scenarioId] || 'Other';
}

function groupScenariosByCategory(completed) {
  const grouped = {};
  completed.forEach((item) => {
    const cat = getScenarioCategory(item.scenarioId);
    grouped[cat] = (grouped[cat] || 0) + 1;
  });
  return grouped;
}

export default function QuickStatsDashboard({ onScenariosClick, onPhrasesClick }) {
  const stats = useStore((s) => s.stats);
  const profile = useStore((s) => s.profile);
  const vocabularyLearned = useStore((s) => s.vocabularyLearned);

  const totalHours = Math.floor(stats.totalPracticeTimeMinutes / 60);
  const totalMins = stats.totalPracticeTimeMinutes % 60;
  const weeklyDiff = stats.weeklyPracticeTimeMinutes - stats.lastWeekPracticeTimeMinutes;
  const weeklyDiffPercent = stats.lastWeekPracticeTimeMinutes > 0
    ? Math.round((weeklyDiff / stats.lastWeekPracticeTimeMinutes) * 100)
    : 0;

  const scenariosByCategory = groupScenariosByCategory(stats.scenariosCompleted);
  const totalScenarios = stats.scenariosCompleted.length;
  const phrasesCount = vocabularyLearned.length || stats.phrasesLearned || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {/* Card 1: Total Practice Time */}
      <div className="bg-voca-surface rounded-xl border border-white/10 p-5 hover:border-voca-primary/50 transition-colors cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-1">Total Practice Time</h3>
            <p className="text-2xl font-bold text-white">
              {totalHours > 0 ? `${totalHours}h ` : ''}{totalMins}m
            </p>
          </div>
          <span className="text-2xl">⏱️</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          {weeklyDiff >= 0 ? (
            <span className="text-green-400">↑</span>
          ) : (
            <span className="text-red-400">↓</span>
          )}
          <span className="text-slate-400">
            {Math.abs(weeklyDiff)} min vs last week
            {weeklyDiffPercent !== 0 && ` (${weeklyDiffPercent > 0 ? '+' : ''}${weeklyDiffPercent}%)`}
          </span>
        </div>
      </div>

      {/* Card 2: Scenarios Completed */}
      <div
        onClick={onScenariosClick}
        className="bg-voca-surface rounded-xl border border-white/10 p-5 hover:border-voca-primary/50 transition-colors cursor-pointer"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-1">Scenarios Completed</h3>
            <p className="text-2xl font-bold text-white">{totalScenarios}</p>
          </div>
          <span className="text-2xl">🎯</span>
        </div>
        <div className="space-y-1">
          {Object.entries(scenariosByCategory).slice(0, 3).map(([cat, count]) => (
            <div key={cat} className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{cat}</span>
              <span className="text-white font-medium">{count}</span>
            </div>
          ))}
          {Object.keys(scenariosByCategory).length === 0 && (
            <p className="text-xs text-slate-500">No scenarios completed yet</p>
          )}
        </div>
      </div>

      {/* Card 3: Phrases Learned */}
      <div
        onClick={onPhrasesClick}
        className="bg-voca-surface rounded-xl border border-white/10 p-5 hover:border-voca-primary/50 transition-colors cursor-pointer"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-1">Phrases Learned</h3>
            <p className="text-2xl font-bold text-white">{phrasesCount}</p>
          </div>
          <span className="text-2xl">📚</span>
        </div>
        <p className="text-xs text-slate-400">Click to view phrase book</p>
      </div>

      {/* Card 4: Current Streak */}
      <div className="bg-voca-surface rounded-xl border border-white/10 p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-1">Current Streak</h3>
            <p className="text-2xl font-bold text-white flex items-center gap-2">
              🔥 {profile.streak}
              <span className="text-sm font-normal text-slate-400">days</span>
            </p>
          </div>
        </div>
        {profile.bestStreak > profile.streak && (
          <p className="text-xs text-slate-400 mb-2">
            Best: {profile.bestStreak} days
          </p>
        )}
        <StreakCalendar practiceCalendar={stats.practiceCalendar} />
      </div>
    </div>
  );
}

/** Calendar heatmap showing practice days (last 7 weeks, GitHub-style) */
function StreakCalendar({ practiceCalendar }) {
  const today = new Date();
  const weeks = 7;
  const squares = [];

  // Generate squares for last 7 weeks (49 days)
  for (let i = 48; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateKey = d.toISOString().split('T')[0];
    const minutes = practiceCalendar[dateKey] || 0;
    const intensity = minutes > 0 ? Math.min(4, Math.floor(minutes / 15) + 1) : 0;
    squares.push({ dateKey, minutes, intensity, date: d });
  }

  return (
    <div className="mt-3">
      <div className="flex gap-0.5 overflow-x-auto pb-2">
        {Array.from({ length: weeks }).map((_, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-0.5">
            {squares.slice(weekIdx * 7, (weekIdx + 1) * 7).map((square, dayIdx) => {
              const bgIntensity = square.intensity === 0
                ? 'bg-slate-800'
                : square.intensity === 1
                  ? 'bg-green-900'
                  : square.intensity === 2
                    ? 'bg-green-700'
                    : square.intensity === 3
                      ? 'bg-green-500'
                      : 'bg-green-400';
              return (
                <div
                  key={square.dateKey}
                  className={`w-3 h-3 rounded ${bgIntensity} border border-slate-700 hover:scale-110 transition-transform cursor-help`}
                  title={`${square.date.toLocaleDateString()}: ${square.minutes}m`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
        <span>Less</span>
        <div className="flex gap-0.5">
          <div className="w-3 h-3 rounded bg-slate-800 border border-slate-700" />
          <div className="w-3 h-3 rounded bg-green-900 border border-slate-700" />
          <div className="w-3 h-3 rounded bg-green-700 border border-slate-700" />
          <div className="w-3 h-3 rounded bg-green-500 border border-slate-700" />
          <div className="w-3 h-3 rounded bg-green-400 border border-slate-700" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
