import React, { useState, useEffect } from 'react';
import { Users, Plus, CheckCircle2, MessageSquare, Loader2, UserPlus, FolderKanban } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = 'http://10.0.0.231:9000/api/v1/projects';

export const Collaboration: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '' });
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchProjects();
  }, [token]);

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
    } catch (err) {
      alert('Failed to create project');
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[var(--accent)]" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-xl">Collaboration & Projects</h3>
          <p className="text-sm text-gray-500">Manage shared workstreams and team AI contexts.</p>
        </div>
        <button onClick={() => setIsCreating(!isCreating)} className="flex items-center gap-2 bg-[var(--accent)] text-[var(--accent-foreground)] px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:opacity-90 transition-all">
          <Plus size={16} /> New Project
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="p-6 bg-[var(--input-bg)] border border-[var(--border)] rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 mb-1">Project Title</label>
            <input 
              autoFocus
              type="text" 
              value={newProject.title}
              onChange={e => setNewProject({...newProject, title: e.target.value})}
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
              placeholder="e.g., Server Migration Q3"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 mb-1">Description (Optional)</label>
            <input 
              type="text" 
              value={newProject.description}
              onChange={e => setNewProject({...newProject, description: e.target.value})}
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
              placeholder="Brief goal or context for the team..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-black/5 rounded-xl transition-all">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-bold bg-[var(--accent)] text-[var(--accent-foreground)] rounded-xl shadow-sm hover:opacity-90 transition-all">Create Workspace</button>
          </div>
        </form>
      )}

      {/* Legacy Peer Linking Concept Restored */}
      <div className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-2xl mb-6">
        <h4 className="font-bold text-blue-600 mb-2 flex items-center gap-2"><Sparkles size={16} /> Peer Linking Active</h4>
        <p className="text-xs text-blue-700 leading-relaxed">
          Momo automatically analyzes Knowledge Base contributions and technical discussions. 
          When you ask a complex question, she'll suggest reaching out to specific peers who have 
          demonstrated expertise in that domain.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        {projects.length === 0 && !isCreating ? (
          <div className="col-span-2 text-center py-12 border-2 border-dashed border-[var(--border)] rounded-2xl">
            <FolderKanban className="mx-auto mb-3 text-gray-300" size={32} />
            <p className="text-gray-400 font-medium text-sm">No active projects. Create one to share AI context with your team.</p>
          </div>
        ) : (
          projects.map(p => (
            <div key={p.id} className="p-5 bg-[var(--input-bg)] border border-[var(--border)] rounded-2xl hover:border-[var(--accent)] transition-all group cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-bold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">{p.title}</h4>
                <span className="px-2 py-0.5 bg-green-500/10 text-green-600 text-[10px] font-bold uppercase tracking-widest rounded">Active</span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2 min-h-[32px]">{p.description || "No description provided."}</p>
              
              <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--accent)] border-2 border-[var(--input-bg)] flex items-center justify-center text-[10px] font-bold text-white z-10">{user?.name?.[0]}</div>
                  <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-[var(--input-bg)] flex items-center justify-center text-gray-500"><UserPlus size={10} /></div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <MessageSquare size={12} /> 0 Chats
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
