import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Edit2, Save, X, Loader2, Award, CheckCircle2, ChevronDown, Trophy, Users } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [awardMenuId, setAwardMenuId] = useState<number | null>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => { 
    fetchUsers();
    axios.get('http://10.0.0.231:9000/api/v1/admin/achievements', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setAchievements(res.data)).catch(() => {});
  }, [token]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://10.0.0.231:9000/api/v1/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {}
    setLoading(false);
  };

  const handleAward = async (userId: number, achId: number) => {
    try {
      await axios.post(`http://10.0.0.231:9000/api/v1/admin/users/${userId}/achievements/${achId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) { alert('Failed'); }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[var(--accent)]" size={32} /></div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="bg-[var(--sidebar)] border border-[var(--border)] rounded-[40px] p-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl"><Users size={28} /></div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">User Directory</h2>
              <p className="text-gray-500 font-medium text-sm">Manage technician credentials and RPG progress.</p>
            </div>
          </div>
          <div className="px-6 py-2.5 bg-purple-500/10 text-purple-600 rounded-xl border border-purple-500/20">
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{users.length} Active Accounts</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {users.map(u => (
          <div key={u.id} className="p-8 bg-[var(--sidebar)] border border-[var(--border)] rounded-[40px] space-y-8 shadow-sm group hover:border-[var(--accent)] transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-14 rounded-[20px] bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold text-2xl shadow-inner">{u.name?.[0]}</div>
                <div>
                  <h4 className="font-bold text-xl flex items-center gap-3">{u.name} {u.is_superuser && <ShieldCheck size={18} className="text-red-500" />}</h4>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">{u.email} • LVL {u.character_level} {u.character_class}</p>
                </div>
              </div>
              <button 
                onClick={() => setAwardMenuId(awardMenuId === u.id ? null : u.id)} 
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${awardMenuId === u.id ? 'bg-gray-800 text-white shadow-gray-500/20' : 'bg-yellow-500 text-white shadow-yellow-500/20 hover:scale-105'}`}
              >
                <Trophy size={16} /> {awardMenuId === u.id ? 'Close Panel' : 'Award Prestige'}
              </button>
            </div>

            {awardMenuId === u.id && (
              <div className="p-10 bg-[var(--input-bg)] border border-[var(--border)] rounded-[32px] animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 mb-8 border-b border-[var(--border)] pb-6">
                  <div className="p-2 bg-yellow-500/10 text-yellow-600 rounded-lg"><Award size={18} /></div>
                  <h5 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Grant Milestone Achievement</h5>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map(a => {
                    const isOwned = u.achievement_ids?.includes(a.id);
                    return (
                      <button 
                        key={a.id} 
                        disabled={isOwned}
                        onClick={() => handleAward(u.id, a.id)} 
                        className={`text-left p-6 rounded-2xl transition-all border shadow-sm ${
                          isOwned 
                            ? 'bg-green-500/5 border-green-500/20 opacity-60 cursor-not-allowed' 
                            : 'bg-white dark:bg-black/20 border-transparent hover:border-[var(--accent)] hover:scale-[1.02]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className={`text-sm font-bold ${isOwned ? 'text-green-600' : ''}`}>{a.name}</p>
                          {isOwned && <CheckCircle2 size={14} className="text-green-500" />}
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed">{a.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
