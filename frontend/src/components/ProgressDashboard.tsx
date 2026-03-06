import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Zap, Shield, Brain, Star, Flame } from 'lucide-react';

export const ProgressDashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  if (!user) return null;

  const currentLevelXP = Math.pow(user.character_level - 1, 2) * 100;
  const nextLevelXP = Math.pow(user.character_level, 2) * 100;
  const progress = user.character_level === 50 ? 100 : ((user.xp_total - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return (
    <div className="space-y-4 p-4 bg-[var(--input-bg)]/50 rounded-2xl border border-[var(--border)]">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Level {user.character_level}</span>
          <span className="text-sm font-bold text-[var(--accent)]">{user.character_class}</span>
        </div>
        {user.login_streak > 1 && (
          <div className="flex items-center gap-1 bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full text-[10px] font-bold">
            <Flame size={10} /> {user.login_streak} Day Streak
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
          <span className="text-gray-400">XP Progress</span>
          <span className="text-[var(--accent)]">{Math.floor(progress)}%</span>
        </div>
        <div className="h-1.5 w-full bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-[var(--accent)] transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
          <Brain size={12} className="text-blue-400" /> INT: {user.stats?.intellect || 10}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
          <Shield size={12} className="text-green-400" /> STR: {user.stats?.strength || 10}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
          <Star size={12} className="text-yellow-400" /> CHA: {user.stats?.charisma || 10}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
          <Zap size={12} className="text-purple-400" /> AGI: {user.stats?.agility || 10}
        </div>
      </div>
    </div>
  );
};
