import { useState } from 'react';
import useStore from '../store/useStore';
import { SCENARIOS } from '../data/scenarios';
import ProfileHeader from './ProfileHeader';
import QuickStatsDashboard from './QuickStatsDashboard';

export default function ProfilePage() {
  const goHome = useStore((s) => s.goHome);
  const profile = useStore((s) => s.profile);
  const setUsername = useStore((s) => s.setUsername);
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState(profile.username);
  const [showScenarios, setShowScenarios] = useState(false);
  const [showPhrases, setShowPhrases] = useState(false);

  const handleSave = () => {
    setUsername(editUsername);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditUsername(profile.username);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-voca-dark text-white">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        {/* Back button */}
        <button
          type="button"
          onClick={goHome}
          className="mb-6 text-slate-400 hover:text-white text-sm font-medium flex items-center gap-2"
        >
          ← Back to Home
        </button>

        {/* Profile Header */}
        <ProfileHeader onEdit={() => setIsEditing(true)} />

        {/* Quick Stats Dashboard */}
        <QuickStatsDashboard
          onScenariosClick={() => setShowScenarios(true)}
          onPhrasesClick={() => setShowPhrases(true)}
        />

        {/* Edit Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-voca-surface rounded-xl border border-white/10 p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
              <label className="block mb-2 text-sm font-medium">
                Username
              </label>
              <input
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white mb-4 focus:outline-none focus:ring-2 focus:ring-voca-primary"
                placeholder="Enter your name"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 bg-voca-primary hover:bg-indigo-600 text-white rounded-lg text-sm font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scenarios Modal */}
        {showScenarios && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-voca-surface rounded-xl border border-white/10 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Completed Scenarios</h2>
                <button
                  type="button"
                  onClick={() => setShowScenarios(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <ScenariosList />
            </div>
          </div>
        )}

        {/* Phrases Modal */}
        {showPhrases && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-voca-surface rounded-xl border border-white/10 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">My Phrase Book</h2>
                <button
                  type="button"
                  onClick={() => setShowPhrases(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <PhrasesList />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ScenariosList() {
  const stats = useStore((s) => s.stats);
  const scenarios = stats.scenariosCompleted || [];

  if (scenarios.length === 0) {
    return <p className="text-slate-400">No scenarios completed yet. Start practicing!</p>;
  }

  return (
    <div className="space-y-2">
      {scenarios.slice().reverse().map((item, i) => {
        const scenario = SCENARIOS[item.scenarioId];
        const date = new Date(item.completedAt);
        return (
          <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <div>
              <p className="font-medium">{scenario?.title || item.scenarioId}</p>
              <p className="text-xs text-slate-400">
                {date.toLocaleDateString()} • {Math.round(item.durationMinutes)} min
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PhrasesList() {
  const vocabularyLearned = useStore((s) => s.vocabularyLearned);

  if (vocabularyLearned.length === 0) {
    return <p className="text-slate-400">No phrases learned yet. Keep practicing!</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {vocabularyLearned.map((phrase, i) => (
        <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
          <p className="text-sm">{phrase}</p>
        </div>
      ))}
    </div>
  );
}
