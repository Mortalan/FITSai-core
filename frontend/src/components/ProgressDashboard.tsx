import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Trophy } from 'lucide-react';

export const ProgressDashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  // Level = sqrt(XP / 100) + 1
  const level = Math.floor(Math.sqrt(user.xp_total / 100)) + 1;
  const currentLevelXp = Math.pow(level - 1, 2) * 100;
  const nextLevelXp = Math.pow(level, 2) * 100;
  const progressInLevel = user.xp_total - currentLevelXp;
  const xpNeededForLevel = nextLevelXp - currentLevelXp;
  const progressPercent = Math.min(Math.max((progressInLevel / xpNeededForLevel) * 100, 0), 100);

  return (
    <div className="p-4 bg-[var(--input-bg)] rounded-2xl border border-[var(--border)] shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-yellow-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Level {level}</span>
        </div>
        <span className="text-[10px] font-bold text-[var(--accent)]">{user.character_class}</span>
      </div>

      <div className="space-y-1.5">
        <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--accent)] transition-all duration-500 ease-out" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-500 font-medium">
          <span>{user.xp_total} XP</span>
          <span>{nextLevelXp} XP</span>
        </div>
      </div>
    </div>
  );
};
