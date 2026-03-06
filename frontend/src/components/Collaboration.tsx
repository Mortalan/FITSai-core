import React, { useState, useEffect } from 'react';
import { Users, Plus, MessageSquare, ChevronRight, Loader2, Sparkles, FolderLock } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const Collaboration: React.FC<{ onInitProjectChat: (pid: number) => void }> = ({ onInitProjectChat }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const token = useAuthStore((state) => state.token);

  useEffect(() => { fetchProjects(); }, [token]);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://10.0.0.231:9000/api/v1/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
    } catch (err) {}
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://10.0.0.231:9000/api/v1/projects', newProject, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowCreate(false);
      setNewProject({ name: '', description: '' });
      fetchProjects();
    } catch (err) { alert('Create failed'); }
  };

  if (loading) return <div className="flex justify-center p-32"><Loader2 className="animate-spin text-[var(--accent)]" size={32} /></div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="bg-[var(--sidebar)] border border-[var(--border)] rounded-[40px] p-10 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Project Streams</h2>
          <p className="text-gray-500 font-medium text-sm mt-1">Technical collaboration and dedicated workstream history.</p>
        </div>
        <button 
          onClick={() => setShowCreate(!showCreate)} 
          className="bg-[var(--accent)] text-white px-8 py-4 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl shadow-[var(--accent)]/30 hover:scale-105 transition-all"
        >
          <Plus size={18} className="inline mr-2" /> New Stream
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="p-10 bg-[var(--sidebar)] border-2 border-[var(--accent)]/30 rounded-[40px] space-y-8 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Stream Identity</label><input placeholder="e.g. Server Migration 2026" className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-2xl py-4 px-6 outline-none font-bold" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} required /></div>
            <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Technical Scope</label><input placeholder="Primary objectives and constraints..." className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-2xl py-4 px-6 outline-none font-bold" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} /></div>
          </div>
          <div className="flex justify-end gap-4"><button type="button" onClick={() => setShowCreate(false)} className="px-8 py-4 font-bold text-gray-400 hover:text-[var(--foreground)] transition-all">Cancel</button><button type="submit" className="bg-[var(--accent)] text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg">Initialize Stream</button></div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map(p => (
          <div key={p.id} className="group bg-[var(--sidebar)] border border-[var(--border)] rounded-[40px] p-10 hover:border-[var(--accent)] transition-all cursor-pointer shadow-sm hover:shadow-2xl relative overflow-hidden">
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-[var(--accent)]/10 text-[var(--accent)] rounded-2xl group-hover:bg-[var(--accent)] group-hover:text-white transition-all"><FolderLock size={24} /></div>
                <button onClick={(e) => { e.stopPropagation(); onInitProjectChat(p.id); }} className="p-3 bg-[var(--input-bg)] rounded-xl hover:bg-[var(--accent)] hover:text-white transition-all shadow-sm"><MessageSquare size={20} /></button>
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight mb-2">{p.name}</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">{p.description || 'Dedicated technical collaboration stream.'}</p>
              </div>
              <div className="pt-6 border-t border-[var(--border)] flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">ID: PRJ-{p.id}</span>
                <ChevronRight className="text-[var(--accent)] opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity"><FolderLock size={200} /></div>
          </div>
        ))}
        {projects.length === 0 && <div className="col-span-full text-center py-32 bg-[var(--input-bg)]/30 rounded-[48px] border border-[var(--border)] border-dashed text-gray-400 font-black uppercase text-xs tracking-[0.3em] opacity-50">No active workstreams identified.</div>}
      </div>
    </div>
  );
};
