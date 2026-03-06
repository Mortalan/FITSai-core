import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Server, Activity, RefreshCw, List, ShieldAlert, Loader2, Cpu, Map, MessageSquare, Terminal as TerminalIcon, FileCode, Users, Brain, Mic, DollarSign, FileText, Crown, Download } from 'lucide-react';
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

const API_BASE_URL = 'http://10.0.0.231:9000/api/v1/admin';

export const GodMode: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'system' | 'roadmap' | 'suggestions' | 'code' | 'users' | 'evolution' | 'correction' | 'meetings' | 'budget' | 'docs' | 'champion' | 'cli'>('system');
  const [stats, setStats] = useState<string>('');
  const [logs, setLogs] = useState<string>('');
  const [selectedService, setSelectedService] = useState('momo-backend');
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const token = useAuthStore((state) => state.token);

  const services = [
    { id: 'momo-backend', name: 'Momo Backend' },
    { id: 'momo-frontend', name: 'Momo Frontend' },
    { id: 'ollama', name: 'Ollama AI' },
    { id: 'nginx', name: 'Nginx Web Server' },
    { id: 'felicia-backend', name: 'Legacy Felicia' }
  ];

  useEffect(() => {
    if (activeTab === 'system') fetchStats();
  }, [activeTab]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const resp = await axios.get(`${API_BASE_URL}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(resp.data.report);
    } catch (err) {} finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async (service: string) => {
    setIsLoading(true);
    try {
      const resp = await axios.get(`${API_BASE_URL}/logs/${service}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(resp.data.logs);
      setSelectedService(service);
    } catch (err) {} finally {
      setIsLoading(false);
    }
  };

  const restartService = async (service: string) => {
    if (!window.confirm(`Are you sure you want to restart ${service}?`)) return;
    setIsActionLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/service/${service}/restart`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`${service} restart initiated.`);
    } catch (err) {
      alert('Restart failed. Check console for details.');
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight uppercase tracking-tighter">God Mode</h1>
            <p className="text-gray-500 font-medium uppercase text-[10px] tracking-[0.2em]">FITSai-Core Master Control Panel</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-[var(--input-bg)] w-fit rounded-2xl border border-[var(--border)] overflow-x-auto max-w-full custom-scrollbar">
        <button onClick={() => setActiveTab('system')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'system' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-gray-500 hover:bg-black/5'}`}><Server size={14} /> System</button>
        <button onClick={() => setActiveTab('budget')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'budget' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-gray-500 hover:bg-black/5'}`}><DollarSign size={14} /> Budget</button>
        <button onClick={() => setActiveTab('users')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'users' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-gray-500 hover:bg-black/5'}`}><Users size={14} /> Users</button>
        <button onClick={() => setActiveTab('docs')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'docs' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-gray-500 hover:bg-black/5'}`}><FileText size={14} /> Knowledge</button>
        <button onClick={() => setActiveTab('code')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'code' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-gray-500 hover:bg-black/5'}`}><FileCode size={14} /> Code</button>
        <button onClick={() => setActiveTab('evolution')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'evolution' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-gray-500 hover:bg-black/5'}`}><Cpu size={14} /> Models</button>
        <button onClick={() => setActiveTab('correction')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'correction' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-gray-500 hover:bg-black/5'}`}><Brain size={14} /> Learning</button>
        <button onClick={() => setActiveTab('champion')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'champion' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-gray-500 hover:bg-black/5'}`}><Crown size={14} /> Champion</button>
        <button onClick={() => setActiveTab('cli')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'cli' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-gray-400 hover:bg-black/5'}`}><Download size={14} /> CLI Tools</button>
        <button onClick={() => setActiveTab('meetings')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'meetings' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-gray-500 hover:bg-black/5'}`}><Mic size={14} /> Transcription</button>
        <button onClick={() => setActiveTab('roadmap')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'roadmap' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-gray-500 hover:bg-black/5'}`}><Map size={14} /> Roadmap</button>
        <button onClick={() => setActiveTab('suggestions')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'suggestions' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-gray-500 hover:bg-black/5'}`}><MessageSquare size={14} /> Suggestions</button>
      </div>

      <div className="min-h-[600px]">
        {activeTab === 'system' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Activity className="text-[var(--accent)]" size={20} />
                    <h2 className="font-bold uppercase text-xs tracking-widest">Metrics</h2>
                  </div>
                  <button onClick={fetchStats} className="p-1.5 hover:bg-black/5 rounded-lg transition-colors"><RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /></button>
                </div>
                <pre className="text-[11px] font-mono leading-relaxed whitespace-pre-wrap text-gray-600 dark:text-gray-400 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {stats || 'No stats available.'}
                </pre>
              </div>

              <div className="bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Server className="text-[var(--accent)]" size={20} />
                  <h2 className="font-bold uppercase text-xs tracking-widest">Services</h2>
                </div>
                <div className="space-y-2">
                  {services.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-white dark:bg-black/20 rounded-xl border border-[var(--border)] group hover:border-[var(--accent)] transition-all">
                      <span className="text-sm font-bold">{s.name}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => fetchLogs(s.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-400 hover:text-[var(--accent)] transition-colors"><List size={16} /></button>
                        <button onClick={() => restartService(s.id)} disabled={isActionLoading} className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 transition-colors"><RefreshCw size={16} className={isActionLoading && selectedService === s.id ? 'animate-spin' : ''} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-black text-green-500 font-mono rounded-3xl overflow-hidden shadow-2xl border border-gray-800 h-full flex flex-col min-h-[600px]">
                <div className="bg-gray-900 px-6 py-3 border-b border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TerminalIcon size={14} />
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-[0.2em]">Journalctl • {selectedService}</span>
                  </div>
                  <button onClick={() => fetchLogs(selectedService)} className="text-gray-500 hover:text-green-500 transition-colors"><RefreshCw size={14} /></button>
                </div>
                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                  <pre className="text-[12px] leading-relaxed whitespace-pre-wrap">{logs || `Waiting for selection...`}</pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'budget' && <BudgetMaster />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'docs' && <DocsPanel />}
        {activeTab === 'code' && <CodeHealthPanel />}
        {activeTab === 'evolution' && <ModelEvolution />}
        {activeTab === 'correction' && <CorrectionPanel />}
        {activeTab === 'meetings' && <MeetingTranscription />}
        {activeTab === 'champion' && <ChampionPanel />}
        {activeTab === 'cli' && <CLIDownloads />}
        {activeTab === 'roadmap' && <RoadmapPanel />}
        {activeTab === 'suggestions' && <SuggestionsPanel />}
      </div>
    </div>
  );
};
