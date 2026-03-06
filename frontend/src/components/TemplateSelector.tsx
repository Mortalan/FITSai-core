import React, { useState, useEffect } from 'react';
import { X, Search, FileText, Code, Wrench, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = 'http://10.0.0.231:9000/api/v1';

interface Template {
  id: number;
  name: string;
  category: string;
  prompt: string;
  description: string;
}

interface TemplateSelectorProps {
  onSelect: (prompt: string) => void;
  onClose: () => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect, onClose }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState('');
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/templates/`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setTemplates(res.data)).catch(() => {});
  }, [token]);

  const filtered = templates.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  const getIcon = (category: string) => {
    switch (category) {
      case 'Writing': return <FileText size={18} className="text-blue-400" />;
      case 'Coding': return <Code size={18} className="text-green-400" />;
      case 'IT Support': return <Wrench size={18} className="text-orange-400" />;
      default: return <MessageSquare size={18} className="text-purple-400" />;
    }
  };

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-[var(--sidebar)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-bottom-4 duration-200">
      <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--input-bg)]">
        <div className="flex items-center gap-3 flex-1 mr-4">
          <Search size={18} className="text-gray-400" />
          <input 
            autoFocus
            type="text" 
            placeholder="Search templates (Ctrl+T)..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-sm font-medium"
            onKeyDown={e => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'Enter' && filtered.length > 0) onSelect(filtered[0].prompt);
            }}
          />
        </div>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-[var(--foreground)] transition-colors rounded-full hover:bg-white/10">
          <X size={18} />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto custom-scrollbar p-2">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-8 text-sm">No templates found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filtered.map(t => (
              <button 
                key={t.id}
                onClick={() => onSelect(t.prompt)}
                className="flex items-start gap-3 p-4 rounded-xl hover:bg-[var(--input-bg)] text-left transition-colors border border-transparent hover:border-[var(--border)] group"
              >
                <div className="p-2 bg-[var(--background)] rounded-lg group-hover:scale-110 transition-transform">
                  {getIcon(t.category)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--foreground)]">{t.name}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{t.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="p-2 border-t border-[var(--border)] bg-[var(--input-bg)]/50 text-center">
        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Use arrow keys to navigate • Enter to select</p>
      </div>
    </div>
  );
};
