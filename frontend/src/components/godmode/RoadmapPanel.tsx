import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader2, Clock, ChevronDown, ChevronUp, AlertCircle, Zap, Calendar, Settings, Shield } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

const API_BASE_URL = 'http://10.0.0.231:9000/api/v1/roadmap';

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status?: string;
  completedDate?: string;
}

interface RoadmapCategory {
  name: string;
  color: string;
  items: RoadmapItem[];
}

interface RoadmapData {
  lastUpdated: string;
  categories: RoadmapCategory[];
  completed: RoadmapItem[];
}

const categoryIcons: Record<string, React.ReactNode> = {
  'red': <Shield className="w-5 h-5" />,
  'yellow': <Zap className="w-5 h-5" />,
  'blue': <Settings className="w-5 h-5" />,
  'purple': <Calendar className="w-5 h-5" />,
};

const categoryColors: Record<string, string> = {
  'red': 'border-red-500/50 bg-red-500/5',
  'yellow': 'border-yellow-500/50 bg-yellow-500/5',
  'blue': 'border-blue-500/50 bg-blue-500/5',
  'purple': 'border-purple-500/50 bg-purple-500/5',
};

export const RoadmapPanel: React.FC = () => {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['red', 'yellow', 'blue', 'purple']));
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      const res = await axios.get(API_BASE_URL, { headers: { Authorization: `Bearer ${token}` } });
      setRoadmap(res.data);
    } catch (err) {}
    setLoading(false);
  };

  const handleStatusChange = async (itemId: string, status: string) => {
    try {
      await axios.post(`${API_BASE_URL}/update-status`, { item_id: itemId, status }, { headers: { Authorization: `Bearer ${token}` } });
      fetchRoadmap();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const toggleCategory = (color: string) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(color)) newSet.delete(color);
    else newSet.add(color);
    setExpandedCategories(newSet);
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[var(--accent)]" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--input-bg)] p-4 rounded-2xl border border-[var(--border)] text-center">
          <div className="text-2xl font-bold text-yellow-500">{roadmap?.categories.reduce((acc, cat) => acc + cat.items.length, 0)}</div>
          <div className="text-[10px] font-bold uppercase text-gray-400">Planned</div>
        </div>
        <div className="bg-[var(--input-bg)] p-4 rounded-2xl border border-[var(--border)] text-center">
          <div className="text-2xl font-bold text-blue-500">{roadmap?.categories.reduce((acc, cat) => acc + cat.items.filter(i => i.status === 'in_progress').length, 0)}</div>
          <div className="text-[10px] font-bold uppercase text-gray-400">In Progress</div>
        </div>
        <div className="bg-[var(--input-bg)] p-4 rounded-2xl border border-[var(--border)] text-center">
          <div className="text-2xl font-bold text-green-500">{roadmap?.completed.length}</div>
          <div className="text-[10px] font-bold uppercase text-gray-400">Deployed</div>
        </div>
      </div>

      {roadmap?.categories.map(cat => (
        <div key={cat.name} className={`border rounded-3xl overflow-hidden ${categoryColors[cat.color] || 'border-[var(--border)]'}`}>
          <button onClick={() => toggleCategory(cat.color)} className="w-full p-4 flex items-center justify-between hover:bg-black/5 transition-colors">
            <div className="flex items-center gap-3">
              {categoryIcons[cat.color]}
              <span className="font-bold">{cat.name}</span>
            </div>
            {expandedCategories.has(cat.color) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {expandedCategories.has(cat.color) && (
            <div className="border-t border-[var(--border)] bg-white/50 dark:bg-black/20">
              {cat.items.map(item => (
                <div key={item.id} className="p-4 border-b border-[var(--border)] last:border-0 flex items-center gap-4">
                  <select 
                    value={item.status || 'pending'} 
                    onChange={e => handleStatusChange(item.id, e.target.value)}
                    className="bg-[var(--input-bg)] border border-[var(--border)] rounded-lg text-xs p-1 outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">Working</option>
                    <option value="complete">Complete</option>
                  </select>
                  <div>
                    <h4 className="font-bold text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
