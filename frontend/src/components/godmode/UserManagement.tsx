import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, ShieldCheck, Edit2, Save, X, Loader2, Users, UserPlus, Plus } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', is_superuser: false });
  const token = useAuthStore((state) => state.token);

  useEffect(() => { fetchUsers(); }, [token]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://10.0.0.231:9000/api/v1/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {}
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://10.0.0.231:9000/api/v1/admin/users', createForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowCreate(false);
      setCreateForm({ name: '', email: '', password: '', is_superuser: false });
      fetchUsers();
    } catch (err) { alert('Create failed'); }
  };

  const handleUpdate = async (id: number) => {
    try {
      await axios.put(`http://10.0.0.231:9000/api/v1/admin/users/${id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingId(null);
      fetchUsers();
    } catch (err) { alert('Update failed'); }
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
        <form onSubmit={handleCreate} className="p-6 bg-[var(--input-bg)] border border-[var(--border)] rounded-2xl space-y-4 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Name" className="bg-white dark:bg-black/20 border border-[var(--border)] p-2 rounded-xl text-sm" value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} required />
            <input placeholder="Email" type="email" className="bg-white dark:bg-black/20 border border-[var(--border)] p-2 rounded-xl text-sm" value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} required />
            <input placeholder="Password" type="password" className="bg-white dark:bg-black/20 border border-[var(--border)] p-2 rounded-xl text-sm" value={createForm.password} onChange={e => setCreateForm({...createForm, password: e.target.value})} required />
            <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={createForm.is_superuser} onChange={e => setCreateForm({...createForm, is_superuser: e.target.checked})} /> Admin Permissions</label>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-bold">Cancel</button>
            <button type="submit" className="bg-[var(--accent)] text-white px-4 py-2 rounded-xl text-sm font-bold">Create Account</button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {users.map(u => (
          <div key={u.id} className="p-6 bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl flex items-center justify-between group hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold text-xl">{u.name?.[0]}</div>
              {editingId === u.id ? (
                <div className="flex gap-2"><input className="bg-[var(--input-bg)] border border-[var(--border)] rounded-lg p-1.5 text-sm" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /><input className="bg-[var(--input-bg)] border border-[var(--border)] rounded-lg p-1.5 text-sm" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} /></div>
              ) : (
                <div><h4 className="font-bold flex items-center gap-2">{u.name} {u.is_superuser && <ShieldCheck size={14} className="text-red-500" />}</h4><p className="text-xs text-gray-500">{u.email} • Level {u.character_level} {u.character_class}</p></div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {editingId === u.id ? (
                <><button onClick={() => handleUpdate(u.id)} className="p-2 text-green-500"><Save size={18} /></button><button onClick={() => setEditingId(null)} className="p-2 text-gray-400"><X size={18} /></button></>
              ) : (
                <button onClick={() => { setEditingId(u.id); setEditForm({ name: u.name, email: u.email, is_superuser: u.is_superuser }); }} className="p-2 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-[var(--accent)] transition-all"><Edit2 size={18} /></button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
