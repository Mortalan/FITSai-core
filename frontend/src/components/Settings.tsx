import React, { useState, useEffect } from 'react';
import { User, ShieldAlert, Palette, Save, Lock, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { GodMode } from './GodMode';
import { listPersonalities, updateProfile } from '../api';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'personalities' | 'admin'>('profile');
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [personalities, setPersonalities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'personalities') {
      listPersonalities().then(setPersonalities);
    }
  }, [activeTab]);

  const handlePersonalitySelect = async (id: number) => {
    setLoading(true);
    try {
      const res = await updateProfile({ active_personality_id: id });
      updateUser({ active_personality_id: id });
      setSaveStatus('Personality updated!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {}
    setLoading(false);
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'personalities', name: 'Character Voice', icon: Palette },
    { id: 'appearance', name: 'Appearance', icon: Palette },
  ];

  if (user?.role === 'admin' || user?.email === 'louisp@fits.net.za') {
    tabs.push({ id: 'admin', name: 'God Mode', icon: ShieldAlert });
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2 text-left">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-gray-500 font-medium uppercase text-[10px] tracking-[0.2em]">Customize your Momo experience</p>
      </div>

      <div className="flex gap-8">
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

        <div className="flex-1 bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl p-8 min-h-[600px] shadow-sm overflow-y-auto max-h-[80vh] custom-scrollbar">
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
                      {user?.character_class} (Lvl {user?.character_level})
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-400">Profile management coming soon. Use the 'Character Voice' tab to change Momo's personality.</p>
            </div>
          )}

          {activeTab === 'personalities' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="font-bold text-xl">Momo's Personalities</h3>
                  <p className="text-sm text-gray-500 mt-1">Unlock more character voices as you level up your XP.</p>
                </div>
                {saveStatus && <span className="text-green-500 text-xs font-bold animate-pulse">{saveStatus}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                {personalities.map((p) => (
                  <div 
                    key={p.id}
                    onClick={() => p.is_unlocked && handlePersonalitySelect(p.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative group ${
                      user?.active_personality_id === p.id 
                        ? 'border-[var(--accent)] bg-[var(--accent)]/5' 
                        : p.is_unlocked ? 'border-[var(--border)] hover:border-[var(--accent)]/50' : 'border-gray-100 opacity-60 grayscale'
                    }`}
                  >
                    {!p.is_unlocked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 dark:bg-black/40 z-10 rounded-xl">
                        <Lock size={20} className="text-gray-400" />
                        <span className="text-[10px] font-bold mt-1">LVL {p.unlock_level}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-bold capitalize">{p.name.replace(/_/g, ' ')}</span>
                      {user?.active_personality_id === p.id && <CheckCircle2 size={16} className="text-[var(--accent)]" />}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'admin' && <GodMode />}
        </div>
      </div>
    </div>
  );
};
