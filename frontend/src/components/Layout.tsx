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

        {/* Fixed height logo container to prevent layout shifts */}
        <div className="h-32 flex flex-col items-center justify-center mb-4 transition-all">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-blue-600 flex items-center justify-center shadow-lg shadow-[var(--accent)]/20">
            <img src="/assets/avfel2.png" className="w-7 h-7 object-contain brightness-0 invert" alt="Logo" />
          </div>
          {!isCollapsed && (
            <div className="mt-3 text-center animate-in fade-in duration-500">
              <span className="font-bold text-xl tracking-tighter text-[var(--accent)]">Momo</span>
            </div>
          )}
        </div>

        {/* Centered button container with fixed padding */}
        <div className="px-2 mb-8 flex flex-col items-center">
          <button 
            onClick={onNewChat}
            className={`group flex items-center bg-[var(--accent)] text-white hover:opacity-90 transition-all duration-500 shadow-lg shadow-[var(--accent)]/20 ${
              isCollapsed 
                ? 'w-12 h-12 rounded-full justify-center p-0' 
                : 'w-full h-12 rounded-2xl justify-start px-4 gap-3'
            }`}
          >
            <Plus size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="text-sm font-black uppercase tracking-widest whitespace-nowrap animate-in fade-in slide-in-from-left-2">New Chat</span>}
          </button>
        </div>
        
        <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-1 overflow-x-hidden flex flex-col items-center">
          <div 
            onClick={() => onViewChange('chat')} 
            className={`group flex items-center transition-all duration-500 cursor-pointer ${
              currentView === 'chat' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-gray-500 hover:bg-[var(--input-bg)]'
            } ${
              isCollapsed 
                ? 'w-12 h-12 rounded-full justify-center' 
                : 'w-full p-3.5 rounded-2xl justify-start px-4 gap-3'
            }`}
          >
            <MessageSquare size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="text-sm font-bold whitespace-nowrap animate-in fade-in slide-in-from-left-2">Active Chat</span>}
          </div>
          
          {!isCollapsed && (
            <div className="w-full py-6 px-3 space-y-4 animate-in fade-in duration-500">
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
                    <MessageSquare size={14} className="text-gray-400 group-hover:text-[var(--accent)] flex-shrink-0" />
                    <span className="text-[13px] font-medium truncate">{chat.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="mt-auto space-y-1 pt-4 border-t border-[var(--border)] flex flex-col items-center">
          <div 
            onClick={() => onViewChange('workspace')} 
            className={`group flex items-center transition-all duration-500 cursor-pointer ${
              currentView === 'workspace' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-gray-500 hover:bg-[var(--input-bg)]'
            } ${
              isCollapsed 
                ? 'w-12 h-12 rounded-full justify-center' 
                : 'w-full p-3.5 rounded-2xl justify-start px-4 gap-3'
            }`}
          >
            <LayoutGrid size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="text-sm font-bold whitespace-nowrap">Workspace</span>}
          </div>
          <div 
            onClick={logout} 
            className={`group flex items-center transition-all duration-500 cursor-pointer text-red-500 hover:bg-red-500/10 ${
              isCollapsed 
                ? 'w-12 h-12 rounded-full justify-center' 
                : 'w-full p-3.5 rounded-2xl justify-start px-4 gap-3'
            }`}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="text-sm font-bold whitespace-nowrap">Sign Out</span>}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-8 bg-[var(--background)] backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center gap-4">
             {isCollapsed && <button onClick={() => setIsCollapsed(false)} className="p-2 hover:bg-black/5 rounded-lg text-gray-400"><Menu size={20} /></button>}
          </div>
          
          <div className="flex items-center gap-6">
            {user && (
              <div className="flex items-center gap-4 px-5 py-2 bg-[var(--sidebar)] rounded-2xl border border-[var(--border)] shadow-sm">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-[var(--accent)] uppercase tracking-widest">{user.character_class}</span>
                  <span className="text-[10px] font-black uppercase">Lvl {user.character_level}</span>
                </div>
                <div className="relative w-32 h-2 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden border border-black/5">
                  <div 
                    className="h-full bg-gradient-to-r from-[var(--accent)] to-blue-400 transition-all duration-1000 relative shadow-[0_0_8px_var(--accent)]" 
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </div>
                </div>
                <Zap size={14} className="text-yellow-500 fill-yellow-500 animate-pulse" />
              </div>
            )}

            <div 
              onClick={() => onViewChange('workspace')}
              className="flex items-center gap-3 cursor-pointer group hover:opacity-80 transition-all"
            >
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold tracking-tight group-hover:text-[var(--accent)] transition-colors">{user?.name || 'Technician'}</span>
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
