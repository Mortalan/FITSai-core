import React, { useState, useEffect } from 'react';
import { ShieldAlert, Activity, Cpu, HardDrive, Zap, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

export const HealthAlertsPanel: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('http://10.0.0.231:9000/api/v1/admin/health/alerts', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {}
      setLoading(false);
    };
    fetch();
    const interval = setInterval(fetch, 10000);
    return () => clearInterval(interval);
  }, [token]);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[var(--accent)]" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl space-y-4">
          <div className="flex items-center gap-3"><Cpu className="text-blue-500" size={20} /><h4 className="text-xs font-bold uppercase tracking-widest">CPU Load</h4></div>
          <div className="text-3xl font-black">{data?.metrics.cpu}%</div>
          <div className="h-1.5 bg-gray-100 dark:bg-black/20 rounded-full overflow-hidden"><div className="h-full bg-blue-500 transition-all" style={{ width: `${data?.metrics.cpu}%` }} /></div>
        </div>
        <div className="p-6 bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl space-y-4">
          <div className="flex items-center gap-3"><Zap className="text-purple-500" size={20} /><h4 className="text-xs font-bold uppercase tracking-widest">RAM Usage</h4></div>
          <div className="text-3xl font-black">{data?.metrics.ram}%</div>
          <div className="h-1.5 bg-gray-100 dark:bg-black/20 rounded-full overflow-hidden"><div className="h-full bg-purple-500 transition-all" style={{ width: `${data?.metrics.ram}%` }} /></div>
        </div>
        <div className="p-6 bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl space-y-4">
          <div className="flex items-center gap-3"><HardDrive className="text-green-500" size={20} /><h4 className="text-xs font-bold uppercase tracking-widest">Storage</h4></div>
          <div className="text-3xl font-black">{data?.metrics.disk}%</div>
          <div className="h-1.5 bg-gray-100 dark:bg-black/20 rounded-full overflow-hidden"><div className="h-full bg-green-500 transition-all" style={{ width: `${data?.metrics.disk}%` }} /></div>
        </div>
      </div>

      <div className="bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-[var(--border)] flex items-center gap-3"><ShieldAlert className="text-red-500" size={20} /><h3 className="font-bold">System Health Alerts</h3></div>
        <div className="p-6">
          {data?.alerts.length === 0 ? (
            <div className="text-center py-12 text-gray-400 font-medium"><AlertCircle size={32} className="mx-auto mb-2 opacity-20" /><p>All systems operational. No active hardware alerts.</p></div>
          ) : (
            <div className="space-y-3">
              {data?.alerts.map((a: any) => (
                <div key={a.id} className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm font-bold">{a.message}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase text-red-500 tracking-widest">{a.severity}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
