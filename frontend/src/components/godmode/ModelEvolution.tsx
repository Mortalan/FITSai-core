import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Activity, Clock, ShieldCheck, RefreshCw, Code2 } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

export const ModelEvolution: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    axios.get('http://10.0.0.231:9000/api/v1/admin/models/evolution', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setData(res.data)).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="animate-pulse h-40 bg-black/5 rounded-[32px]" />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-8 bg-[var(--sidebar)] border border-[var(--border)] rounded-[32px] space-y-6 shadow-sm">
          <div className="flex items-center gap-3"><Cpu className="text-blue-500" size={24} /><h3 className="font-black uppercase tracking-widest text-xs">Production Cloud</h3></div>
          <div className="p-4 bg-[var(--input-bg)] rounded-2xl border border-[var(--border)]"><p className="text-[10px] font-black text-gray-400 uppercase mb-1">Primary Handler</p><span className="text-sm font-mono font-bold">{data?.current_model}</span></div>
        </div>

        <div className="p-8 bg-[var(--sidebar)] border border-[var(--border)] rounded-[32px] space-y-6 shadow-sm">
          <div className="flex items-center gap-3"><Zap className="text-yellow-500" size={24} /><h3 className="font-black uppercase tracking-widest text-xs">Local Fallback</h3></div>
          <div className="p-4 bg-[var(--input-bg)] rounded-2xl border border-[var(--border)]"><p className="text-[10px] font-black text-gray-400 uppercase mb-1">Ollama Chat</p><span className="text-sm font-mono font-bold text-yellow-600">{data?.fallback_model}</span></div>
        </div>

        <div className="p-8 bg-[var(--sidebar)] border border-[var(--border)] rounded-[32px] space-y-6 shadow-sm">
          <div className="flex items-center gap-3"><Code2 className="text-green-500" size={24} /><h3 className="font-black uppercase tracking-widest text-xs">Technical Logic</h3></div>
          <div className="p-4 bg-[var(--input-bg)] rounded-2xl border border-[var(--border)]"><p className="text-[10px] font-black text-gray-400 uppercase mb-1">Coding Model</p><span className="text-sm font-mono font-bold text-green-600">{data?.coding_model}</span></div>
        </div>
      </div>

      <div className="bg-indigo-500/5 border border-indigo-500/20 p-10 rounded-[40px] space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-500"><Activity size={24} /></div>
            <div><h3 className="text-xl font-black tracking-tight">Evolution Strategy</h3><p className="text-indigo-400 text-sm font-medium">GPU Optimization: {data?.vram_usage} active</p></div>
          </div>
          <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg hover:opacity-90 transition-all"><RefreshCw size={14} className="mr-2 inline" /> Run Benchmarks</button>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed max-w-3xl">Momo automatically evaluates her local technical performance against Tier 3 outputs. If the local {data?.coding_model} score exceeds the current threshold, it is promoted to primary technical logic handler.</p>
      </div>
    </div>
  );
};
