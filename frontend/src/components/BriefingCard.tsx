import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Zap, AlertCircle, CheckCircle2, ChevronRight, Loader2, Sparkles, Brain } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = 'http://10.0.0.231:9000/api/v1';

export const BriefingCard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const fetchBriefing = async () => {
      try {
        const resp = await axios.get(`${API_BASE_URL}/briefing/daily`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(resp.data);
      } catch (err) {}
      setLoading(false);
    };
    fetchBriefing();
  }, [token]);

  if (loading) return <div className="w-full max-w-3xl bg-[var(--sidebar)] border border-[var(--border)] rounded-[40px] p-12 flex justify-center shadow-sm"><Loader2 className="animate-spin text-[var(--accent)]" /></div>;
  if (!data) return null;

  return (
    <div className="w-full max-w-3xl bg-gradient-to-br from-[var(--sidebar)] to-white dark:to-black/20 border border-[var(--border)] rounded-[40px] p-10 shadow-xl shadow-black/5 animate-in fade-in zoom-in-95 duration-700 relative overflow-hidden group">
      <div className="absolute -right-10 -top-10 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity rotate-12"><Brain size={300} /></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[var(--accent)]/10 text-[var(--accent)] rounded-2xl"><Calendar size={24} /></div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Daily Technical Briefing</h2>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">System Intelligence Active • {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div className="px-4 py-1.5 bg-green-500/10 text-green-600 rounded-full border border-green-500/20 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Synced</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2"><Zap size={12} className="text-yellow-500" /> Priorities</h3>
              <div className="space-y-2">
                {data.priorities?.map((p: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white dark:bg-black/20 rounded-xl border border-[var(--border)] shadow-sm">
                    <div className="mt-1"><ChevronRight size={14} className="text-[var(--accent)]" /></div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{p}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2"><AlertCircle size={12} className="text-red-500" /> Critical Alerts</h3>
              <div className="space-y-2">
                {data.alerts?.map((a: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-red-500/5 rounded-xl border border-red-500/10 shadow-sm">
                    <div className="mt-1"><AlertCircle size={14} className="text-red-500" /></div>
                    <p className="text-sm font-medium text-red-700/80 dark:text-red-400/80">{a}</p>
                  </div>
                ))}
                {(!data.alerts || data.alerts.length === 0) && (
                  <div className="flex items-center gap-3 p-3 bg-green-500/5 rounded-xl border border-green-500/10">
                    <CheckCircle2 size={14} className="text-green-500" />
                    <p className="text-sm font-medium text-green-600">All systems operational.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-[var(--border)] flex items-center justify-between">
          <p className="text-xs text-gray-400 italic">Momo has analyzed {data.tasks_completed || 0} recent interactions to generate this brief.</p>
          <button className="flex items-center gap-2 text-[var(--accent)] font-bold text-xs uppercase tracking-widest hover:opacity-80 transition-all">
            Full Analysis <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
