import React, { useState } from 'react';
import { User, Settings as SettingsIcon, ShieldAlert, Cpu, HardDrive, Key, Palette, Save } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { GodMode } from './GodMode';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'admin'>('profile');
  const user = useAuthStore((state) => state.user);
  
  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'appearance', name: 'Appearance', icon: Palette },
  ];

  if (user?.role === 'admin' || user?.email === 'louisp@fits.net.za') {
    tabs.push({ id: 'admin', name: 'God Mode', icon: ShieldAlert });
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2 text-left">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-gray-500 font-medium uppercase text-[10px] tracking-[0.2em]">Manage your Momo experience and system preferences</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Nav */}
        <div className="w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-semibold text-sm ${
                activeTab === tab.id 
                  ? 'bg-[var(--accent)] text-[var(--accent-foreground)] shadow-md' 
                  : 'text-gray-500 hover:bg-[var(--input-bg)]'
              }`}
            >
              <tab.icon size={18} />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl p-8 min-h-[600px] shadow-sm">
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-[var(--accent)] flex items-center justify-center text-4xl font-bold text-[var(--accent-foreground)] shadow-xl">
                  {user?.name?.[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user?.name}</h2>
                  <p className="text-gray-500 font-medium">{user?.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-bold uppercase rounded-md border border-[var(--accent)]/20">
                      {user?.character_class}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Display Name</label>
                  <input type="text" defaultValue={user?.name} className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Account Role</label>
                  <input type="text" value={user?.role || 'User'} disabled className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-xl py-3 px-4 opacity-50 cursor-not-allowed" />
                </div>
              </div>

              <div className="pt-6 border-t border-[var(--border)] flex justify-end">
                <button className="flex items-center gap-2 bg-[var(--accent)] text-[var(--accent-foreground)] px-6 py-2.5 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all">
                  <Save size={18} /> Update Profile
                </button>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <h3 className="font-bold text-lg">Theme Preferences</h3>
                <p className="text-sm text-gray-500">Customize how Momo looks on your screen.</p>
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl border-2 border-[var(--accent)] bg-white dark:bg-black/20 text-center cursor-pointer">
                    <div className="w-full h-12 bg-gray-100 rounded-lg mb-2" />
                    <span className="text-xs font-bold">Auto</span>
                  </div>
                  <div className="p-4 rounded-2xl border border-[var(--border)] bg-white text-center cursor-pointer hover:border-[var(--accent)] transition-all">
                    <div className="w-full h-12 bg-gray-50 rounded-lg mb-2" />
                    <span className="text-xs font-bold">Light</span>
                  </div>
                  <div className="p-4 rounded-2xl border border-[var(--border)] bg-gray-900 text-center cursor-pointer hover:border-[var(--accent)] transition-all">
                    <div className="w-full h-12 bg-black rounded-lg mb-2" />
                    <span className="text-xs font-bold">Dark</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'admin' && <GodMode />}
        </div>
      </div>
    </div>
  );
};
