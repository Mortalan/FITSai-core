import React, { useState, useEffect } from 'react';
import { DollarSign, PieChart, TrendingUp, AlertCircle, Loader2, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

const API_BASE_URL = 'http://10.0.0.231:9000/api/v1/admin';

export const BudgetMaster: React.FC = () => {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [usage, setUsage] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    Promise.all([
      axios.get(`${API_BASE_URL}/budgets`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${API_BASE_URL}/usage`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${API_BASE_URL}/budget/history`, { headers: { Authorization: `Bearer ${token}` } })
    ]).then(([bRes, uRes, hRes]) => {
      setBudgets(bRes.data);
      setUsage(uRes.data);
      setHistory(hRes.data);
    }).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--accent)]" size={32} /></div>;

  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const totalLimit = budgets.reduce((acc, b) => acc + b.monthly_limit, 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="bg-[var(--sidebar)] p-10 border border-[var(--border)] rounded-[40px] shadow-sm">
        <div className="flex items-center gap-5 mb-2">
          <div className="p-3 bg-green-500/10 text-green-500 rounded-2xl"><DollarSign size={28} /></div>
          <h2 className="text-3xl font-bold tracking-tight">API Fiscal Control</h2>
        </div>
        <p className="text-gray-500 font-medium text-sm">Manage departmental token budgets and OpenAI infrastructure costs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {budgets.map(b => (
              <div key={b.id} className="p-8 bg-[var(--sidebar)] border border-[var(--border)] rounded-[32px] space-y-6 shadow-sm group hover:border-[var(--accent)] transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">Dept ID: {b.department_id}</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Monthly Allocation</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-[var(--foreground)]">$${b.spent.toFixed(2)}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase">of $${b.monthly_limit}</div>
                  </div>
                </div>
                <div className="h-2.5 w-full bg-[var(--input-bg)] rounded-full overflow-hidden border border-[var(--border)]">
                  <div 
                    className={`h-full transition-all duration-1000 ${(b.spent/b.monthly_limit) > 0.8 ? 'bg-red-500' : 'bg-[var(--accent)]'}`} 
                    style={{ width: `${Math.min((b.spent/b.monthly_limit)*100, 100)}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[var(--sidebar)] border border-[var(--border)] rounded-[40px] overflow-hidden shadow-sm">
            <div className="p-8 border-b border-[var(--border)] bg-[var(--input-bg)]/30"><h3 className="font-bold text-lg flex items-center gap-3"><PieChart size={20} className="text-[var(--accent)]" /> Recent API Transactions</h3></div>
            <div className="divide-y divide-[var(--border)]">
              {usage.map((u, i) => (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-black/5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-[var(--input-bg)] rounded-xl"><TrendingUp size={16} className="text-gray-400" /></div>
                    <div><p className="text-sm font-bold">{u.model}</p><p className="text-[10px] text-gray-400 font-medium">{new Date(u.timestamp).toLocaleString()}</p></div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black">$${u.cost.toFixed(4)}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{u.tokens_total} Tokens</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="p-10 bg-gradient-to-br from-[var(--accent)] to-blue-600 rounded-[40px] text-white shadow-xl shadow-blue-500/20">
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Total Burn Rate</h3>
            <div className="text-5xl font-black mb-6 tracking-tighter">$${totalSpent.toFixed(2)}</div>
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-bold"><span className="opacity-70">Projected EOM</span><span>$${(totalSpent * 1.2).toFixed(2)}</span></div>
              <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-white transition-all" style={{ width: `${(totalSpent/totalLimit)*100}%` }} /></div>
            </div>
          </div>

          <div className="p-8 bg-[var(--sidebar)] border border-[var(--border)] rounded-[32px] space-y-6 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Cost History</h3>
            <div className="space-y-4">
              {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-500">{h.month}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black">$${h.cost.toFixed(2)}</span>
                    {i > 0 && h.cost > history[i-1].cost ? <ArrowUpRight size={14} className="text-red-500" /> : <ArrowDownRight size={14} className="text-green-500" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
