import React, { useEffect, useState } from 'react';
import { MessageSquare, Plus, Settings as SettingsIcon, LogOut, FileText, Trophy, Award } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { ProgressDashboard } from './ProgressDashboard';
import { Avatar } from './Avatar';
import { getChatHistory } from '../api';
import type { AppView } from '../App';
import type { Department } from '../types';

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

  useEffect(() => {
    if (token) {
      axios.get('http://10.0.0.231:9000/api/v1/departments/me', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setDept(res.data)).catch(() => {});
      
      refreshHistory();
    }
  }, [token, currentView]); // Refresh history when switching to chat or docs

  const refreshHistory = async () => {
    try {
      const data = await getChatHistory();
      setHistory(data);
    } catch (err) {}
  };

  return (
    <div className="flex h-screen bg-[var(--background)] text-[var(--foreground)] font-sans">
      <aside className="w-64 bg-[var(--sidebar)] flex flex-col p-4 border-r border-[var(--border)]">
        <div className="flex items-center gap-3 mb-8 px-2">
          <Avatar size={32} />
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-[var(--accent)]">Momo</span>
            {dept && (
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate max-w-[120px]">
                {dept.name}
              </span>
            )}
          </div>
        </div>

        <button 
          onClick={onNewChat}
          className="flex items-center gap-2 bg-[var(--input-bg)] p-3 rounded-full mb-6 hover:opacity-80 transition-opacity border border-[var(--border)]"
        >
          <Plus size={20} className="text-[var(--accent)]" />
          <span className="text-sm font-bold">New Chat</span>
        </button>
        
        <div className="mb-6">
          <ProgressDashboard />
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
          <div 
            onClick={() => onViewChange('chat')}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${currentView === 'chat' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'hover:bg-[var(--input-bg)]'}`}
          >
            <MessageSquare size={18} />
            <span className="text-sm font-semibold">Active Chat</span>
          </div>
          
          {history.length > 0 && (
            <div className="py-2">
              <p className="text-[10px] uppercase font-bold text-gray-400 px-3 mb-2 tracking-widest">Recent History</p>
              {history.map(chat => (
                <div 
                  key={chat.id}
                  onClick={() => onChatSelect(chat.id)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--input-bg)] cursor-pointer transition-colors group mb-1"
                >
                  <MessageSquare size={14} className="text-gray-400 group-hover:text-[var(--accent)]" />
                  <span className="text-xs font-medium truncate">{chat.title}</span>
                </div>
              ))}
            </div>
          )}

          <div 
            onClick={() => onViewChange('docs')}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${currentView === 'docs' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'hover:bg-[var(--input-bg)]'}`}
          >
            <FileText size={18} />
            <span className="text-sm font-semibold">Knowledge Base</span>
          </div>
          <div 
            onClick={() => onViewChange('achievements')}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${currentView === 'achievements' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'hover:bg-[var(--input-bg)]'}`}
          >
            <Award size={18} />
            <span className="text-sm font-semibold">Achievements</span>
          </div>
          <div 
            onClick={() => onViewChange('leaderboard')}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${currentView === 'leaderboard' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'hover:bg-[var(--input-bg)]'}`}
          >
            <Trophy size={18} />
            <span className="text-sm font-semibold">Leaderboard</span>
          </div>
        </nav>

        <div className="mt-auto space-y-1 pt-4 border-t border-[var(--border)]">
          <div 
            onClick={() => onViewChange('settings')}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${currentView === 'settings' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'hover:bg-[var(--input-bg)]'}`}
          >
            <SettingsIcon size={18} />
            <span className="text-sm font-semibold">Settings</span>
          </div>
          <div 
            onClick={logout}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 text-red-500 cursor-pointer transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-semibold">Sign Out</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
             <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
               {dept?.branding?.custom_greeting || 'FITSai-Core v1.8.1'} • {currentView}
             </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold">{user?.name || 'User'}</span>
            <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-[var(--accent-foreground)] text-xs font-bold">
              {user?.name?.[0] || 'U'}
            </div>
          </div>
        </header>
        <section className="flex-1 overflow-y-auto bg-[var(--background)]">
          {children}
        </section>
      </main>
    </div>
  );
};
