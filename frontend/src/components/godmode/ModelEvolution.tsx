import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Activity, Clock, ShieldCheck, RefreshCw } from 'lucide-react';
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

  if (loading) return <div className="animate-pulse h-40 bg-black/5 rounded-2xl" />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl space-y-4">
          <div className="flex items-center gap-3">
            <Cpu className="text-[var(--accent)]" size={24} />
            <h3 className="font-bold">Active Architecture</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-[var(--input-bg)] rounded-xl">
              <span className="text-xs font-bold text-gray-400 uppercase">Primary Cloud</span>
              <span className="text-sm font-mono font-bold">{data?.current_model}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[var(--input-bg)] rounded-xl">
              <span className="text-xs font-bold text-gray-400 uppercase">Local Fallback</span>
              <span className="text-sm font-mono font-bold">{data?.fallback_model}</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl space-y-4">
          <div className="flex items-center gap-3">
            <Zap className="text-yellow-500" size={24} />
            <h3 className="font-bold">VRAM Strategy</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-[var(--input-bg)] rounded-xl">
              <span className="text-xs font-bold text-gray-400 uppercase">GPU Allocation</span>
              <span className="text-sm font-bold text-green-500">{data?.vram_usage}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[var(--input-bg)] rounded-xl">
              <span className="text-xs font-bold text-gray-400 uppercase">Evolution State</span>
              <span className="text-sm font-bold uppercase tracking-widest px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded">{data?.evolution_status}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="text-purple-500" size={20} />
            <h3 className="font-bold">Evolution Benchmarks</h3>
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase">Next Run: 48 Hours</span>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          Momo automatically evaluates her local model performance against Tier 3 outputs. 
          If a local model score exceeds the current threshold, it is promoted to primary technical handler.
        </p>
        <button className="flex items-center gap-2 bg-[var(--accent)] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:opacity-90 transition-all">
          <RefreshCw size={14} /> Trigger Manual Evolution
        </button>
      </div>
    </div>
  );
};
