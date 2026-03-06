import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, RefreshCw, Play, Clock, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

const API_BASE_URL = 'http://10.0.0.231:9000/api/v1/code-health';

export const CodeHealthPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'issues' | 'history'>('issues');
  const [summary, setSummary] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const token = useAuthStore((state) => state.token);

  useEffect(() => { fetchData(); }, [activeTab, token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [s, st] = await Promise.all([
        axios.get(`${API_BASE_URL}/summary`, config),
        axios.get(`${API_BASE_URL}/status`, config)
      ]);
      setSummary(s.data);
      setStatus(st.data);
      if (activeTab === 'issues') {
        const res = await axios.get(`${API_BASE_URL}/issues`, config);
        setIssues(res.data);
      } else {
        const res = await axios.get(`${API_BASE_URL}/history`, config);
        setHistory(res.data);
      }
    } catch (err) {}
    setLoading(false);
  };

  const handleTriggerScan = async () => {
    setScanning(true);
    try {
      await axios.post(`${API_BASE_URL}/scan`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert('Code scan started in background');
      setTimeout(fetchData, 2000);
    } catch (err) { alert('Failed to start scan'); }
    setScanning(false);
  };

  if (loading && !summary) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[var(--accent)]" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--sidebar)] p-6 border border-[var(--border)] rounded-3xl shadow-sm">
        <div>
          <h3 className="text-xl font-bold">Autonomous Code Auditor</h3>
          <p className="text-sm text-gray-500 mt-1">Momo scans the codebase for security, performance, and best practices.</p>
        </div>
        <button onClick={handleTriggerScan} disabled={scanning || status?.status === 'running'} className="flex items-center gap-2 bg-[var(--accent)] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50">
          {scanning || status?.status === 'running' ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />} 
          Run System Audit
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl"><p className="text-[10px] font-bold text-red-500 uppercase">Critical</p><p className="text-2xl font-bold">{summary?.critical || 0}</p></div>
        <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl"><p className="text-[10px] font-bold text-yellow-500 uppercase">Warnings</p><p className="text-2xl font-bold">{summary?.warning || 0}</p></div>
        <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl"><p className="text-[10px] font-bold text-blue-500 uppercase">Info</p><p className="text-2xl font-bold">{summary?.info || 0}</p></div>
        <div className="p-4 bg-[var(--input-bg)] border border-[var(--border)] rounded-2xl"><p className="text-[10px] font-bold text-gray-400 uppercase">Total Issues</p><p className="text-2xl font-bold">{summary?.total || 0}</p></div>
      </div>

      <div className="flex gap-4 border-b border-[var(--border)]">
        <button onClick={() => setActiveTab('issues')} className={`pb-2 px-1 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'issues' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-gray-400'}`}>Detected Issues</button>
        <button onClick={() => setActiveTab('history')} className={`pb-2 px-1 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'history' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-gray-400'}`}>Scan History</button>
      </div>

      {activeTab === 'issues' ? (
        <div className="space-y-3">
          {issues.length === 0 ? (
            <div className="text-center py-20 bg-gray-50/50 dark:bg-black/10 rounded-3xl border-2 border-dashed border-[var(--border)]">
              <CheckCircle size={48} className="mx-auto mb-4 text-green-500 opacity-20" />
              <p className="text-gray-400 font-medium">Codebase is currently healthy!</p>
            </div>
          ) : (
            issues.map(i => (
              <div key={i.id} className="p-4 bg-[var(--sidebar)] border border-[var(--border)] rounded-2xl flex items-start justify-between">
                <div className="flex gap-4">
                  <div className={`mt-1 ${i.severity === 'critical' ? 'text-red-500' : i.severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'}`}>
                    {i.severity === 'critical' ? <AlertTriangle size={18} /> : <AlertCircle size={18} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{i.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{i.file_path}:{i.line_number}</p>
                    <p className="text-xs mt-2 leading-relaxed">{i.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {history.map(h => (
            <div key={h.id} className="p-4 bg-[var(--sidebar)] border border-[var(--border)] rounded-2xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold capitalize">{h.scan_type} Audit</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${h.status === 'completed' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>{h.status}</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase">{new Date(h.started_at).toLocaleString()} • {h.files_scanned} files</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-red-500">{h.critical_count} Critical</p>
                <p className="text-xs font-bold text-yellow-500">{h.warning_count} Warnings</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
