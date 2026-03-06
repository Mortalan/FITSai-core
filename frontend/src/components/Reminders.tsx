import React, { useEffect, useState } from 'react';
import { Bell, Calendar, CheckCircle2, Clock, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const Reminders: React.FC = () => {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReminder, setNewReminder] = useState({ message: '', due_at: '', category: 'general' });
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const res = await axios.get('http://10.0.0.231:9000/api/v1/reminders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReminders(res.data);
    } catch (err) {}
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminder.message || !newReminder.due_at) return;
    try {
      await axios.post('http://10.0.0.231:9000/api/v1/reminders', newReminder, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewReminder({ message: '', due_at: '', category: 'general' });
      fetchReminders();
    } catch (err) {}
  };

  const handleComplete = async (id: number) => {
    try {
      await axios.post(`http://10.0.0.231:9000/api/v1/reminders/${id}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReminders();
    } catch (err) {}
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Reminders</h1>
          <p className="text-gray-500 font-medium uppercase text-[10px] tracking-[0.2em]">Manage your scheduled tasks and technical follow-ups</p>
        </div>
        <Bell className="text-[var(--accent)] mb-1" size={24} />
      </div>

      <form onSubmit={handleCreate} className="bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Task Description</label>
            <input 
              type="text" 
              placeholder="e.g. Check UPS status on 10.0.0.232"
              value={newReminder.message}
              onChange={e => setNewReminder({...newReminder, message: e.target.value})}
              className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Due Date & Time</label>
            <input 
              type="datetime-local" 
              value={newReminder.due_at}
              onChange={e => setNewReminder({...newReminder, due_at: e.target.value})}
              className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all" 
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="flex items-center gap-2 bg-[var(--accent)] text-[var(--accent-foreground)] px-6 py-2.5 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all">
            <Plus size={18} /> Add Reminder
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-10"><Clock className="animate-spin text-gray-300" /></div>
        ) : reminders.length === 0 ? (
          <div className="text-center py-20 bg-gray-50/50 dark:bg-black/10 rounded-3xl border-2 border-dashed border-[var(--border)]">
            <p className="text-gray-400 font-medium">No active reminders. You're all caught up!</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {reminders.map(r => (
              <div key={r.id} className="group flex items-center justify-between p-4 bg-[var(--sidebar)] border border-[var(--border)] rounded-2xl hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${r.is_completed ? 'bg-green-100 text-green-600' : 'bg-[var(--accent)]/10 text-[var(--accent)]'}`}>
                    <Bell size={18} />
                  </div>
                  <div>
                    <h3 className={`font-bold ${r.is_completed ? 'line-through text-gray-400' : ''}`}>{r.message}</h3>
                    <div className="flex items-center gap-3 mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(r.due_at).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {new Date(r.due_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-white/5 rounded border border-gray-200 dark:border-white/10">{r.category}</span>
                    </div>
                  </div>
                </div>
                {!r.is_completed && (
                  <button 
                    onClick={() => handleComplete(r.id)}
                    className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                  >
                    <CheckCircle2 size={24} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
