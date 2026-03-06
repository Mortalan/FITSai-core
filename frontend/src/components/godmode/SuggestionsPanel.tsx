import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, User, Loader2, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

const API_BASE_URL = 'http://10.0.0.231:9000/api/v1/suggestions';

export const SuggestionsPanel: React.FC = () => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [responseText, setResponseText] = useState<Record<number, string>>({});
  const token = useAuthStore((state) => state.token);

  useEffect(() => { fetchSuggestions(); }, [token]);

  const fetchSuggestions = async () => {
    try {
      const res = await axios.get(API_BASE_URL, { headers: { Authorization: `Bearer ${token}` } });
      setSuggestions(res.data);
    } catch (err) {}
    setLoading(false);
  };

  const handleUpdate = async (id: number, status: string) => {
    try {
      await axios.put(`${API_BASE_URL}/${id}`, { status, admin_response: responseText[id] || '' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSuggestions();
    } catch (err) { alert('Update failed'); }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[var(--accent)]" /></div>;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {suggestions.map(s => (
        <div key={s.id} className="bg-[var(--sidebar)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="p-6 cursor-pointer hover:bg-black/5 flex items-center justify-between" onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="px-2 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] text-[9px] font-black uppercase tracking-widest">{s.status}</div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400"><User size={12} /> User ID: {s.user_id} • <Clock size={12} /> {new Date(s.created_at).toLocaleDateString()}</div>
              </div>
              <p className="text-sm font-medium">{s.content.substring(0, 80)}{s.content.length > 80 ? '...' : ''}</p>
            </div>
            {expandedId === s.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          
          {expandedId === s.id && (
            <div className="p-6 border-t border-[var(--border)] bg-[var(--input-bg)]/30 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{s.content}</p>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-400">Admin Response</label>
                <textarea className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]" rows={2} value={responseText[s.id] || s.admin_response || ''} onChange={e => setResponseText({...responseText, [s.id]: e.target.value})} placeholder="Type your response..." />
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleUpdate(s.id, 'completed')} className="flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm"><Check size={14} /> Complete</button>
                <button onClick={() => handleUpdate(s.id, 'under_review')} className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm"><MessageSquare size={14} /> Under Review</button>
                <button onClick={() => handleUpdate(s.id, 'declined')} className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm"><X size={14} /> Decline</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
