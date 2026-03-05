import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sun, ShieldCheck, FileText, TrendingUp, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = 'http://10.0.0.231:9000/api/v1';

interface BriefingData {
  date: string;
  greeting: string;
  system_status: string;
  knowledge_base: string;
  progress: string;
}

export const BriefingCard: React.FC = () => {
  const [data, setData] = useState<BriefingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const fetchBriefing = async () => {
      try {
        const resp = await axios.get(`${API_BASE_URL}/briefing/daily`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(resp.data);
      } catch (err) {
        console.error('Briefing fetch failed', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBriefing();
  }, [token]);

  if (isLoading) return <Loader2 className="animate-spin text-gray-300 mx-auto" size={24} />;
  if (!data) return null;

  return (
    <div className="w-full max-w-lg bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-xl">
          <Sun size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold tracking-tight">{data.greeting}</h3>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{data.date}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-black/20 rounded-2xl border border-[var(--border)]">
          <ShieldCheck size={18} className="text-green-500" />
          <span className="text-sm font-medium">{data.system_status}</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-black/20 rounded-2xl border border-[var(--border)]">
          <FileText size={18} className="text-[var(--accent)]" />
          <span className="text-sm font-medium">{data.knowledge_base}</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-black/20 rounded-2xl border border-[var(--border)]">
          <TrendingUp size={18} className="text-purple-500" />
          <span className="text-sm font-medium">{data.progress}</span>
        </div>
      </div>
    </div>
  );
};
