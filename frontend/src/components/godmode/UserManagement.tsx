import React, { useState, useEffect } from 'react';
import { User, ShieldAlert, ShieldCheck, Edit2, Save, X, Loader2, Award, CheckCircle2, ChevronDown, Trophy } from 'lucide-react';
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

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[var(--accent)]" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-black text-2xl tracking-tighter">User Directory</h3>
        <p className="text-xs text-gray-500 font-bold uppercase">{users.length} Active Technicians</p>
      </div>

      <div className="grid gap-4">
        {users.map(u => (
          <div key={u.id} className="p-6 bg-[var(--sidebar)] border border-[var(--border)] rounded-[32px] space-y-6 shadow-sm group hover:border-[var(--accent)] transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-black text-2xl">{u.name?.[0]}</div>
                <div>
                  <h4 className="font-black text-lg flex items-center gap-2">{u.name} {u.is_superuser && <ShieldCheck size={16} className="text-red-500" />}</h4>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{u.email} • Level {u.character_level} {u.character_class}</p>
                </div>
              </div>
              <button 
                onClick={() => setAwardMenuId(awardMenuId === u.id ? null : u.id)} 
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${awardMenuId === u.id ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-yellow-500 hover:text-white'}`}
              >
                <Trophy size={14} /> {awardMenuId === u.id ? 'Close' : 'Award Achievement'}
              </button>
            </div>

            {awardMenuId === u.id && (
              <div className="p-8 bg-[var(--input-bg)] border border-[var(--border)] rounded-2xl animate-in zoom-in-95 duration-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {achievements.map(a => {
                  const isOwned = u.achievement_ids?.includes(a.id);
                  return (
                    <button 
                      key={a.id} 
                      disabled={isOwned}
                      onClick={() => handleAward(u.id, a.id)} 
                      className={`text-left p-4 rounded-xl transition-all border ${
                        isOwned 
                          ? 'bg-green-500/5 border-green-500/20 opacity-60 cursor-not-allowed' 
                          : 'bg-white dark:bg-black/20 border-transparent hover:border-[var(--accent)] shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-xs font-black ${isOwned ? 'text-green-600' : ''}`}>{a.name}</p>
                        {isOwned && <CheckCircle2 size={12} className="text-green-500" />}
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium leading-tight">{a.description}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
