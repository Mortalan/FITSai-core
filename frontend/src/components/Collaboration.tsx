import React, { useState, useEffect } from 'react';
import { Users, Plus, MessageSquare, Loader2, UserPlus, FolderKanban, Sparkles, ArrowLeft, Send } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Chat } from './Chat';

const API_BASE_URL = 'http://10.0.0.231:9000/api/v1/projects';

export const Collaboration: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '' });
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  useEffect(() => { fetchProjects(); }, [token]);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(API_BASE_URL, { headers: { Authorization: `Bearer ${token}` } });
      setProjects(res.data);
    } catch (err) {}
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title) return;
    try {
      await axios.post(API_BASE_URL, newProject, { headers: { Authorization: `Bearer ${token}` } });
      setNewProject({ title: '', description: '' });
      setIsCreating(false);
      fetchProjects();
    } catch (err) { alert('Create failed'); }
  };

  if (selectedProject) {
    return (
      <div className="h-full flex flex-col animate-in fade-in duration-300">
        <div className="flex items-center gap-4 mb-6 p-2">
          <button onClick={() => setSelectedProject(null)} className="p-2 hover:bg-black/5 rounded-xl transition-colors"><ArrowLeft size={20} /></button>
          <div>
            <h3 className="text-xl font-bold">{selectedProject.title}</h3>
            <p className="text-xs text-gray-500">Shared Project Workspace</p>
          </div>
        </div>
        <div className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-3xl overflow-hidden flex flex-col shadow-sm">
          <div className="p-20 text-center space-y-4">
            <MessageSquare size={48} className="mx-auto text-gray-300" />
            <h4 className="text-lg font-bold">Project Stream</h4>
            <p className="text-sm text-gray-500 max-w-md mx-auto">This is a shared project workstream. Conversations here are visible to all project members and maintain shared context.</p>
            <button className="bg-[var(--accent)] text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg">Initialize Project Chat</button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[var(--accent)]" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-[var(--sidebar)] p-8 border border-[var(--border)] rounded-3xl shadow-sm">
        <div>
          <h3 className="font-bold text-2xl">Project Team</h3>
          <p className="text-sm text-gray-500 mt-1">Manage shared workstreams and collaborative AI context.</p>
        </div>
        <button onClick={() => setIsCreating(!isCreating)} className="flex items-center gap-2 bg-[var(--accent)] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all">
          <Plus size={18} /> New Project
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="p-6 bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl space-y-4 animate-in slide-in-from-top-2 shadow-sm">
          <div className="grid grid-cols-1 gap-4">
            <input autoFocus placeholder="Project Title (e.g., VPN Migration)" className="bg-[var(--input-bg)] border border-[var(--border)] p-3 rounded-xl text-sm font-bold" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} required />
            <input placeholder="Description" className="bg-[var(--input-bg)] border border-[var(--border)] p-3 rounded-xl text-sm" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-sm font-bold text-gray-500">Cancel</button>
            <button type="submit" className="bg-[var(--accent)] text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg">Create Workstream</button>
          </div>
        </form>
      )}

      <div className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-3xl mb-6">
        <h4 className="font-bold text-blue-600 mb-2 flex items-center gap-2"><Sparkles size={16} /> Peer Linking Active</h4>
        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">Momo automatically suggests reaching out to specific peers who have demonstrated expertise in technical domains identified during project analysis.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.length === 0 && !isCreating ? (
          <div className="col-span-full text-center py-20 border-2 border-dashed border-[var(--border)] rounded-3xl bg-gray-50/50 dark:bg-black/10">
            <FolderKanban className="mx-auto mb-3 text-gray-300" size={48} />
            <p className="text-gray-400 font-medium">No active projects. Start a shared workstream.</p>
          </div>
        ) : (
          projects.map(p => (
            <div key={p.id} onClick={() => setSelectedProject(p)} className="p-6 bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl hover:border-[var(--accent)] transition-all group cursor-pointer shadow-sm hover:shadow-md">
              <div className="flex items-start justify-between mb-4">
                <h4 className="font-bold text-lg group-hover:text-[var(--accent)] transition-colors">{p.title}</h4>
                <span className="px-2 py-0.5 bg-green-500/10 text-green-600 text-[9px] font-black uppercase tracking-widest rounded">Active</span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-3 min-h-[48px]">{p.description || "No description provided."}</p>
              <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent)] border-2 border-[var(--sidebar)] flex items-center justify-center text-xs font-bold text-white shadow-sm">{user?.name?.[0]}</div>
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 border-2 border-[var(--sidebar)] flex items-center justify-center text-gray-400"><UserPlus size={12} /></div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <MessageSquare size={14} /> 0 Active Chats
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
