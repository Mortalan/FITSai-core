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

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="animate-spin text-[var(--accent)]" size={32} /></div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-indigo-600/10 to-blue-600/10 border border-indigo-500/20 rounded-[40px] p-12 shadow-sm">
        <div className="flex items-center gap-6 mb-4">
          <div className="p-4 bg-indigo-500/20 rounded-3xl text-indigo-500"><Cpu size={32} /></div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Orchestration Strategy</h2>
            <p className="text-indigo-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Multi-Tier Model Lifecycle</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-10 bg-[var(--sidebar)] border border-[var(--border)] rounded-[40px] space-y-8 shadow-sm group hover:border-blue-500/30 transition-all">
          <div className="flex items-center gap-4"><div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl group-hover:bg-blue-500 group-hover:text-white transition-all"><Zap size={24} /></div><h3 className="font-bold text-lg">Primary Cloud</h3></div>
          <div className="p-6 bg-[var(--input-bg)] rounded-[24px] border border-[var(--border)] shadow-inner"><p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">GPT-4o Agentic Loop</p><span className="text-base font-mono font-bold text-blue-600">{data?.current_model}</span></div>
        </div>

        <div className="p-10 bg-[var(--sidebar)] border border-[var(--border)] rounded-[40px] space-y-8 shadow-sm group hover:border-yellow-500/30 transition-all">
          <div className="flex items-center gap-4"><div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-2xl group-hover:bg-yellow-500 group-hover:text-white transition-all"><RefreshCw size={24} /></div><h3 className="font-bold text-lg">Local Fallback</h3></div>
          <div className="p-6 bg-[var(--input-bg)] rounded-[24px] border border-[var(--border)] shadow-inner"><p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Ollama Chat Instance</p><span className="text-base font-mono font-bold text-yellow-600">{data?.fallback_model}</span></div>
        </div>

        <div className="p-10 bg-[var(--sidebar)] border border-[var(--border)] rounded-[40px] space-y-8 shadow-sm group hover:border-green-500/30 transition-all">
          <div className="flex items-center gap-4"><div className="p-3 bg-green-500/10 text-green-500 rounded-2xl group-hover:bg-green-500 group-hover:text-white transition-all"><Code2 size={24} /></div><h3 className="font-bold text-lg">Technical Logic</h3></div>
          <div className="p-6 bg-[var(--input-bg)] rounded-[24px] border border-[var(--border)] shadow-inner"><p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Ollama Coding Instance</p><span className="text-base font-mono font-bold text-green-600">{data?.coding_model}</span></div>
        </div>
      </div>

      <div className="bg-[var(--sidebar)] border border-[var(--border)] p-12 rounded-[48px] space-y-8 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-indigo-500/10 rounded-[24px] text-indigo-500"><Activity size={28} /></div>
            <div><h3 className="text-2xl font-bold tracking-tight">Evolution Metrics</h3><p className="text-gray-500 font-medium">GPU Optimization Status: {data?.vram_usage} active</p></div>
          </div>
          <button className="bg-[var(--accent)] text-white px-10 py-4 rounded-[20px] font-bold text-xs uppercase tracking-widest shadow-xl shadow-[var(--accent)]/30 hover:scale-105 transition-all">Run Benchmarks</button>
        </div>
        <p className="text-base text-gray-500 leading-relaxed max-w-4xl relative z-10">Momo automatically evaluates her local technical performance against Tier 3 outputs. If the local {data?.coding_model} score exceeds the current threshold, it is promoted to primary technical logic handler for all MSP workstreams.</p>
        <div className="absolute -right-20 -bottom-20 opacity-[0.02] rotate-12"><Cpu size={400} /></div>
      </div>
    </div>
  );
};

const Loader2 = ({ className, size }: { className?: string, size?: number }) => <RefreshCw className={`animate-spin ${className}`} size={size} />;
