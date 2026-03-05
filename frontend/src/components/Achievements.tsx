import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, CheckCircle2, Lock, Sparkles, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = 'http://10.0.0.231:9000/api/v1';

interface Achievement {
  id: number;
  name: string;
  description: string;
  rarity: string;
  icon: string;
  unlocked: boolean;
  is_claimed: boolean;
}

export const Achievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = useAuthStore((state) => state.token);
  const updateUser = useAuthStore((state) => state.updateUser);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const resp = await axios.get(`${API_BASE_URL}/progression/achievements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAchievements(resp.data);
    } catch (err) {
      console.error('Failed to fetch achievements', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaim = async (id: number) => {
    try {
      const resp = await axios.post(`${API_BASE_URL}/progression/achievements/${id}/claim`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.data.xp_progress) {
        updateUser({ xp_total: resp.data.xp_progress.xp_total });
      }
      fetchAchievements();
    } catch (err) {
      console.error('Failed to claim achievement', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
        <p className="text-gray-500 font-medium">Unlock badges and earn XP by mastering the Momo ecosystem.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((ach) => (
          <div 
            key={ach.id} 
            className={`p-5 rounded-2xl border transition-all relative overflow-hidden ${
              ach.unlocked 
                ? 'bg-[var(--sidebar)] border-[var(--accent)]/30 shadow-md' 
                : 'bg-gray-50 dark:bg-black/10 border-[var(--border)] opacity-60'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${ach.unlocked ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'bg-gray-200 dark:bg-gray-800 text-gray-400'}`}>
                <Award size={24} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm">{ach.name}</h3>
                  {ach.unlocked && !ach.is_claimed && (
                    <span className="flex h-2 w-2 rounded-full bg-yellow-500 animate-ping" />
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{ach.description}</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                ach.rarity === 'LEGENDARY' ? 'bg-purple-500/10 text-purple-500' :
                ach.rarity === 'RARE' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-500'
              }`}>
                {ach.rarity}
              </span>

              {ach.is_claimed ? (
                <div className="flex items-center gap-1 text-green-500 font-bold text-[10px] uppercase tracking-wider">
                  <CheckCircle2 size={12} />
                  <span>Claimed</span>
                </div>
              ) : ach.unlocked ? (
                <button 
                  onClick={() => handleClaim(ach.id)}
                  className="bg-[var(--accent)] text-[var(--accent-foreground)] text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg hover:opacity-90 transition-all shadow-sm flex items-center gap-1"
                >
                  <Sparkles size={10} />
                  Claim Reward
                </button>
              ) : (
                <div className="flex items-center gap-1 text-gray-400 font-bold text-[10px] uppercase tracking-wider">
                  <Lock size={12} />
                  <span>Locked</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
