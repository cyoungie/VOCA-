import { useRef } from 'react';
import useStore from '../store/useStore';

const LEVELS = {
  Beginner: { minXP: 0, color: 'text-blue-400' },
  Intermediate: { minXP: 500, color: 'text-green-400' },
  Advanced: { minXP: 1500, color: 'text-purple-400' },
  Fluent: { minXP: 3000, color: 'text-yellow-400' },
};

function getLevelFromXP(xp) {
  if (xp >= 3000) return 'Fluent';
  if (xp >= 1500) return 'Advanced';
  if (xp >= 500) return 'Intermediate';
  return 'Beginner';
}

function getXPForNextLevel(xp) {
  const level = getLevelFromXP(xp);
  const nextLevel = level === 'Fluent' ? null : Object.keys(LEVELS).find((l) => LEVELS[l].minXP > xp);
  if (!nextLevel) return { current: xp, needed: 0, progress: 100 };
  const needed = LEVELS[nextLevel].minXP;
  const current = xp - LEVELS[level].minXP;
  const total = needed - LEVELS[level].minXP;
  return { current, needed: total, progress: Math.min(100, (current / total) * 100) };
}

export default function ProfileHeader({ onEdit }) {
  const profile = useStore((s) => s.profile);
  const userProgress = useStore((s) => s.userProgress);
  const fileInputRef = useRef(null);

  const totalXP = userProgress.xp || 0;
  const level = getLevelFromXP(totalXP);
  const levelInfo = LEVELS[level];
  const xpProgress = getXPForNextLevel(totalXP);
  const memberDate = new Date(profile.memberSince);
  const memberSince = memberDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      useStore.getState().setAvatar(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-voca-surface rounded-xl border border-white/10 p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Avatar */}
        <div className="relative">
          <button
            type="button"
            onClick={handleAvatarClick}
            className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gradient-to-br from-voca-primary to-purple-600 flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer group"
          >
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl md:text-5xl">👤</span>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="text-white text-xs opacity-0 group-hover:opacity-100">📷</span>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
            aria-label="Upload avatar"
          />
        </div>

        {/* Profile Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 truncate">
                {profile.username}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`text-sm font-semibold ${levelInfo.color}`}>
                  {level}
                </span>
                <span className="text-slate-400 text-sm">
                  Level {userProgress.level || 1}
                </span>
                {profile.streak > 0 && (
                  <span className="flex items-center gap-1 text-sm font-medium text-orange-400">
                    🔥 {profile.streak} day{profile.streak !== 1 ? 's' : ''} streak
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onEdit}
              className="px-4 py-2 bg-voca-primary hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
            >
              Edit Profile
            </button>
          </div>

          {/* XP Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>XP Progress</span>
              <span>
                {xpProgress.current} / {xpProgress.needed} XP
              </span>
            </div>
            <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-voca-primary to-purple-600 rounded-full transition-all duration-300"
                style={{ width: `${xpProgress.progress}%` }}
              />
            </div>
          </div>

          {/* Member Since */}
          <p className="text-xs text-slate-500">
            Member since {memberSince}
          </p>
        </div>
      </div>
    </div>
  );
}
