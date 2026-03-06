import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader2, Shield, Zap, Settings, Calendar, List } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

const API_BASE_URL = 'http://10.0.0.231:9000/api/v1/roadmap';

export const RoadmapPanel: React.FC = () => {
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => { fetchRoadmap(); }, [token]);

  const fetchRoadmap = async () => {
    try {
      const res = await axios.get(API_BASE_URL, { headers: { Authorization: `Bearer ${token}` } });
      setRoadmap(res.data);
    } catch (err) {}
    setLoading(false);
  };

  const handleStatusChange = async (itemId: string, status: string) => {
    setUpdatingId(itemId);
    try {
      await axios.post(`${API_BASE_URL}/update-status`, { item_id: itemId, status }, { headers: { Authorization: `Bearer ${token}` } });
      await fetchRoadmap();
    } catch (err) { alert('Update failed'); }
    setUpdatingId(null);
  };

  if (loading) return <div className="flex justify-center p-32"><Loader2 className="animate-spin text-[var(--accent)]" size={32} /></div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="bg-[var(--sidebar)] p-10 border border-[var(--border)] rounded-[40px] shadow-sm">
        <div className="flex items-center gap-5 mb-2">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl"><Zap size={28} /></div>
          <h2 className="text-3xl font-bold tracking-tight">Production Roadmap</h2>
        </div>
        <p className="text-gray-500 font-medium text-sm">Strategic technical objectives and feature delivery timeline.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[var(--sidebar)] p-8 rounded-[32px] border border-[var(--border)] text-center shadow-sm">
          <div className="text-4xl font-black text-yellow-500 tracking-tighter">{roadmap?.categories.reduce((acc: any, cat: any) => acc + cat.items.length, 0)}</div>
          <p className="text-[10px] font-black uppercase text-gray-400 mt-2 tracking-[0.2em]">Planned</p>
        </div>
        <div className="bg-[var(--sidebar)] p-8 rounded-[32px] border border-[var(--border)] text-center shadow-sm">
          <div className="text-4xl font-black text-blue-500 tracking-tighter">{roadmap?.categories.reduce((acc: any, cat: any) => acc + cat.items.filter((i: any) => i.status === 'in_progress').length, 0)}</div>
          <p className="text-[10px] font-black uppercase text-gray-400 mt-2 tracking-[0.2em]">In Sprint</p>
        </div>
        <div className="bg-[var(--sidebar)] p-8 rounded-[32px] border border-[var(--border)] text-center shadow-sm">
          <div className="text-4xl font-black text-green-500 tracking-tighter">{roadmap?.completed.length}</div>
          <p className="text-[10px] font-black uppercase text-gray-400 mt-2 tracking-[0.2em]">Deployed</p>
        </div>
      </div>

      <div className="space-y-8">
        {roadmap?.categories.map((cat: any) => (
          <div key={cat.name} className="bg-[var(--sidebar)] border border-[var(--border)] rounded-[40px] overflow-hidden shadow-sm hover:border-[var(--accent)]/30 transition-all">
            <div className="p-8 flex items-center justify-between border-b border-[var(--border)] bg-[var(--input-bg)]/30">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[var(--sidebar)] rounded-2xl text-[var(--accent)] border border-[var(--border)]"><Shield size={24} /></div>
                <div><h3 className="text-xl font-bold tracking-tight">{cat.name}</h3><p className="text-xs text-gray-500 font-bold uppercase">{cat.items.length} Active Targets</p></div>
              </div>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {cat.items.map((item: any) => (
                <div key={item.id} className="p-8 flex items-center justify-between group hover:bg-black/5 transition-all">
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-lg group-hover:text-[var(--accent)] transition-colors">{item.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-2xl font-medium">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {updatingId === item.id ? <Loader2 size={18} className="animate-spin text-[var(--accent)]" /> : (
                      <select 
                        value={item.status || 'pending'} 
                        onChange={e => handleStatusChange(item.id, e.target.value)}
                        className="bg-[var(--input-bg)] border border-[var(--border)] rounded-xl py-3 px-5 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:border-[var(--accent)] transition-all shadow-sm"
                      >
                        <option value="pending">Planned</option>
                        <option value="in_progress">Implementing</option>
                        <option value="complete">Deploy</option>
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-6 flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Production Changelog</h3>
        <div className="bg-green-500/5 border border-green-500/20 rounded-[48px] overflow-hidden shadow-sm">
          {roadmap?.completed.map((item: any) => (
            <div key={item.id} className="p-8 border-b border-green-500/10 last:border-0 flex items-center justify-between group">
              <div className="flex items-center gap-6">
                <div className="p-2.5 bg-green-500/20 rounded-full shadow-inner"><CheckCircle size={22} className="text-green-600" /></div>
                <div><h4 className="font-bold text-lg">{item.title}</h4><p className="text-sm text-gray-500 font-medium">{item.description}</p></div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Released</p>
                <p className="text-[11px] text-gray-400 font-mono mt-1 font-bold">{item.completedDate}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
