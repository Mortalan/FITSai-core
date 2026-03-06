import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Star, Crown, Loader2, History } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const Leaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'hall'>('current');
  const [users, setUsers] = useState<any[]>([]);
  const [hall, setHall] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    setLoading(true);
    const endpoint = activeTab === 'current' ? 'leaderboard' : 'hall-of-fame';
    axios.get(`http://10.0.0.231:9000/api/v1/progression/${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (activeTab === 'current') setUsers(res.data);
      else setHall(res.data);
    }).finally(() => setLoading(false));
  }, [activeTab, token]);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-gray-500 font-medium uppercase text-[10px] tracking-[0.2em]">Competitive standing and monthly champions</p>
        </div>
        <div className="flex gap-2 p-1 bg-[var(--input-bg)] rounded-xl border border-[var(--border)]">
          <button onClick={() => setActiveTab('current')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'current' ? 'bg-[var(--accent)] text-white' : 'text-gray-500'}`}>Live Ranks</button>
          <button onClick={() => setActiveTab('hall')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'hall' ? 'bg-[var(--accent)] text-white' : 'text-gray-500'}`}>Hall of Fame</button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--accent)]" /></div>
      ) : activeTab === 'current' ? (
        <div className="grid gap-3">
          {users.map((u, i) => (
            <div key={u.id} className="p-5 bg-[var(--sidebar)] border border-[var(--border)] rounded-2xl flex items-center justify-between group hover:border-[var(--accent)] transition-all">
              <div className="flex items-center gap-5">
                <div className="w-10 text-center font-black text-xl text-gray-300 group-hover:text-[var(--accent)]">#{i + 1}</div>
                <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold text-xl">{u.name?.[0]}</div>
                <div>
                  <h4 className="font-bold">{u.name}</h4>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter">
                    {u.character_class} • Level {u.character_level}
                    {u.equipped_title ? ` • ${u.equipped_title}` : ''}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-[var(--foreground)]">{u.xp_total.toLocaleString()}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total XP</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hall.map((c, i) => (
            <div key={i} className="p-6 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border border-yellow-500/20 rounded-3xl relative overflow-hidden">
              <Crown className="absolute -right-2 -bottom-2 text-yellow-500/10" size={80} />
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-[0.2em] mb-1">{new Date(2026, c.month-1).toLocaleString('default', { month: 'long' })} {c.year}</p>
                  <h3 className="text-xl font-bold">{c.username}</h3>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-yellow-500/10 text-yellow-600 text-[10px] font-bold rounded uppercase border border-yellow-500/20">{c.class}</span>
                </div>
                <Trophy className="text-yellow-500" size={24} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
