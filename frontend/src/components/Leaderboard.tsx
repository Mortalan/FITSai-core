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
    <div className="p-8 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--sidebar)] p-10 border border-[var(--border)] rounded-[40px] shadow-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Elite Leaderboard</h1>
          <p className="text-gray-500 font-medium text-sm">Competitive standing and monthly technical champions.</p>
        </div>
        <div className="flex gap-2 p-1.5 bg-[var(--input-bg)] rounded-[20px] border border-[var(--border)] shadow-inner">
          <button onClick={() => setActiveTab('current')} className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'current' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-gray-400 hover:text-[var(--foreground)]'}`}>Live Ranks</button>
          <button onClick={() => setActiveTab('hall')} className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'hall' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-gray-400 hover:text-[var(--foreground)]'}`}>Hall of Fame</button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--accent)]" size={32} /></div>
      ) : activeTab === 'current' ? (
        <div className="grid gap-4">
          {users.map((u, i) => (
            <div key={u.id} className="p-6 bg-[var(--sidebar)] border border-[var(--border)] rounded-[32px] flex items-center justify-between group hover:border-[var(--accent)] transition-all shadow-sm">
              <div className="flex items-center gap-6">
                <div className="w-12 text-center font-black text-2xl text-gray-200 group-hover:text-[var(--accent)] transition-colors">#{i + 1}</div>
                <div className="w-14 h-14 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold text-2xl shadow-inner">{u.name?.[0]}</div>
                <div>
                  <h4 className="font-bold text-lg">{u.name}</h4>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                    {u.character_class} • Level {u.character_level}
                    {u.equipped_title ? <span className="text-[var(--accent)]"> • {u.equipped_title}</span> : ''}
                  </p>
                </div>
              </div>
              <div className="text-right pr-4">
                <div className="text-2xl font-black text-[var(--foreground)] tracking-tighter">{u.xp_total.toLocaleString()}</div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Accumulated XP</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hall.map((c, i) => (
            <div key={i} className="p-8 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border border-yellow-500/20 rounded-[40px] relative overflow-hidden shadow-sm hover:shadow-xl transition-all group">
              <Crown className="absolute -right-4 -bottom-4 text-yellow-500/5 group-hover:text-yellow-500/10 transition-colors" size={120} />
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-yellow-600 uppercase tracking-[0.3em] mb-2">{new Date(2026, c.month-1).toLocaleString('default', { month: 'long' })} {c.year}</p>
                  <h3 className="text-2xl font-bold tracking-tight">{c.username}</h3>
                  <div className="inline-block mt-3 px-3 py-1 bg-yellow-500/10 text-yellow-600 text-[10px] font-black rounded-lg uppercase border border-yellow-500/20">{c.class}</div>
                </div>
                <Trophy className="text-yellow-500 drop-shadow-md" size={28} />
              </div>
            </div>
          ))}
          {hall.length === 0 && <div className="col-span-full text-center py-20 bg-[var(--input-bg)]/30 rounded-[40px] border border-[var(--border)] border-dashed text-gray-400 font-bold uppercase text-xs tracking-[0.2em]">The Hall of Fame is waiting for its first legend.</div>}
        </div>
      )}
    </div>
  );
};
