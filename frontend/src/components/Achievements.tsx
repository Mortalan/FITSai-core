import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, CheckCircle2, Lock, Sparkles, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = 'http://10.0.0.231:9000/api/v1';

export const Achievements: React.FC = () => {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = useAuthStore((state) => state.token);
  const updateUser = useAuthStore((state) => state.updateUser);

  useEffect(() => { fetchAchievements(); }, [token]);

  const fetchAchievements = async () => {
    try {
      const resp = await axios.get(`${API_BASE_URL}/progression/achievements`, { headers: { Authorization: `Bearer ${token}` } });
      setAchievements(resp.data);
    } catch (err) {} finally { setIsLoading(false); }
  };

  const handleClaim = async (id: number) => {
    try {
      const resp = await axios.post(`${API_BASE_URL}/progression/achievements/${id}/claim`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (resp.data.xp_progress) updateUser({ xp_total: resp.data.xp_progress.xp_total });
      fetchAchievements();
    } catch (err) {}
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--accent)]" size={32} /></div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="space-y-4">
        <h1 className="text-4xl font-black tracking-tighter">Technical Achievements</h1>
        <p className="text-gray-500 font-medium">Collect prestige badges and earn XP by mastering the system.</p>
        <div className="pt-4">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
            <span>Prestige Progress</span>
            <span className="text-[var(--accent)]">{achievements.filter(a => a.unlocked).length} / {achievements.length} UNLOCKED</span>
          </div>
          <div className="h-3 w-full bg-[var(--input-bg)] rounded-full overflow-hidden border border-[var(--border)]">
            <div className="h-full bg-[var(--accent)] transition-all duration-1000 relative shadow-[0_0_15px_var(--accent)]" style={{ width: `${(achievements.filter(a => a.unlocked).length / (achievements.length || 1)) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((ach) => {
          // EXTREMELY EXPLICIT LOGIC
          const showClaimed = ach.unlocked && ach.is_claimed;
          const showClaimButton = ach.unlocked && !ach.is_claimed;
          const showLocked = !ach.unlocked;

          return (
            <div key={ach.id} className={`p-6 rounded-[32px] border transition-all relative overflow-hidden ${ach.unlocked ? 'bg-[var(--sidebar)] border-[var(--accent)]/30 shadow-md' : 'bg-gray-50 dark:bg-black/10 border-[var(--border)] opacity-60'}`}>
              <div className="flex items-start gap-5">
                <div className={`p-4 rounded-2xl shadow-sm ${ach.unlocked ? 'bg-[var(--accent)] text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-400'}`}><Award size={28} /></div>
                <div className="space-y-1">
                  <h3 className="font-black text-lg tracking-tight">{ach.name}</h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2">{ach.description}</p>
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${ach.rarity === 'LEGENDARY' ? 'bg-yellow-500/10 text-yellow-600' : ach.rarity === 'RARE' ? 'bg-blue-500/10 text-blue-600' : 'bg-gray-500/10 text-gray-500'}`}>{ach.rarity}</span>
                {showClaimed && <div className="flex items-center gap-1.5 text-green-500 font-black text-[10px] uppercase tracking-widest"><CheckCircle2 size={14} /> Claimed</div>}
                {showClaimButton && <button onClick={() => handleClaim(ach.id)} className="bg-[var(--accent)] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl hover:scale-105 transition-all shadow-lg shadow-[var(--accent)]/30 flex items-center gap-2"><Sparkles size={12} /> Claim</button>}
                {showLocked && <div className="flex items-center gap-1.5 text-gray-400 font-black text-[10px] uppercase tracking-widest"><Lock size={14} /> Locked</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
