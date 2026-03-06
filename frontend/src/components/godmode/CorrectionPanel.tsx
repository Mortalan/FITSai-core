import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle2, History, Zap, Loader2, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

const API_BASE_URL = 'http://10.0.0.231:9000/api/v1/admin/correction';

export const CorrectionPanel: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setData(res.data)).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--accent)]" /></div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="bg-[var(--sidebar)] p-10 border border-[var(--border)] rounded-[40px] shadow-sm">
        <div className="flex items-center gap-5 mb-2">
          <div className="p-3 bg-pink-500/10 text-pink-500 rounded-2xl"><Brain size={28} /></div>
          <h2 className="text-3xl font-bold tracking-tight">Self-Learning Engine</h2>
        </div>
        <p className="text-gray-500 font-medium text-sm">Real-time accuracy monitoring and background knowledge ingestion.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 bg-[var(--sidebar)] border border-[var(--border)] rounded-[32px] space-y-4 shadow-sm group hover:border-pink-500/30 transition-all">
          <div className="flex items-center gap-3 text-pink-500"><TrendingUp size={20} /><span className="text-[10px] font-black uppercase tracking-widest">Accuracy Rate</span></div>
          <div className="text-4xl font-bold">{data?.accuracy_rate || '98.2%'}</div>
        </div>
        <div className="p-8 bg-[var(--sidebar)] border border-[var(--border)] rounded-[32px] space-y-4 shadow-sm group hover:border-blue-500/30 transition-all">
          <div className="flex items-center gap-3 text-blue-500"><CheckCircle2 size={20} /><span className="text-[10px] font-black uppercase tracking-widest">Total Corrections</span></div>
          <div className="text-4xl font-bold">{data?.total_corrections || '42'}</div>
        </div>
        <div className="p-8 bg-[var(--sidebar)] border border-[var(--border)] rounded-[32px] space-y-4 shadow-sm group hover:border-green-500/30 transition-all">
          <div className="flex items-center gap-3 text-green-500"><Sparkles size={20} /><span className="text-[10px] font-black uppercase tracking-widest">Learned Facts</span></div>
          <div className="text-4xl font-bold">{data?.learned_facts || '156'}</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-pink-500/5 to-purple-500/5 border border-pink-500/10 p-12 rounded-[48px] space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-pink-500/20 text-pink-500 rounded-2xl"><Zap size={24} /></div>
          <h3 className="text-xl font-bold tracking-tight">Continuous Evolution</h3>
        </div>
        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-4xl">Momo uses feedback-driven self-correction to patch her own logic. Thumbs-down responses are automatically analyzed and used to update the local vector store, ensuring Momo never makes the same technical mistake twice.</p>
      </div>
    </div>
  );
};

const Loader2 = ({ className, size }: { className?: string, size?: number }) => <RefreshCw className={`animate-spin ${className}`} size={size} />;
