import React from 'react';
import { MessageSquare, Plus, Settings, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="flex h-screen bg-[var(--background)] text-[var(--foreground)]">
      <aside className="w-64 bg-[var(--sidebar)] flex flex-col p-4 border-r border-[var(--border)]">
        <button className="flex items-center gap-2 bg-[var(--input-bg)] p-3 rounded-full mb-8 hover:opacity-80 transition-opacity border border-[var(--border)]">
          <Plus size={20} className="text-[var(--accent)]" />
          <span className="text-sm font-medium">New Chat</span>
        </button>
        
        <nav className="flex-1 space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--input-bg)] cursor-pointer transition-colors sidebar-item">
            <MessageSquare size={18} />
            <span className="text-sm">Recent Chats</span>
          </div>
        </nav>

        <div className="mt-auto space-y-2 pt-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--input-bg)] cursor-pointer transition-colors sidebar-item">
            <Settings size={18} />
            <span className="text-sm">Settings</span>
          </div>
          <div 
            onClick={logout}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 text-red-500 cursor-pointer transition-colors sidebar-item"
          >
            <LogOut size={18} />
            <span className="text-sm">Sign Out</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--border)]">
          <span className="font-bold text-xl tracking-tight text-[var(--accent)]">Momo</span>
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
