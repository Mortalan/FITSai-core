import React from 'react';
import { MessageSquare, Plus, Settings, LogOut, FileText } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { ProgressDashboard } from './ProgressDashboard';
import { Avatar } from './Avatar';

interface LayoutProps {
  children: React.ReactNode;
  onViewChange: (view: 'chat' | 'docs') => void;
  currentView: 'chat' | 'docs';
  onNewChat: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onViewChange, currentView, onNewChat }) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="flex h-screen bg-[var(--background)] text-[var(--foreground)]">
      <aside className="w-64 bg-[var(--sidebar)] flex flex-col p-4 border-r border-[var(--border)]">
        <div className="flex items-center gap-3 mb-8 px-2">
          <Avatar size={32} />
          <span className="font-bold text-lg tracking-tight text-[var(--accent)]">Momo</span>
        </div>

        <button 
          onClick={onNewChat}
          className="flex items-center gap-2 bg-[var(--input-bg)] p-3 rounded-full mb-6 hover:opacity-80 transition-opacity border border-[var(--border)]"
        >
          <Plus size={20} className="text-[var(--accent)]" />
          <span className="text-sm font-medium">New Chat</span>
        </button>
        
        <div className="mb-6">
          <ProgressDashboard />
        </div>

        <nav className="flex-1 space-y-2">
          <div 
            onClick={() => onViewChange('chat')}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${currentView === 'chat' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'hover:bg-[var(--input-bg)]'}`}
          >
            <MessageSquare size={18} />
            <span className="text-sm font-medium">Chat</span>
          </div>
          <div 
            onClick={() => onViewChange('docs')}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${currentView === 'docs' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'hover:bg-[var(--input-bg)]'}`}
          >
            <FileText size={18} />
            <span className="text-sm font-medium">Knowledge Base</span>
          </div>
        </nav>

        <div className="mt-auto space-y-2 pt-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--input-bg)] cursor-pointer transition-colors sidebar-item">
            <Settings size={18} />
            <span className="text-sm font-medium">Settings</span>
          </div>
          <div 
            onClick={logout}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 text-red-500 cursor-pointer transition-colors sidebar-item"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Sign Out</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
             <span className="text-sm text-gray-400 font-medium capitalize">FITSai-Core • {currentView}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{user?.name || 'User'}</span>
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
