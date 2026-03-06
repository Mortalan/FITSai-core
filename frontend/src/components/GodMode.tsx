import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Server, Activity, RefreshCw, List, ShieldAlert, Loader2, Cpu, 
  Map, MessageSquare, Terminal as TerminalIcon, FileCode, Users, 
  Brain, Mic, DollarSign, FileText, Crown, Download, ChevronRight, LayoutDashboard
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { RoadmapPanel } from './godmode/RoadmapPanel';
import { SuggestionsPanel } from './godmode/SuggestionsPanel';
import { CodeHealthPanel } from './godmode/CodeHealthPanel';
import { UserManagement } from './godmode/UserManagement';
import { ModelEvolution } from './godmode/ModelEvolution';
import { CorrectionPanel } from './godmode/CorrectionPanel';
import { MeetingTranscription } from './godmode/MeetingTranscription';
import { BudgetMaster } from './godmode/BudgetMaster';
import { DocsPanel } from './godmode/DocsPanel';
import { ChampionPanel } from './godmode/ChampionPanel';
import { CLIDownloads } from './godmode/CLIDownloads';
import { HealthAlertsPanel } from './godmode/HealthAlertsPanel';

const API_BASE_URL = 'http://10.0.0.231:9000/api/v1/admin';

export const GodMode: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('system');
  const [stats, setStats] = useState<string>('');
  const [logs, setLogs] = useState<string>('');
  const [selectedService, setSelectedService] = useState('momo-backend');
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const token = useAuthStore((state) => state.token);

  const menuItems = [
    { id: 'system', name: 'Service Control', icon: Server, color: 'text-blue-500' },
    { id: 'alerts', name: 'Health Alerts', icon: ShieldAlert, color: 'text-red-500' },
    { id: 'budget', name: 'API Budgets', icon: DollarSign, color: 'text-green-500' },
    { id: 'users', name: 'User Directory', icon: Users, color: 'text-purple-500' },
    { id: 'docs', name: 'Knowledge Base', icon: FileText, color: 'text-orange-500' },
    { id: 'code', name: 'Code Auditor', icon: FileCode, color: 'text-cyan-500' },
    { id: 'evolution', name: 'Model Strategy', icon: Cpu, color: 'text-indigo-500' },
    { id: 'correction', name: 'Self-Learning', icon: Brain, color: 'text-pink-500' },
    { id: 'champion', name: 'Monthly Award', icon: Crown, color: 'text-yellow-500' },
    { id: 'meetings', name: 'Transcription', icon: Mic, color: 'text-violet-500' },
    { id: 'cli', name: 'CLI Tools', icon: Download, color: 'text-gray-500' },
    { id: 'roadmap', name: 'System Roadmap', icon: Map, color: 'text-emerald-500' },
    { id: 'suggestions', name: 'User Feedback', icon: MessageSquare, color: 'text-rose-500' },
  ];

  const services = [
    { id: 'momo-backend', name: 'Momo Backend' },
    { id: 'momo-frontend', name: 'Momo Frontend' },
    { id: 'ollama', name: 'Ollama AI' },
    { id: 'nginx', name: 'Nginx Proxy' },
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
    setIsActionLoading(true);
    try { await axios.post(`${API_BASE_URL}/service/${service}/restart`, {}, { headers: { Authorization: `Bearer ${token}` } }); } catch (err) {} finally { setIsActionLoading(false); }
  };

  return (
    <div className="flex h-full gap-8 animate-in fade-in duration-500">
      {/* Sidebar Navigation */}
      <div className="w-72 flex-shrink-0 space-y-6">
        <div className="flex items-center gap-4 px-2">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 shadow-sm"><ShieldAlert size={32} /></div>
          <div><h1 className="text-2xl font-black uppercase tracking-tighter">God Mode</h1><p className="text-gray-500 font-bold uppercase text-[9px] tracking-widest">Control Center</p></div>
        </div>

        <div className="bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl p-3 shadow-sm space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all ${
                activeTab === item.id 
                  ? 'bg-[var(--accent)] text-white shadow-lg' 
                  : 'text-gray-500 hover:bg-[var(--input-bg)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className={activeTab === item.id ? 'text-white' : item.color} />
                <span className="text-sm font-bold">{item.name}</span>
              </div>
              <ChevronRight size={14} className={activeTab === item.id ? 'opacity-100' : 'opacity-0'} />
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 pb-12">
        <div className="bg-[var(--sidebar)] border border-[var(--border)] rounded-[40px] p-10 shadow-sm min-h-full">
          {activeTab === 'system' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in duration-300">
              <div className="xl:col-span-1 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">System Metrics</h3>
                    <button onClick={fetchStats} className="p-2 hover:bg-black/5 rounded-xl transition-all"><RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /></button>
                  </div>
                  <pre className="bg-black text-green-500/80 p-6 rounded-3xl font-mono text-[11px] leading-relaxed overflow-y-auto max-h-[300px] border border-gray-800">{stats || 'Fetching...'}</pre>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Service Manager</h3>
                  <div className="space-y-2">
                    {services.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-4 bg-white dark:bg-black/20 rounded-2xl border border-[var(--border)] group hover:border-[var(--accent)] transition-all">
                        <span className="text-sm font-bold">{s.name}</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => fetchLogs(s.id)} className="p-2 hover:bg-[var(--accent)]/10 text-gray-400 hover:text-[var(--accent)] rounded-xl"><List size={18} /></button>
                          <button onClick={() => restartService(s.id)} className="p-2 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-xl"><RefreshCw size={18} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="xl:col-span-2">
                <div className="bg-black rounded-[32px] overflow-hidden border border-gray-800 shadow-2xl h-full min-h-[650px] flex flex-col">
                  <div className="bg-gray-900 px-8 py-4 border-b border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TerminalIcon size={16} className="text-green-500" />
                      <span className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Terminal • {selectedService}</span>
                    </div>
                    <button onClick={() => fetchLogs(selectedService)} className="text-gray-500 hover:text-green-500 transition-colors"><RefreshCw size={14} /></button>
                  </div>
                  <div className="flex-1 p-8 overflow-y-auto custom-scrollbar font-mono text-[13px] leading-relaxed text-green-500/90">
                    <pre className="whitespace-pre-wrap">{logs || `Momo Control v2.1.2\nSelect a service to stream journals...\n\nReady.`}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && <HealthAlertsPanel />}
          {activeTab === 'budget' && <BudgetMaster />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'docs' && <DocsPanel />}
          {activeTab === 'code' && <CodeHealthPanel />}
          {activeTab === 'evolution' && <ModelEvolution />}
          {activeTab === 'correction' && <CorrectionPanel />}
          {activeTab === 'champion' && <ChampionPanel />}
          {activeTab === 'cli' && <CLIDownloads />}
          {activeTab === 'meetings' && <MeetingTranscription />}
          {activeTab === 'roadmap' && <RoadmapPanel />}
          {activeTab === 'suggestions' && <SuggestionsPanel />}
        </div>
      </div>
    </div>
  );
};
