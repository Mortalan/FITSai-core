import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Server, RefreshCw, List, ShieldAlert, Loader2, Cpu, 
  Map, MessageSquare, Terminal as TerminalIcon, FileCode, Users, 
  Brain, DollarSign, FileText, Crown, ChevronLeft, Image
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { RoadmapPanel } from './godmode/RoadmapPanel';
import { SuggestionsPanel } from './godmode/SuggestionsPanel';
import { CodeHealthPanel } from './godmode/CodeHealthPanel';
import { UserManagement } from './godmode/UserManagement';
import { ModelEvolution } from './godmode/ModelEvolution';
import { CorrectionPanel } from './godmode/CorrectionPanel';
import { BudgetMaster } from './godmode/BudgetMaster';
import { ChampionPanel } from './godmode/ChampionPanel';
import { HealthAlertsPanel } from './godmode/HealthAlertsPanel';
import { DocumentLibrary } from './Documents';
import { AssetManager } from './godmode/AssetManager';

const API_BASE_URL = 'http://10.0.0.231:9000/api/v1/admin';

export const GodMode: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [stats, setStats] = useState<string>('');
  const [logs, setLogs] = useState<string>('');
  const [selectedService, setSelectedService] = useState('momo-backend');
  const [isLoading, setIsLoading] = useState(false);
  const token = useAuthStore((state) => state.token);

  const adminApps = [
    { id: 'system', name: 'Service Control', icon: Server, color: 'bg-blue-500', desc: 'Manage journals and restarts' },
    { id: 'alerts', name: 'Health Alerts', icon: ShieldAlert, color: 'bg-red-500', desc: 'CPU, RAM, and Disk monitoring' },
    { id: 'budget', name: 'API Budgets', icon: DollarSign, color: 'bg-green-500', desc: 'Cost tracking and limits' },
    { id: 'users', name: 'User Directory', icon: Users, color: 'bg-purple-500', desc: 'Account provisioning' },
    { id: 'assets', name: 'Asset Manager', icon: Image, color: 'bg-yellow-600', desc: 'Upload class avatars' },
    { id: 'docs', name: 'System Docs', icon: FileText, color: 'bg-orange-500', desc: 'Internal arch documentation' },
    { id: 'code', name: 'Code Auditor', icon: FileCode, color: 'bg-cyan-500', desc: 'Security and technical debt' },
    { id: 'evolution', name: 'Model Strategy', icon: Cpu, color: 'bg-indigo-500', desc: 'Evolution state and coding model' },
    { id: 'correction', name: 'Self-Learning', icon: Brain, color: 'bg-pink-500', desc: 'Background accuracy metrics' },
    { id: 'champion', name: 'Monthly Award', icon: Crown, color: 'bg-yellow-500', desc: 'XP Audit and Hall of Fame' },
    { id: 'roadmap', name: 'System Roadmap', icon: Map, color: 'bg-emerald-500', desc: 'Feature tracker' },
    { id: 'suggestions', name: 'User Feedback', icon: MessageSquare, color: 'bg-rose-500', desc: 'Suggestion loop' },
  ];

  const services = [
    { id: 'momo-backend', name: 'Momo Backend' }, 
    { id: 'momo-frontend', name: 'Momo Frontend' }, 
    { id: 'ollama', name: 'Ollama AI' }, 
    { id: 'nginx', name: 'Nginx' }, 
    { id: 'felicia-backend', name: 'Legacy Core' }
  ];

  useEffect(() => { if (activeTab === 'system') fetchStats(); }, [activeTab]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const resp = await axios.get(`${API_BASE_URL}/stats`, { headers: { Authorization: `Bearer ${token}` } });
      setStats(resp.data.report);
    } catch (err) {} finally { setIsLoading(false); }
  };

  const fetchLogs = async (service: string) => {
    setIsLoading(true);
    try {
      const resp = await axios.get(`${API_BASE_URL}/logs/${service}`, { headers: { Authorization: `Bearer ${token}` } });
      setLogs(resp.data.logs); setSelectedService(service);
    } catch (err) {} finally { setIsLoading(false); }
  };

  const restartService = async (service: string) => {
    if (!window.confirm(`Restart ${service}?`)) return;
    try { await axios.post(`${API_BASE_URL}/service/${service}/restart`, {}, { headers: { Authorization: `Bearer ${token}` } }); alert('Restart initiated'); } catch (err) {}
  };

  if (activeTab) {
    return (
      <div className="space-y-10 animate-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between">
          <button onClick={() => setActiveTab(null)} className="flex items-center gap-2 text-gray-500 hover:text-[var(--foreground)] font-bold transition-all bg-[var(--input-bg)] px-5 py-2.5 rounded-2xl"><ChevronLeft size={18} /> Dashboard</button>
          <div className="px-4 py-2 bg-[var(--accent)]/5 border border-[var(--accent)]/10 rounded-xl"><span className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest">Admin Perspective Active</span></div>
        </div>

        {activeTab === 'system' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 animate-in fade-in duration-300">
            <div className="xl:col-span-1 space-y-10">
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2"><h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Metrics</h3><button onClick={fetchStats} className="p-2 hover:bg-black/5 rounded-xl transition-all"><RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /></button></div>
                <pre className="bg-black text-green-500/80 p-8 rounded-[32px] font-mono text-[11px] leading-relaxed overflow-y-auto max-h-[300px] border border-gray-800 shadow-2xl">{stats || 'Fetching...'}</pre>
              </div>
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 px-2">Services</h3>
                <div className="space-y-3">
                  {services.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-6 bg-[var(--sidebar)] rounded-[24px] border border-[var(--border)] group hover:border-[var(--accent)] transition-all shadow-sm">
                      <span className="text-sm font-bold">{s.name}</span>
                      <div className="flex items-center gap-2"><button onClick={() => fetchLogs(s.id)} className="p-2.5 hover:bg-[var(--accent)]/10 text-gray-400 hover:text-[var(--accent)] rounded-xl transition-all"><List size={18} /></button><button onClick={() => restartService(s.id)} className="p-2.5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-xl transition-all"><RefreshCw size={18} /></button></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="xl:col-span-2">
              <div className="bg-black rounded-[40px] overflow-hidden border border-gray-800 shadow-2xl h-full min-h-[700px] flex flex-col">
                <div className="bg-gray-900 px-10 py-5 border-b border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-4"><TerminalIcon size={18} className="text-green-500" /><span className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em]">Journal Stream • {selectedService}</span></div>
                  <button onClick={() => fetchLogs(selectedService)} className="text-gray-500 hover:text-green-500 transition-colors"><RefreshCw size={16} /></button>
                </div>
                <div className="flex-1 p-10 overflow-y-auto custom-scrollbar font-mono text-[13px] leading-relaxed text-green-500/90"><pre className="whitespace-pre-wrap">{logs || `Momo Control v2.2.4\nSelect a service to stream journals...\n\nReady.`}</pre></div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'alerts' && <HealthAlertsPanel />}
        {activeTab === 'budget' && <BudgetMaster />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'assets' && <AssetManager />}
        {activeTab === 'docs' && <DocumentLibrary type="KB" forceCategory="GOD_MODE" />}
        {activeTab === 'code' && <CodeHealthPanel />}
        {activeTab === 'evolution' && <ModelEvolution />}
        {activeTab === 'correction' && <CorrectionPanel />}
        {activeTab === 'champion' && <ChampionPanel />}
        {activeTab === 'roadmap' && <RoadmapPanel />}
        {activeTab === 'suggestions' && <SuggestionsPanel />}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="flex items-center gap-8 mb-4">
        <div className="p-5 bg-red-500 text-white rounded-[28px] shadow-xl shadow-red-500/20"><ShieldAlert size={48} /></div>
        <div><h1 className="text-4xl font-bold tracking-tighter uppercase">God Mode</h1><p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Master Administrative Hub</p></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {adminApps.map(app => (
          <button key={app.id} onClick={() => setActiveTab(app.id)} className="group p-10 bg-[var(--sidebar)] border border-[var(--border)] rounded-[40px] hover:border-[var(--accent)] transition-all text-left shadow-sm hover:shadow-2xl relative overflow-hidden">
            <div className={`w-14 h-14 ${app.color} text-white rounded-[20px] flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform`}>
              <app.icon size={28} />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-3 group-hover:text-[var(--accent)] transition-colors">{app.name}</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">{app.desc}</p>
            <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-10 transition-opacity"><app.icon size={160} /></div>
          </button>
        ))}
      </div>
    </div>
  );
};
