import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, ShieldCheck, Edit2, Save, X, Loader2, Users, UserPlus, Plus, Award } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [awardMenuId, setAwardMenuId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', is_superuser: false });
  const token = useAuthStore((state) => state.token);

  useEffect(() => { 
    fetchUsers();
    axios.get('http://10.0.0.231:9000/api/v1/admin/achievements', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setAchievements(res.data))
      .catch(() => {});
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
      alert('Achievement Awarded');
      setAwardMenuId(null);
    } catch (err) { alert('Failed'); }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[var(--accent)]" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-xl">User Directory</h3>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 bg-[var(--accent)] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
          <Plus size={16} /> New User
        </button>
      </div>

      {showCreate && (
        <form onSubmit={async (e) => {
          e.preventDefault();
          await axios.post('http://10.0.0.231:9000/api/v1/admin/users', createForm, { headers: { Authorization: `Bearer ${token}` } });
          setShowCreate(false); fetchUsers();
        }} className="p-6 bg-[var(--input-bg)] border border-[var(--border)] rounded-2xl space-y-4 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Name" className="bg-white dark:bg-black/20 border border-[var(--border)] p-2 rounded-xl text-sm" value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} required />
            <input placeholder="Email" type="email" className="bg-white dark:bg-black/20 border border-[var(--border)] p-2 rounded-xl text-sm" value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} required />
            <input placeholder="Password" type="password" className="bg-white dark:bg-black/20 border border-[var(--border)] p-2 rounded-xl text-sm" value={createForm.password} onChange={e => setCreateForm({...createForm, password: e.target.value})} required />
            <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={createForm.is_superuser} onChange={e => setCreateForm({...createForm, is_superuser: e.target.checked})} /> Admin Permissions</label>
          </div>
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-bold">Cancel</button><button type="submit" className="bg-[var(--accent)] text-white px-4 py-2 rounded-xl text-sm font-bold">Create Account</button></div>
        </form>
      )}

      <div className="grid gap-4">
        {users.map(u => (
          <div key={u.id} className="p-6 bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl space-y-4">
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold text-xl">{u.name?.[0]}</div>
                <div><h4 className="font-bold flex items-center gap-2">{u.name} {u.is_superuser && <ShieldCheck size={14} className="text-red-500" />}</h4><p className="text-xs text-gray-500">{u.email} • Level {u.character_level} {u.character_class}</p></div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setAwardMenuId(awardMenuId === u.id ? null : u.id)} className="p-2 text-gray-400 hover:text-yellow-500 transition-all"><Award size={18} /></button>
                <button onClick={() => { setEditingId(u.id); setEditForm({ name: u.name, email: u.email, is_superuser: u.is_superuser }); }} className="p-2 text-gray-400 hover:text-[var(--accent)] transition-all"><Edit2 size={18} /></button>
              </div>
            </div>

            {awardMenuId === u.id && (
              <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl animate-in zoom-in-95 duration-200">
                <p className="text-[10px] font-black uppercase text-yellow-600 mb-2 tracking-widest">Select Achievement to Grant</p>
                <div className="grid grid-cols-2 gap-2">
                  {achievements.map(a => (
                    <button key={a.id} onClick={() => handleAward(u.id, a.id)} className="text-left p-2 hover:bg-yellow-500/10 rounded-lg transition-all border border-transparent hover:border-yellow-500/20">
                      <p className="text-xs font-bold">{a.name}</p>
                      <p className="text-[9px] text-gray-400">{a.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
