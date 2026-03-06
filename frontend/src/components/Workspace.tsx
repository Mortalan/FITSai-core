import React, { useState, useEffect } from 'react';
import { 
  User, ShieldAlert, Palette, DollarSign, Users, FileText, Award, Trophy, 
  Bell, Edit2, Save, Smile, BookOpen, Mic, FileCode2, ChevronRight, Zap, Sparkles, Download
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { GodMode } from './GodMode';
import { DocumentLibrary } from './Documents';
import { Achievements } from './Achievements';
import { Leaderboard } from './Leaderboard';
import { Reminders } from './Reminders';
import { Avatar } from './Avatar';
import { ProgressDashboard } from './ProgressDashboard';
import { Collaboration } from './Collaboration';
import { MeetingTranscription } from './godmode/MeetingTranscription';
import { CLIDownloads } from './godmode/CLIDownloads';
import { listPersonalities, updateProfile } from '../api';
import { Lock, CheckCircle2 } from 'lucide-react';

export const Workspace: React.FC<{ defaultTab?: string, onInitProjectChat: (pid: number) => void }> = ({ defaultTab = 'profile', onInitProjectChat }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [personalities, setPersonalities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    equipped_title: user?.equipped_title || '',
    avatar_emoji: user?.special_effects?.emoji || '🤖',
    avatar_color: user?.special_effects?.color || '#3b82f6',
    avatar_background: user?.avatar_customization?.background || 'none'
  });

  useEffect(() => {
    if (activeTab === 'personalities') {
      setLoading(true);
      listPersonalities().then(data => setPersonalities(Array.isArray(data) ? data : [])).finally(() => setLoading(false));
    }
  }, [activeTab]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateProfile(profileForm);
      updateUser(res.user);
      setSaveStatus('Identity Synced!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) { alert('Sync failed'); }
    setLoading(false);
  };

  const menuSections = [
    { title: "Identity", items: [{ id: 'profile', name: 'Identity & Stats', icon: User }, { id: 'personalities', name: 'Momo Voice', icon: Palette }] },
    { title: "Technical", items: [{ id: 'sops', name: 'Standard Procedures', icon: FileCode2 }, { id: 'docs', name: 'Knowledge Base', icon: BookOpen }, { id: 'meetings', name: 'Transcription', icon: Mic }, { id: 'cli', name: 'CLI Tools', icon: Download }] },
    { title: "Team", items: [{ id: 'collaboration', name: 'Project Team', icon: Users }, { id: 'reminders', name: 'Task Reminders', icon: Bell }] },
    { title: "Prestige", items: [{ id: 'achievements', name: 'Achievements', icon: Award }, { id: 'leaderboard', name: 'Leaderboard', icon: Trophy }] }
  ];

  if (user?.is_superuser) menuSections.push({ title: "System", items: [{ id: 'admin', name: 'God Mode', icon: ShieldAlert }] });

  return (
    <div className="flex h-full font-sans bg-[var(--background)] animate-in fade-in duration-700">
      <div className="w-72 flex-shrink-0 bg-[var(--sidebar)] border-r border-[var(--border)] p-8 overflow-y-auto custom-scrollbar flex flex-col">
        <div className="mb-10"><h2 className="text-2xl font-black tracking-tighter text-[var(--foreground)]">Workspace</h2><p className="text-gray-500 font-bold uppercase text-[9px] tracking-widest mt-1">Momo Core v2.1.7</p></div>
        <div className="space-y-8">
          {menuSections.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 px-2">{section.title}</h3>
              <div className="space-y-1">
                {section.items.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all font-bold text-sm ${activeTab === tab.id ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20' : 'text-gray-500 hover:bg-[var(--input-bg)]'}`}>
                    <div className="flex items-center gap-3"><tab.icon size={18} /><span className="whitespace-nowrap">{tab.name}</span></div>
                    <ChevronRight size={14} className={activeTab === tab.id ? 'opacity-100' : 'opacity-0'} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-[var(--background)] overflow-y-auto custom-scrollbar">
        <div className="p-10 max-w-6xl mx-auto pb-32">
          {activeTab === 'profile' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <ProgressDashboard />
              <div className="bg-[var(--sidebar)] border border-[var(--border)] rounded-[40px] p-10 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-8">
                    <Avatar size={120} />
                    <div className="space-y-2">
                      <div className="flex items-center gap-3"><h2 className="text-4xl font-black tracking-tighter">{user?.name}</h2>{user?.is_superuser && <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[9px] font-black uppercase rounded border border-red-500/20">System Admin</span>}</div>
                      <p className="text-lg font-bold text-[var(--accent)]">{user?.equipped_title || 'Novice Technician'}</p>
                      <p className="text-sm text-gray-500 font-medium">{user?.email}</p>
                    </div>
                  </div>
                  {saveStatus && <span className="text-green-500 text-xs font-black uppercase tracking-widest animate-bounce">{saveStatus}</span>}
                </div>
                <form onSubmit={handleProfileUpdate} className="space-y-10">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Display Identity</label><input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-[var(--accent)]/10 font-bold" /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Active Title</label>
                      <select value={profileForm.equipped_title} onChange={e => setProfileForm({...profileForm, equipped_title: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-2xl py-4 px-6 outline-none font-bold">
                        <option value="">No Title Equipped</option>
                        {user?.titles?.map((t: string) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2"><Sparkles size={14} className="text-yellow-500" /> Visual Identity Customization</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Avatar Icon</label>
                        <input type="text" value={profileForm.avatar_emoji} onChange={e => setProfileForm({...profileForm, avatar_emoji: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-2xl py-4 text-center text-2xl" placeholder="e.g. 🤖" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Aura Color</label>
                        <div className="flex gap-2">
                          <input type="color" value={profileForm.avatar_color} onChange={e => setProfileForm({...profileForm, avatar_color: e.target.value})} className="h-[60px] w-20 bg-transparent border-none outline-none cursor-pointer" />
                          <input type="text" value={profileForm.avatar_color} onChange={e => setProfileForm({...profileForm, avatar_color: e.target.value})} className="flex-1 bg-[var(--input-bg)] border border-[var(--border)] rounded-2xl py-4 px-4 text-xs font-mono" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Background Effect</label>
                        <select value={profileForm.avatar_background} onChange={e => setProfileForm({...profileForm, avatar_background: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-2xl py-4 px-4 font-bold text-sm">
                          <option value="none">Standard (None)</option>
                          <option value="glow">Level 10: Subtle Glow</option>
                          <option value="border">Level 20: Tech Border</option>
                          <option value="cosmic">Level 40: Cosmic Aura</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4"><button type="submit" disabled={loading} className="bg-[var(--accent)] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-[var(--accent)]/30 hover:scale-105 transition-all">Synchronize Production Identity</button></div>
                </form>
              </div>
            </div>
          )}
          {activeTab === 'personalities' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 bg-[var(--sidebar)] border border-[var(--border)] rounded-[40px] p-10 shadow-sm">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="font-black text-3xl tracking-tighter">Momo Voice</h3>
                  <p className="text-gray-500 font-medium mt-1">Unlock more character voices as you level up your XP.</p>
                </div>
                {saveStatus && <span className="text-green-500 text-xs font-black uppercase animate-pulse">{saveStatus}</span>}
              </div>

              {loading && personalities.length === 0 ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]" /></div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {personalities.map((p) => (
                    <div 
                      key={p.id}
                      onClick={() => p.is_unlocked && handleProfileUpdate({ ...profileForm, active_personality_id: p.id } as any)}
                      className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative group ${
                        user?.active_personality_id === p.id 
                          ? 'border-[var(--accent)] bg-[var(--accent)]/5' 
                          : p.is_unlocked ? 'border-[var(--border)] hover:border-[var(--accent)]/50' : 'border-gray-100 opacity-60 grayscale'
                      }`}
                    >
                      {!p.is_unlocked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 dark:bg-black/40 z-10 rounded-3xl">
                          <Lock size={24} className="text-gray-400 mb-2" />
                          <span className="text-xs font-black uppercase tracking-widest text-gray-500">LVL {p.unlock_level}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-lg font-black capitalize tracking-tight">{p.name.replace(/_/g, ' ')}</span>
                        {user?.active_personality_id === p.id && <CheckCircle2 size={20} className="text-[var(--accent)]" />}
                      </div>
                      <p className="text-sm text-gray-500 font-medium leading-relaxed">{p.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 'sops' && <DocumentLibrary type="SOP" />}
          {activeTab === 'docs' && <DocumentLibrary type="KB" />}
          {activeTab === 'meetings' && <MeetingTranscription />}
          {activeTab === 'cli' && <CLIDownloads />}
          {activeTab === 'achievements' && <Achievements />}
          {activeTab === 'leaderboard' && <Leaderboard />}
          {activeTab === 'reminders' && <Reminders />}
          {activeTab === 'collaboration' && <Collaboration onInitProjectChat={onInitProjectChat} />}
          {activeTab === 'admin' && <GodMode />}
        </div>
      </div>
    </div>
  );
};
