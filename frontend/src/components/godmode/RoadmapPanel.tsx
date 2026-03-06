import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader2, Clock, ChevronDown, ChevronUp, Shield, Zap, Settings, Calendar } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

const API_BASE_URL = 'http://10.0.0.231:9000/api/v1/roadmap';

export const RoadmapPanel: React.FC = () => {
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['red', 'yellow', 'blue', 'purple']));
  const token = useAuthStore((state) => state.token);

  useEffect(() => { fetchRoadmap(); }, [token]);

  const fetchRoadmap = async () => {
    try {
      const res = await axios.get(API_BASE_URL, { headers: { Authorization: `Bearer ${token}` } });
      setRoadmap(res.data);
    } catch (err) {}
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--sidebar)] p-6 rounded-3xl border border-[var(--border)] text-center">
          <div className="text-3xl font-black text-yellow-500">{roadmap?.categories.reduce((acc: any, cat: any) => acc + cat.items.length, 0)}</div>
          <p className="text-[10px] font-black uppercase text-gray-400 mt-1">Planned</p>
        </div>
        <div className="bg-[var(--sidebar)] p-6 rounded-3xl border border-[var(--border)] text-center">
          <div className="text-3xl font-black text-blue-500">{roadmap?.categories.reduce((acc: any, cat: any) => acc + cat.items.filter((i: any) => i.status === 'in_progress').length, 0)}</div>
          <p className="text-[10px] font-black uppercase text-gray-400 mt-1">In Progress</p>
        </div>
        <div className="bg-[var(--sidebar)] p-6 rounded-3xl border border-[var(--border)] text-center">
          <div className="text-3xl font-black text-green-500">{roadmap?.completed.length}</div>
          <p className="text-[10px] font-black uppercase text-gray-400 mt-1">Deployed</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Active Roadmap</h3>
        {roadmap?.categories.map((cat: any) => (
          <div key={cat.name} className="bg-[var(--sidebar)] border border-[var(--border)] rounded-[32px] overflow-hidden">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3"><div className="p-2 bg-[var(--input-bg)] rounded-xl"><Shield size={18} /></div><span className="font-bold">{cat.name}</span></div>
            </div>
            <div className="border-t border-[var(--border)]">
              {cat.items.map((item: any) => (
                <div key={item.id} className="p-6 border-b border-[var(--border)] last:border-0 flex items-center justify-between">
                  <div><h4 className="font-bold">{item.title}</h4><p className="text-xs text-gray-500">{item.description}</p></div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${item.status === 'in_progress' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 ml-2">Production History</h3>
        <div className="bg-green-500/5 border border-green-500/20 rounded-[32px] overflow-hidden">
          {roadmap?.completed.map((item: any) => (
            <div key={item.id} className="p-6 border-b border-green-500/10 last:border-0 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <CheckCircle size={20} className="text-green-500" />
                <div><h4 className="font-bold">{item.title}</h4><p className="text-xs text-gray-500">{item.description}</p></div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-green-600 uppercase tracking-widest">Deployed</p>
                <p className="text-[10px] text-gray-400">{item.completedDate}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
