import React, { useState, useEffect } from 'react';
import { User, ShieldAlert, Palette, Lock, CheckCircle2, DollarSign, Users, BarChart3, Clock, FileText, Award, Trophy, Bell } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { GodMode } from './GodMode';
import { DocumentLibrary } from './Documents';
import { Achievements } from './Achievements';
import { Leaderboard } from './Leaderboard';
import { Reminders } from './Reminders';
import { listPersonalities, updateProfile } from '../api';
import axios from 'axios';

export const Workspace: React.FC<{ defaultTab?: string }> = ({ defaultTab = 'profile' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const updateUser = useAuthStore((state) => state.updateUser);
  
  const [personalities, setPersonalities] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [usage, setUsage] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

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
    if (activeTab === 'budget' && token) {
      setLoading(true);
      Promise.all([
        axios.get('http://10.0.0.231:9000/api/v1/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://10.0.0.231:9000/api/v1/admin/budgets', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://10.0.0.231:9000/api/v1/admin/usage', { headers: { Authorization: `Bearer ${token}` } })
      ]).then(([s, b, u]) => {
        setStats(s.data);
        setBudgets(b.data);
        setUsage(u.data);
      }).finally(() => setLoading(false));
    }
  }, [activeTab, token]);

  const handlePersonalitySelect = async (id: number) => {
    setLoading(true);
    try {
      await updateProfile({ active_personality_id: id });
      updateUser({ active_personality_id: id });
      setSaveStatus('Personality updated!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {}
    setLoading(false);
  };

  const menuSections = [
    {
      title: "Personal",
      items: [
        { id: 'profile', name: 'Profile', icon: User },
        { id: 'personalities', name: 'Character Voice', icon: Palette },
        { id: 'reminders', name: 'Reminders', icon: Bell },
      ]
    },
    {
      title: "Company",
      items: [
        { id: 'docs', name: 'Knowledge Base', icon: FileText },
        { id: 'collaboration', name: 'Collaboration', icon: Users },
      ]
    },
    {
      title: "Gamification",
      items: [
        { id: 'achievements', name: 'Achievements', icon: Award },
        { id: 'leaderboard', name: 'Leaderboard', icon: Trophy },
      ]
    }
  ];

  if (user?.is_superuser || user?.email === 'louisp@fits.net.za') {
    menuSections.push({
      title: "Admin",
      items: [
        { id: 'budget', name: 'Budget Control', icon: DollarSign },
        { id: 'admin', name: 'God Mode', icon: ShieldAlert },
      ]
    });
  }

  return (
    <div className="flex h-full font-sans">
      {/* Workspace Sidebar */}
      <div className="w-64 bg-[var(--sidebar)] border-r border-[var(--border)] p-6 overflow-y-auto custom-scrollbar">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Workspace</h2>
          <p className="text-gray-500 font-medium uppercase text-[10px] tracking-widest mt-1">Hub & Settings</p>
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

      {/* Content Area */}
      <div className="flex-1 bg-[var(--background)] overflow-y-auto custom-scrollbar">
        {activeTab === 'docs' && <DocumentLibrary />}
        {activeTab === 'achievements' && <Achievements />}
        {activeTab === 'leaderboard' && <Leaderboard />}
        {activeTab === 'reminders' && <Reminders />}
        {activeTab === 'admin' && <div className="p-8"><GodMode /></div>}
        
        {/* Settings Content */}
        <div className="p-8 max-w-5xl mx-auto">
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl p-8 shadow-sm">
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
              <p className="text-sm text-gray-400">Use the sidebar to navigate your workspace and customize your experience.</p>
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

          {activeTab === 'collaboration' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl p-8 shadow-sm">
              <h3 className="font-bold text-xl">Collaboration & Peer Linking</h3>
              <p className="text-sm text-gray-500">Connect with colleagues who have solved similar technical issues.</p>
              
              <div className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-2xl">
                <h4 className="font-bold text-blue-600 mb-2">How it works</h4>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Momo automatically analyzes Knowledge Base contributions and technical discussions. 
                  When you ask a complex question, she'll suggest reaching out to specific peers who have 
                  demonstrated expertise in that domain.
                </p>
              </div>

              <div className="grid gap-4 pt-4">
                <div className="flex items-center justify-between p-4 bg-[var(--input-bg)]/50 rounded-2xl border border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center font-bold">L</div>
                    <div>
                      <span className="text-sm font-bold">Louis (Admin)</span>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Expert: Infrastructure, Security</p>
                    </div>
                  </div>
                  <CheckCircle2 size={16} className="text-green-500" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'budget' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl p-8 shadow-sm">
              <h3 className="font-bold text-xl">Budget & Usage Control</h3>
              {loading ? <div className="animate-pulse h-20 bg-gray-100 rounded-2xl" /> : (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-6 bg-[var(--input-bg)] rounded-3xl border border-[var(--border)]">
                      <BarChart3 size={20} className="text-blue-500 mb-2" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Total API Spend</span>
                      <p className="text-2xl font-bold">${stats?.total_api_spend?.toFixed(2)}</p>
                    </div>
                    <div className="p-6 bg-[var(--input-bg)] rounded-3xl border border-[var(--border)]">
                      <Users size={20} className="text-green-500 mb-2" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Active Users</span>
                      <p className="text-2xl font-bold">{stats?.users}</p>
                    </div>
                    <div className="p-6 bg-[var(--input-bg)] rounded-3xl border border-[var(--border)]">
                      <Clock size={20} className="text-purple-500 mb-2" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Monthly Refresh</span>
                      <p className="text-2xl font-bold">25 Days</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400">Department Budgets</h4>
                    <div className="border border-[var(--border)] rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-[var(--input-bg)]">
                          <tr>
                            <th className="p-4 font-bold">Department</th>
                            <th className="p-4 font-bold">Limit (USD)</th>
                            <th className="p-4 font-bold">Current Spend</th>
                            <th className="p-4 font-bold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                          {budgets.length === 0 ? <tr><td colSpan={4} className="p-4 text-center text-gray-400">No budget limits configured.</td></tr> : budgets.map(b => (
                            <tr key={b.id}>
                              <td className="p-4 font-medium">{b.department_id}</td>
                              <td className="p-4">${b.monthly_limit}</td>
                              <td className="p-4">${b.current_spend.toFixed(4)}</td>
                              <td className="p-4"><span className="px-2 py-0.5 bg-green-500/10 text-green-600 text-[10px] font-bold rounded-full">HEALTHY</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
