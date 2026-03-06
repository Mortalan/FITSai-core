import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle2, History, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

export const CorrectionPanel: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    axios.get('http://10.0.0.231:9000/api/v1/admin/correction/stats', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setData(res.data)).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[var(--accent)]" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-500/5 p-6 rounded-3xl border border-green-500/20 text-center">
          <div className="text-3xl font-bold text-green-600">{data?.accuracy_rate}</div>
          <div className="text-[10px] font-bold uppercase text-gray-400 mt-1">Historical Accuracy</div>
        </div>
        <div className="bg-blue-500/5 p-6 rounded-3xl border border-blue-500/20 text-center">
          <div className="text-3xl font-bold text-blue-600">{data?.total_corrections}</div>
          <div className="text-[10px] font-bold uppercase text-gray-400 mt-1">Self-Corrections</div>
        </div>
        <div className="bg-purple-500/5 p-6 rounded-3xl border border-purple-500/20 text-center">
          <div className="text-3xl font-bold text-purple-600">{data?.learned_facts}</div>
          <div className="text-[10px] font-bold uppercase text-gray-400 mt-1">Learned Facts</div>
        </div>
      </div>

      <div className="p-8 bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl space-y-4">
        <div className="flex items-center gap-3">
          <Brain className="text-[var(--accent)]" size={24} />
          <h3 className="font-bold">Self-Correction Memory</h3>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          Momo monitors her own technical outputs in the background. If a discrepancy is detected between 
          local and cloud tiers, or if a hallucination is flagged, a high-priority correction is injected 
          into the Knowledge Base.
        </p>
        <div className="pt-4 flex items-center gap-2 text-green-600 text-xs font-bold uppercase">
          <CheckCircle2 size={14} /> Active Monitoring System Live
        </div>
      </div>
    </div>
  );
};
