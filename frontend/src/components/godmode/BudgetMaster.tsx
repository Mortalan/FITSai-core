import React, { useState, useEffect } from 'react';
import { DollarSign, BarChart3, Users, Clock, Loader2, TrendingUp, AlertTriangle, User } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

export const BudgetMaster: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [usage, setUsage] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get('http://10.0.0.231:9000/api/v1/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('http://10.0.0.231:9000/api/v1/admin/budgets', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('http://10.0.0.231:9000/api/v1/admin/budget/history', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('http://10.0.0.231:9000/api/v1/admin/usage', { headers: { Authorization: `Bearer ${token}` } })
    ]).then(([s, b, h, u]) => {
      setStats(s.data);
      setBudgets(b.data);
      setHistory(h.data);
      setUsage(u.data);
    }).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[var(--accent)]" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl text-white shadow-xl">
          <DollarSign size={24} className="mb-4 opacity-80" />
          <p className="text-xs font-bold uppercase tracking-widest opacity-70">Total API Spend</p>
          <h3 className="text-4xl font-bold mt-1">${stats?.total_api_spend?.toFixed(2)}</h3>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase py-1 px-2 bg-white/10 rounded-lg w-fit">
            <TrendingUp size={12} /> 12% vs last month
          </div>
        </div>
        
        <div className="p-6 bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl shadow-sm">
          <Users size={24} className="text-green-500 mb-4" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Users</p>
          <h3 className="text-4xl font-bold text-[var(--foreground)] mt-1">{stats?.users}</h3>
          <p className="text-[10px] font-bold text-green-600 uppercase mt-4">Avg: ${(stats?.total_api_spend / (stats?.users || 1)).toFixed(2)} / user</p>
        </div>

        <div className="p-6 bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl shadow-sm">
          <Clock size={24} className="text-purple-500 mb-4" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cycle</p>
          <h3 className="text-4xl font-bold text-[var(--foreground)] mt-1">25</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase mt-4">Days remaining</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl p-8 shadow-sm">
          <h4 className="font-bold mb-6 flex items-center gap-2"><BarChart3 size={18} className="text-blue-500" /> Spending Trends</h4>
          <div className="flex items-end justify-between h-40 gap-4">
            {history.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="relative w-full flex items-end justify-center">
                   <div 
                    className="w-full bg-[var(--accent)]/20 rounded-t-lg group-hover:bg-[var(--accent)] transition-all duration-500" 
                    style={{ height: `${(h.cost / (Math.max(...history.map(x => x.cost)) || 1)) * 100}%` }} 
                  />
                  <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold font-mono text-[var(--accent)]">${h.cost.toFixed(2)}</div>
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase">{h.month.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl p-8 shadow-sm">
          <h4 className="font-bold mb-6 flex items-center gap-2"><AlertTriangle size={18} className="text-yellow-500" /> Dept Limits</h4>
          <div className="space-y-4">
            {budgets.map(b => (
              <div key={b.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold">Dept {b.department_id}</span>
                  <span className="text-xs font-bold text-gray-500">${b.current_spend.toFixed(2)} / ${b.monthly_limit}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-black/20 rounded-full overflow-hidden border border-[var(--border)]">
                  <div className="h-full bg-green-500 transition-all" style={{ width: `${(b.current_spend / b.monthly_limit) * 100}%`, backgroundColor: (b.current_spend / b.monthly_limit) > 0.8 ? 'orange' : '' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[var(--border)] bg-[var(--input-bg)]/50 flex justify-between items-center">
          <h4 className="font-bold flex items-center gap-2"><Activity size={18} className="text-blue-500" /> Real-time API Usage</h4>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last 50 interactions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--background)] border-b border-[var(--border)]">
              <tr>
                <th className="p-4 text-[10px] font-black uppercase text-gray-400">User</th>
                <th className="p-4 text-[10px] font-black uppercase text-gray-400">Model</th>
                <th className="p-4 text-[10px] font-black uppercase text-gray-400">Tokens</th>
                <th className="p-4 text-[10px] font-black uppercase text-gray-400">Cost</th>
                <th className="p-4 text-[10px] font-black uppercase text-gray-400">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {usage.map(u => (
                <tr key={u.id} className="hover:bg-black/5 transition-colors">
                  <td className="p-4 flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center text-[10px] font-bold">{u.user_id}</div><span className="font-bold">User #{u.user_id}</span></td>
                  <td className="p-4 font-mono text-xs text-blue-500">{u.model_name}</td>
                  <td className="p-4 text-xs font-medium text-gray-500">{u.prompt_tokens + u.completion_tokens}</td>
                  <td className="p-4 font-bold">${u.cost.toFixed(4)}</td>
                  <td className="p-4 text-xs text-gray-400">{new Date(u.timestamp).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
