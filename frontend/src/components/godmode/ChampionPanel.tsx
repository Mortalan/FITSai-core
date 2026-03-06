import React, { useState } from 'react';
import { Crown, Trophy, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

export const ChampionPanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const token = useAuthStore((state) => state.token);

  const handleDetermine = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://10.0.0.231:9000/api/v1/admin/champion/determine', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus(res.data.message || 'Champion determined successfully!');
    } catch (err) { setStatus('Failed to determine champion.'); }
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-3xl p-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-yellow-500/20 rounded-2xl text-yellow-600"><Crown size={32} /></div>
          <div>
            <h2 className="text-2xl font-bold">Monthly Champion Control</h2>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">Manually trigger the monthly XP audit and award the Golden Frame.</p>
          </div>
        </div>
        <button onClick={handleDetermine} disabled={loading} className="flex items-center gap-2 bg-yellow-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Trophy size={18} />} 
          Run Monthly Audit
        </button>
        {status && <p className="mt-4 text-xs font-bold text-yellow-600 uppercase animate-pulse">{status}</p>}
      </div>

      <div className="p-8 bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl space-y-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Sparkles className="text-yellow-500" size={24} />
          <h3 className="font-bold">Champion Rewards</h3>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          The user with the highest XP gain each month is automatically awarded the <b>Golden Crown Frame</b> 
          and the <b>"Monthly Champion"</b> title. This audit is usually autonomous but can be forced here.
        </p>
      </div>
    </div>
  );
};
