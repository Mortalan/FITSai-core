import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Plus, Search, ChevronRight, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = 'http://10.0.0.231:9000/api/v1';

interface Document {
  id: number;
  title: string;
  category: string;
  updated_at: string;
}

export const DocumentLibrary: React.FC = () => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const resp = await axios.get(`${API_BASE_URL}/docs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocs(resp.data);
    } catch (err) {
      console.error('Failed to fetch docs', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDocs = docs.filter(d => 
    d.title.toLowerCase().includes(search.toLowerCase()) || 
    d.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-gray-500 mt-1">Manage and access company SOPs and technical guides.</p>
        </div>
        <button className="flex items-center gap-2 bg-[var(--accent)] text-[var(--accent-foreground)] px-4 py-2.5 rounded-xl font-bold shadow-sm hover:opacity-90 transition-all">
          <Plus size={18} />
          <span>New SOP</span>
        </button>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--accent)] transition-colors" size={20} />
        <input 
          type="text"
          placeholder="Search documentation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map(doc => (
            <div key={doc.id} className="group p-5 bg-[var(--sidebar)] border border-[var(--border)] rounded-2xl hover:border-[var(--accent)] transition-all cursor-pointer shadow-sm hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded-md">
                      {doc.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold group-hover:text-[var(--accent)] transition-colors line-clamp-1">{doc.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>Updated {new Date(doc.updated_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText size={12} />
                      <span>v1.0</span>
                    </div>
                  </div>
                </div>
                <div className="p-2 rounded-full bg-white dark:bg-black/20 text-gray-400 group-hover:text-[var(--accent)] transition-colors">
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && filteredDocs.length === 0 && (
        <div className="text-center py-20 opacity-50">
          <FileText size={48} className="mx-auto mb-4" />
          <p className="text-lg font-medium">No documents found matching your search.</p>
        </div>
      )}
    </div>
  );
};
