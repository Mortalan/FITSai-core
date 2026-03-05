import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Medal, Loader2, Target, Zap } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = 'http://10.0.0.231:9000/api/v1';

interface LeaderboardEntry {
  name: string;
  xp_total: number;
  level: number;
  class: string;
}

export const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const resp = await axios.get(`${API_BASE_URL}/progression/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(resp.data);
    } catch (err) {
      console.error('Failed to fetch leaderboard', err);
    } finally {
      setIsLoading(false);
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
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-3">
        <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-full w-fit mx-auto border border-yellow-500/20">
          <Trophy size={32} />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Hall of Fame</h1>
        <p className="text-gray-500 font-medium">Behold the legends of FITSai. Where do you stand?</p>
      </div>

      <div className="bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 p-4 bg-gray-50 dark:bg-black/20 border-b border-[var(--border)] text-[10px] font-bold uppercase tracking-widest text-gray-400">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-5">Champion</div>
          <div className="col-span-2 text-center">Level</div>
          <div className="col-span-2 text-center">Class</div>
          <div className="col-span-2 text-right pr-4">Total XP</div>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {entries.map((user, i) => (
            <div key={i} className={`grid grid-cols-12 p-5 items-center transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${i === 0 ? 'bg-yellow-500/5' : ''}`}>
              <div className="col-span-1 flex justify-center">
                {i === 0 ? <Medal className="text-yellow-500" size={20} /> :
                 i === 1 ? <Medal className="text-gray-400" size={20} /> :
                 i === 2 ? <Medal className="text-amber-600" size={20} /> :
                 <span className="text-sm font-bold text-gray-400">#{i + 1}</span>}
              </div>
              
              <div className="col-span-5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] text-xs font-bold border border-[var(--accent)]/20">
                  {user.name[0]}
                </div>
                <span className="font-bold text-sm">{user.name}</span>
              </div>

              <div className="col-span-2 text-center">
                <span className="text-xs font-bold px-2 py-1 bg-gray-100 dark:bg-white/10 rounded-lg">Lvl {user.level}</span>
              </div>

              <div className="col-span-2 text-center">
                <span className="text-[10px] font-bold uppercase tracking-tighter text-[var(--accent)]">{user.class}</span>
              </div>

              <div className="col-span-2 text-right pr-4">
                <div className="flex items-center justify-end gap-1.5 font-mono text-sm font-bold">
                  <Zap size={14} className="text-yellow-500" />
                  {user.xp_total.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
