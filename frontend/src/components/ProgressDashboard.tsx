import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Zap, Shield, Brain, Star, Flame, Trophy, Sparkles } from 'lucide-react';

export const ProgressDashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  if (!user) return null;

  const currentLevelXP = Math.pow(user.character_level - 1, 2) * 100;
  const nextLevelXP = Math.pow(user.character_level, 2) * 100;
  const progress = user.character_level === 50 ? 100 : ((user.xp_total - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Level Card */}
        <div className="p-6 bg-[var(--input-bg)]/50 rounded-3xl border border-[var(--border)] shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Character Rank</span>
              <h3 className="text-2xl font-bold text-[var(--accent)]">{user.character_class}</h3>
              <p className="text-xs text-gray-500 font-medium mt-1">Level {user.character_level} of 50</p>
            </div>
            <Trophy className="text-yellow-500" size={24} />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
              <span className="text-gray-400">Next Milestone</span>
              <span className="text-[var(--accent)]">{Math.floor(progress)}% Complete</span>
            </div>
            <div className="h-2.5 w-full bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden border border-[var(--border)]">
              <div className="h-full bg-[var(--accent)] transition-all duration-1000 relative" style={{ width: `${progress}%` }}>
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
            <p className="text-[9px] text-gray-400 text-right uppercase font-bold tracking-widest">{user.xp_total} / {nextLevelXP} XP</p>
          </div>
        </div>

        {/* Stats Card */}
        <div className="p-6 bg-[var(--input-bg)]/50 rounded-3xl border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="text-purple-500" size={18} />
              <h3 className="text-xs font-bold uppercase tracking-widest">Core Statistics</h3>
            </div>
            {user.login_streak > 1 && (
              <div className="flex items-center gap-1 bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-[10px] font-bold border border-orange-500/20">
                <Flame size={12} fill="currentColor" /> {user.login_streak} Day Streak
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-2 bg-white dark:bg-black/20 rounded-xl border border-[var(--border)]">
              <Brain size={16} className="text-blue-400" />
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-gray-400 uppercase">Intellect</span>
                <span className="text-sm font-bold">{user.stats?.intellect || 10}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-white dark:bg-black/20 rounded-xl border border-[var(--border)]">
              <Shield size={16} className="text-green-400" />
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-gray-400 uppercase">Strength</span>
                <span className="text-sm font-bold">{user.stats?.strength || 10}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-white dark:bg-black/20 rounded-xl border border-[var(--border)]">
              <Star size={16} className="text-yellow-400" />
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-gray-400 uppercase">Charisma</span>
                <span className="text-sm font-bold">{user.stats?.charisma || 10}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-white dark:bg-black/20 rounded-xl border border-[var(--border)]">
              <Zap size={16} className="text-purple-400" />
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-gray-400 uppercase">Agility</span>
                <span className="text-sm font-bold">{user.stats?.agility || 10}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
