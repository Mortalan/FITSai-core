import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Server, Activity, RefreshCw, List, ShieldAlert, Loader2, Cpu, HardDrive, Database } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = 'http://10.0.0.231:9000/api/v1/admin';

export const GodMode: React.FC = () => {
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
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const resp = await axios.get(`${API_BASE_URL}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(resp.data.report);
    } catch (err) {
      console.error('Stats fetch failed', err);
    } finally {
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
    } catch (err) {
      console.error('Logs fetch failed', err);
    } finally {
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
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
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
        <button 
          onClick={fetchStats}
          disabled={isLoading}
          className="flex items-center gap-2 bg-[var(--sidebar)] border border-[var(--border)] px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
        >
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
          Refresh System Stats
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="text-[var(--accent)]" size={20} />
              <h2 className="font-bold uppercase text-xs tracking-widest">Real-time Metrics</h2>
            </div>
            <pre className="text-[11px] font-mono leading-relaxed whitespace-pre-wrap text-gray-600 dark:text-gray-400">
              {stats || 'No stats available. Click refresh.'}
            </pre>
          </div>

          <div className="bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Server className="text-[var(--accent)]" size={20} />
              <h2 className="font-bold uppercase text-xs tracking-widest">Service Control</h2>
            </div>
            <div className="space-y-2">
              {services.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-white dark:bg-black/20 rounded-xl border border-[var(--border)] group hover:border-[var(--accent)] transition-all">
                  <span className="text-sm font-bold">{s.name}</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => fetchLogs(s.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-400 hover:text-[var(--accent)] transition-colors"
                      title="View Logs"
                    >
                      <List size={16} />
                    </button>
                    <button 
                      onClick={() => restartService(s.id)}
                      disabled={isActionLoading}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                      title="Restart Service"
                    >
                      <RefreshCw size={16} className={isActionLoading && selectedService === s.id ? 'animate-spin' : ''} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Log Viewer */}
        <div className="lg:col-span-2">
          <div className="bg-black text-green-500 font-mono rounded-3xl overflow-hidden shadow-2xl border border-gray-800 h-full flex flex-col min-h-[600px]">
            <div className="bg-gray-900 px-6 py-3 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                </div>
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-[0.2em] ml-4">
                  Terminal • {selectedService} logs
                </span>
              </div>
              <button onClick={() => fetchLogs(selectedService)} className="text-gray-500 hover:text-green-500 transition-colors">
                <RefreshCw size={14} />
              </button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
              <pre className="text-[12px] leading-relaxed whitespace-pre-wrap">
                {logs || `Momo Shell v1.6.1\nWaiting for log stream selection...\n\nSelect a service from the left to view system journals.`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
