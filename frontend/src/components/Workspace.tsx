import React, { useState, useEffect } from 'react';
import { User, ShieldAlert, Palette, DollarSign, Users, FileText, Award, Trophy, Bell, Edit2, Save, Smile } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { GodMode } from './GodMode';
import { DocumentLibrary } from './Documents';
import { Achievements } from './Achievements';
import { Leaderboard } from './Leaderboard';
import { Reminders } from './Reminders';
import { Avatar } from './Avatar';
import { ProgressDashboard } from './ProgressDashboard';
import { Collaboration } from './Collaboration';
import { listPersonalities, updateProfile } from '../api';
import axios from 'axios';
import { Lock, CheckCircle2 } from 'lucide-react';

export const Workspace: React.FC<{ defaultTab?: string }> = ({ defaultTab = 'profile' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  
  const [personalities, setPersonalities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar_emoji: user?.special_effects?.emoji || '🤖',
    avatar_color: user?.special_effects?.color || '#3b82f6'
  });

  useEffect(() => {
    if (activeTab === 'personalities') {
      setLoading(true);
      listPersonalities()
        .then(data => {
          if (Array.isArray(data)) setPersonalities(data);
          else setPersonalities([]);
        })
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateProfile(profileForm);
      updateUser(res.user);
      setSaveStatus('Profile updated!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      alert('Failed to update profile');
    }
    setLoading(false);
  };

  const handlePersonalitySelect = async (id: number) => {
    setLoading(true);
    try {
      const res = await updateProfile({ active_personality_id: id });
      updateUser(res.user);
      setSaveStatus('Personality updated!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {}
    setLoading(false);
  };

  const menuSections = [
    {
      title: "Identity",
      items: [
        { id: 'profile', name: 'Profile Editor', icon: User },
        { id: 'personalities', name: 'Character Voice', icon: Palette },
      ]
    },
    {
      title: "Operations",
      items: [
        { id: 'docs', name: 'Knowledge Base', icon: FileText },
        { id: 'reminders', name: 'Task Reminders', icon: Bell },
        { id: 'collaboration', name: 'Project Team', icon: Users },
      ]
    },
    {
      title: "Progression",
      items: [
        { id: 'achievements', name: 'Achievements', icon: Award },
        { id: 'leaderboard', name: 'Leaderboard', icon: Trophy },
      ]
    }
  ];

  if (user?.is_superuser || user?.email === 'louisp@fits.net.za') {
    menuSections.push({
      title: "Control",
      items: [
        { id: 'admin', name: 'God Mode', icon: ShieldAlert },
      ]
    });
  }

  return (
    <div className="flex h-full font-sans">
      <div className="w-64 bg-[var(--sidebar)] border-r border-[var(--border)] p-6 overflow-y-auto custom-scrollbar">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Workspace</h2>
          <p className="text-gray-500 font-medium uppercase text-[10px] tracking-widest mt-1">Tools & Progression</p>
        </div>

        <div className="space-y-6">
          {menuSections.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-3">{section.title}</h3>
              <div className="space-y-1">
                {section.items.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
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
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-[var(--background)] overflow-y-auto custom-scrollbar">
        {activeTab === 'docs' && <DocumentLibrary />}
        {activeTab === 'achievements' && <Achievements />}
        {activeTab === 'leaderboard' && <Leaderboard />}
        {activeTab === 'reminders' && <Reminders />}
        {activeTab === 'collaboration' && <div className="p-8 max-w-5xl mx-auto"><Collaboration /></div>}
        {activeTab === 'admin' && <div className="p-8 max-w-6xl mx-auto"><GodMode /></div>}
        
        <div className="p-8 max-w-5xl mx-auto space-y-8">
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <ProgressDashboard />

              <div className="bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-6">
                    <Avatar size={80} />
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
                  {saveStatus && <span className="text-green-500 text-xs font-bold animate-pulse">{saveStatus}</span>}
                </div>

                <form onSubmit={handleProfileSave} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Display Name</label>
                      <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                      <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all" />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Avatar Appearance</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2"><Smile size={12} /> Icon Emoji</label>
                        <input type="text" placeholder="e.g. 🤖" value={profileForm.avatar_emoji} onChange={e => setProfileForm({...profileForm, avatar_emoji: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all text-center text-xl" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2"><Palette size={12} /> Aura Color</label>
                        <div className="flex gap-3">
                          <input type="color" value={profileForm.avatar_color} onChange={e => setProfileForm({...profileForm, avatar_color: e.target.value})} className="h-12 w-20 bg-transparent border-none outline-none cursor-pointer" />
                          <input type="text" value={profileForm.avatar_color} onChange={e => setProfileForm({...profileForm, avatar_color: e.target.value})} className="flex-1 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl py-3 px-4 text-xs font-mono" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[var(--border)] flex justify-end">
                    <button type="submit" disabled={loading} className="flex items-center gap-2 bg-[var(--accent)] text-[var(--accent-foreground)] px-6 py-2.5 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50">
                      <Save size={18} /> Update Profile
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'personalities' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl p-8 shadow-sm">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="font-bold text-xl">Momo's Personalities</h3>
                  <p className="text-sm text-gray-500 mt-1">Unlock more character voices as you level up your XP.</p>
                </div>
                {saveStatus && <span className="text-green-500 text-xs font-bold animate-pulse">{saveStatus}</span>}
              </div>

              {loading && personalities.length === 0 ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]" /></div>
              ) : (
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
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
