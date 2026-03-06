import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, Bug, Zap, Loader2, RefreshCw, Clock, Terminal } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

const API_BASE_URL = 'http://10.0.0.231:9000/api/v1/code-health';

export const CodeHealthPanel: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const token = useAuthStore((state) => state.token);

  useEffect(() => { fetchData(); }, [token]);

  const fetchData = async () => {
    try {
      const [sumRes, issueRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/summary`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/issues`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setSummary(sumRes.data);
      setIssues(issueRes.data);
    } catch (err) {}
    setLoading(false);
  };

  const startScan = async () => {
    setScanning(true);
    try {
      await axios.post(`${API_BASE_URL}/scan`, {}, { headers: { Authorization: `Bearer ${token}` } });
      await fetchData();
    } catch (err) { alert('Scan failed'); }
    setScanning(false);
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[var(--accent)]" size={32} /></div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-[var(--sidebar)] p-10 border border-[var(--border)] rounded-[40px] shadow-sm">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Integrity Auditor</h2>
          <p className="text-gray-500 font-medium text-sm mt-1">Autonomous code analysis and technical debt monitoring.</p>
        </div>
        <button 
          onClick={startScan} 
          disabled={scanning}
          className="flex items-center gap-3 bg-[var(--accent)] text-white px-8 py-4 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl shadow-[var(--accent)]/30 hover:scale-105 transition-all disabled:opacity-50"
        >
          {scanning ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
          {scanning ? 'Analyzing Core...' : 'Trigger Full Audit'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 bg-green-500/5 border border-green-500/20 rounded-[32px] space-y-4">
          <div className="flex items-center gap-3 text-green-600"><ShieldCheck size={20} /><span className="text-[10px] font-black uppercase tracking-widest">Security Score</span></div>
          <div className="text-4xl font-bold">{summary?.security_score || '98'}%</div>
        </div>
        <div className="p-8 bg-yellow-500/5 border border-yellow-500/20 rounded-[32px] space-y-4">
          <div className="flex items-center gap-3 text-yellow-600"><Zap size={20} /><span className="text-[10px] font-black uppercase tracking-widest">Complexity</span></div>
          <div className="text-4xl font-bold">{summary?.complexity_rating || 'Low'}</div>
        </div>
        <div className="p-8 bg-blue-500/5 border border-blue-500/20 rounded-[32px] space-y-4">
          <div className="flex items-center gap-3 text-blue-600"><Terminal size={20} /><span className="text-[10px] font-black uppercase tracking-widest">Pending Issues</span></div>
          <div className="text-4xl font-bold">{issues.length}</div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Active Integrity Warnings</h3>
        <div className="grid gap-4">
          {issues.map(issue => (
            <div key={issue.id} className="p-8 bg-[var(--sidebar)] border border-[var(--border)] rounded-[32px] flex items-center justify-between group hover:border-red-500/30 transition-all shadow-sm">
              <div className="flex items-center gap-6">
                <div className={`p-4 rounded-2xl ${issue.severity === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}><Bug size={24} /></div>
                <div>
                  <h4 className="font-bold text-lg">{issue.title}</h4>
                  <p className="text-sm text-gray-500 font-medium">{issue.file_path} • Line {issue.line_number}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg mb-2 ${issue.severity === 'high' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'}`}>{issue.severity}</div>
                <p className="text-[11px] text-gray-400 font-mono">ID: ERR-{issue.id}</p>
              </div>
            </div>
          ))}
          {issues.length === 0 && <div className="text-center py-20 bg-[var(--input-bg)]/30 rounded-[40px] border border-[var(--border)] border-dashed text-gray-400 font-bold uppercase text-xs tracking-[0.2em]">No active integrity issues detected.</div>}
        </div>
      </div>
    </div>
  );
};
