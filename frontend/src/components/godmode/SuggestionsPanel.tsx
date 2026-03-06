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

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[var(--accent)]" size={32} /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--sidebar)] border border-[var(--border)] rounded-[32px] p-10 shadow-sm mb-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl"><MessageSquare size={24} /></div>
          <h2 className="text-2xl font-bold tracking-tight">User Feedback Queue</h2>
        </div>
        <p className="text-gray-500 font-medium text-sm">Manage feature requests and technical suggestions from the Momo ecosystem.</p>
      </div>

      <div className="grid gap-4">
        {suggestions.length === 0 ? (
          <div className="text-center py-20 bg-[var(--input-bg)] rounded-[32px] border border-[var(--border)] border-dashed">
            <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Queue is empty</p>
          </div>
        ) : suggestions.map(s => (
          <div key={s.id} className="bg-[var(--sidebar)] border border-[var(--border)] rounded-[32px] overflow-hidden shadow-sm hover:border-[var(--accent)]/50 transition-all">
            <div className="p-8 cursor-pointer hover:bg-black/5 flex items-center justify-between" onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    s.status === 'completed' ? 'bg-green-500/10 text-green-600' : 
                    s.status === 'under_review' ? 'bg-blue-500/10 text-blue-600' : 'bg-gray-100 text-gray-500'
                  }`}>{s.status.replace('_', ' ')}</div>
                  <div className="flex items-center gap-3 text-[11px] font-bold text-gray-400"><User size={14} className="text-gray-300" /> ID: {s.user_id} • <Clock size={14} className="text-gray-300" /> {new Date(s.created_at).toLocaleDateString()}</div>
                </div>
                <p className="text-lg font-bold tracking-tight">{s.content.substring(0, 100)}{s.content.length > 100 ? '...' : ''}</p>
              </div>
              <div className="p-2 bg-[var(--input-bg)] rounded-xl">{expandedId === s.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
            </div>
            
            {expandedId === s.id && (
              <div className="p-10 border-t border-[var(--border)] bg-[var(--input-bg)]/30 space-y-8 animate-in slide-in-from-top-2 duration-200">
                <div className="p-8 bg-white dark:bg-black/20 border border-[var(--border)] rounded-[24px]">
                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">{s.content}</p>
                </div>
                
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Administrative Response</label>
                  <textarea 
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-[24px] p-6 text-sm font-bold outline-none focus:ring-8 focus:ring-[var(--accent)]/10 transition-all" 
                    rows={4} 
                    value={responseText[s.id] || s.admin_response || ''} 
                    onChange={e => setResponseText({...responseText, [s.id]: e.target.value})} 
                    placeholder="Provide feedback or update the status..." 
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button onClick={() => handleUpdate(s.id, 'completed')} className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-green-500/20 hover:scale-105 transition-all"><Check size={16} /> Mark Complete</button>
                  <button onClick={() => handleUpdate(s.id, 'under_review')} className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"><MessageSquare size={16} /> Under Review</button>
                  <button onClick={() => handleUpdate(s.id, 'declined')} className="flex-1 flex items-center justify-center gap-2 bg-gray-500 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-500 transition-all"><X size={16} /> Decline</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
