import React, { useEffect, useState, useMemo } from 'react';
import { MessageSquare, Plus, LogOut, Search, X, LayoutGrid, Zap, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Avatar } from './Avatar';
import { getChatHistory } from '../api';
import { getXPProgress } from '../utils/xp';
import type { AppView, Department } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  onViewChange: (view: AppView) => void;
  currentView: AppView;
  onNewChat: () => void;
  onChatSelect: (id: number) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onViewChange, currentView, onNewChat, onChatSelect }) => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const [dept, setDept] = useState<Department | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  // Default to minimized as requested
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    if (token) {
      axios.get('http://10.0.0.231:9000/api/v1/departments/me', { headers: { Authorization: `Bearer ${token}` } }).then(res => setDept(res.data)).catch(() => {});
      refreshHistory();
    }
  }, [token, currentView]);

  const refreshHistory = async () => {
    try {
      const data = await getChatHistory();
      setHistory(data);
    } catch (err) {}
  };

  const filteredHistory = useMemo(() => {
    if (!searchQuery) return history;
    return history.filter(h => h.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [history, searchQuery]);

  const progress = useMemo(() => {
    if (!user) return 0;
    return getXPProgress(user.character_level, user.xp_total);
  }, [user]);

  return (
    <div className="flex h-screen bg-[var(--background)] text-[var(--foreground)] font-sans overflow-hidden">
      <aside className={`transition-all duration-500 ease-in-out bg-[var(--sidebar)] flex flex-col p-4 border-r border-[var(--border)] relative ${isCollapsed ? 'w-20' : 'w-72'}`}>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="absolute -right-3 top-20 bg-[var(--sidebar)] border border-[var(--border)] p-1.5 rounded-full z-20 shadow-md hover:text-[var(--accent)] transition-all"
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        <div className={`flex flex-col items-center mb-8 px-2 transition-all ${isCollapsed ? 'gap-2' : 'gap-4'}`}>
          {/* Logo above Momo text */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-blue-600 flex items-center justify-center shadow-lg shadow-[var(--accent)]/20">
            <img src="/assets/avfel2.png" className="w-7 h-7 object-contain brightness-0 invert" alt="Logo" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col items-center text-center">
              <span className="font-black text-2xl tracking-tighter text-[var(--accent)]">Momo</span>
              {dept && <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{dept.name}</span>}
            </div>
          )}
        </div>

        <button 
          onClick={onNewChat}
          className={`flex items-center gap-3 bg-[var(--accent)] text-white p-4 rounded-2xl mb-8 hover:opacity-90 transition-all shadow-lg ${isCollapsed ? 'justify-center w-12 h-12 p-0 rounded-full' : ''}`}
        >
          <Plus size={20} />
          {!isCollapsed && <span className="text-sm font-black uppercase tracking-widest">New Chat</span>}
        </button>
        
        <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-1 overflow-x-hidden">
          <div onClick={() => onViewChange('chat')} className={`flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all ${currentView === 'chat' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-gray-500 hover:bg-[var(--input-bg)]'} ${isCollapsed ? 'justify-center' : ''}`}>
            <MessageSquare size={20} />
            {!isCollapsed && <span className="text-sm font-bold">Active Chat</span>}
          </div>
          
          {!isCollapsed && (
            <div className="py-6 px-3 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em]">Recent Threads</p>
                {searchQuery && <X size={12} className="text-gray-400 cursor-pointer" onClick={() => setSearchQuery('')} />}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                <input type="text" placeholder="Filter..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-xl py-2 pl-9 pr-3 text-[11px] outline-none" />
              </div>
              <div className="space-y-1">
                {filteredHistory.slice(0, 30).map(chat => (
                  <div key={chat.id} onClick={() => onChatSelect(chat.id)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--input-bg)] cursor-pointer transition-all group mb-1 border border-transparent hover:border-[var(--border)]">
                    <MessageSquare size={14} className="text-gray-400 group-hover:text-[var(--accent)]" />
                    <span className="text-[13px] font-medium truncate">{chat.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="mt-auto space-y-1 pt-4 border-t border-[var(--border)]">
          <div onClick={() => onViewChange('workspace')} className={`flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all ${currentView === 'workspace' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-gray-500 hover:bg-[var(--input-bg)]'} ${isCollapsed ? 'justify-center' : ''}`}>
            <LayoutGrid size={20} />
            {!isCollapsed && <span className="text-sm font-bold">Workspace</span>}
          </div>
          <div onClick={logout} className={`flex items-center gap-3 p-3.5 rounded-2xl hover:bg-red-500/10 text-red-500 cursor-pointer transition-all ${isCollapsed ? 'justify-center' : ''}`}>
            <LogOut size={20} />
            {!isCollapsed && <span className="text-sm font-bold">Sign Out</span>}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top bar SAME color as body for cleaner look, removed wording */}
        <header className="h-16 flex items-center justify-between px-8 bg-[var(--background)] backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center gap-4">
             {isCollapsed && <button onClick={() => setIsCollapsed(false)} className="p-2 hover:bg-black/5 rounded-lg text-gray-400"><Menu size={20} /></button>}
          </div>
          
          <div className="flex items-center gap-6">
            {user && (
              <div className="flex items-center gap-4 px-5 py-2 bg-[var(--sidebar)] rounded-2xl border border-[var(--border)] shadow-sm hover:border-[var(--accent)]/50 transition-all">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-[var(--accent)] uppercase tracking-widest">{user.character_class}</span>
                  <span className="text-[10px] font-black uppercase">Lvl {user.character_level}</span>
                </div>
                {/* Aesthetic Progress Bar */}
                <div className="relative w-32 h-2.5 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden border border-black/5">
                  <div 
                    className="h-full bg-gradient-to-r from-[var(--accent)] to-blue-400 transition-all duration-1000 relative" 
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </div>
                </div>
                <Zap size={14} className="text-yellow-500 fill-yellow-500 animate-pulse" />
              </div>
            )}

            {/* Clickable name/avatar to go to profile */}
            <div 
              onClick={() => onViewChange('workspace')}
              className="flex items-center gap-3 cursor-pointer group hover:opacity-80 transition-all"
            >
              <div className="flex flex-col items-end">
                <span className="text-sm font-black tracking-tight group-hover:text-[var(--accent)] transition-colors">{user?.name || 'Technician'}</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{user?.is_superuser ? 'Superuser' : 'Technician'}</span>
              </div>
              <div className="relative transition-transform group-hover:scale-105">
                <Avatar size={40} />
                <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-[var(--accent)]/50 transition-all" />
              </div>
            </div>
          </div>
        </header>
        <section className="flex-1 overflow-y-auto bg-[var(--background)] custom-scrollbar">
          {children}
        </section>
      </main>
    </div>
  );
};
