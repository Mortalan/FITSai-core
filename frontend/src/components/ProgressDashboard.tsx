import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Zap, Shield, Brain, Star, Flame, Trophy, Sparkles, Swords, BookOpen, Heart } from 'lucide-react';

export const ProgressDashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  if (!user) return null;

  const charLevel = user.character_level ?? 1;
  const xpTotal = user.xp_total ?? 0;
  const streak = user.login_streak ?? 0;

  const currentLevelXP = Math.pow(charLevel - 1, 2) * 100;
  const nextLevelXP = Math.pow(charLevel, 2) * 100;
  const progress = charLevel === 50 ? 100 : ((xpTotal - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  const stats = user.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Level & Rank Card */}
        <div className="lg:col-span-1 p-8 bg-gradient-to-br from-[var(--sidebar)] to-[var(--input-bg)] rounded-[32px] border border-[var(--border)] shadow-sm relative overflow-hidden">
          <Trophy className="absolute -right-4 -bottom-4 text-[var(--accent)] opacity-5" size={160} />
          <div className="relative z-10 space-y-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Rank Assignment</p>
              <h3 className="text-4xl font-black text-[var(--accent)] tracking-tighter">{user.character_class ?? 'Unknown'}</h3>
              <p className="text-sm font-bold text-gray-500 mt-1">Level {charLevel} Technician</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase">
                <span className="text-gray-400">Progression</span>
                <span className="text-[var(--accent)]">{Math.floor(progress)}% to Level {charLevel + 1}</span>
              </div>
              <div className="h-3 w-full bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden border border-[var(--border)]">
                <div className="h-full bg-[var(--accent)] transition-all duration-1000 relative" style={{ width: `${progress}%` }}>
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 tracking-widest">{xpTotal.toLocaleString()} TOTAL XP</span>
                {streak > 1 && (
                  <div className="flex items-center gap-1 bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-[10px] font-black border border-orange-500/20">
                    <Flame size={12} fill="currentColor" /> {streak} DAY STREAK
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* D&D Stat Block */}
        <div className="lg:col-span-2 p-8 bg-[var(--sidebar)] border border-[var(--border)] rounded-[32px] shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="text-purple-500" size={20} />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Technician Attributes</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { label: 'Intelligence (INT)', val: stats.int ?? 10, icon: Brain, color: 'text-blue-500' },
              { label: 'Strength (STR)', val: stats.str ?? 10, icon: Swords, color: 'text-red-500' },
              { label: 'Wisdom (WIS)', val: stats.wis ?? 10, icon: BookOpen, color: 'text-emerald-500' },
              { label: 'Dexterity (DEX)', val: stats.dex ?? 10, icon: Zap, color: 'text-yellow-500' },
              { label: 'Constitution (CON)', val: stats.con ?? 10, icon: Shield, color: 'text-cyan-500' },
              { label: 'Charisma (CHA)', val: stats.cha ?? 10, icon: Heart, color: 'text-pink-500' },
            ].map(s => (
              <div key={s.label} className="p-4 bg-[var(--input-bg)]/50 rounded-2xl border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <s.icon size={16} className={s.color} />
                  <span className="text-[9px] font-black uppercase text-gray-400">{s.label}</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-black">{s.val}</span>
                  <div className="flex-1 h-1 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden mb-2">
                    <div className={`h-full ${s.color.replace('text', 'bg')} opacity-60`} style={{ width: `${(s.val/100)*100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
