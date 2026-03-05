import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Plus, Search, ChevronRight, Clock, ArrowLeft, Send, Save, X, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = 'http://10.0.0.231:9000/api/v1';

interface Document {
  id: number;
  title: string;
  category: string;
  updated_at: string;
  content?: string;
}

export const DocumentLibrary: React.FC = () => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  
  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const resp = await axios.get(`${API_BASE_URL}/docs/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocs(resp.data);
    } catch (err) {
      console.error('Failed to fetch docs', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDoc = async (docId: number) => {
    setIsLoading(true);
    try {
      const resp = await axios.get(`${API_BASE_URL}/docs/${docId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedDoc(resp.data);
    } catch (err) {
      console.error('Failed to fetch doc detail', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await axios.post(`${API_BASE_URL}/docs/`, 
        { title: newTitle, content: newContent, category: 'SOP' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTitle('');
      setNewContent('');
      setIsCreating(false);
      fetchDocs();
    } catch (err) {
      console.error('Failed to create doc', err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredDocs = docs.filter(d => 
    d.title.toLowerCase().includes(search.toLowerCase()) || 
    d.category.toLowerCase().includes(search.toLowerCase())
  );

  // --- Render Detail View ---
  if (selectedDoc) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={() => setSelectedDoc(null)}
          className="flex items-center gap-2 text-gray-500 hover:text-[var(--foreground)] transition-colors mb-4"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back to Library</span>
        </button>
        
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded-md">
            {selectedDoc.category}
          </span>
          <h1 className="text-4xl font-bold tracking-tight">{selectedDoc.title}</h1>
        </div>

        <div className="prose dark:prose-invert max-w-none p-8 bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl shadow-sm min-h-[400px]">
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">
            {selectedDoc.content}
          </p>
        </div>
      </div>
    );
  }

  // --- Render Create Form ---
  if (isCreating) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">New SOP</h1>
          <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleCreateDoc} className="space-y-6">
          <div className="space-y-4">
            <input 
              type="text"
              placeholder="Document Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full text-2xl font-bold bg-transparent border-b border-[var(--border)] py-2 focus:border-[var(--accent)] outline-none transition-all placeholder:opacity-30"
              required
            />
            <textarea 
              placeholder="Write the SOP content here..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full h-[400px] bg-[var(--input-bg)] border border-[var(--border)] rounded-2xl p-6 outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all resize-none font-sans leading-relaxed"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 bg-[var(--accent)] text-[var(--accent-foreground)] px-6 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50 ml-auto"
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Save Document</>}
          </button>
        </form>
      </div>
    );
  }

  // --- Render List View ---
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-gray-500 mt-1">Manage and access company SOPs and technical guides.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-[var(--accent)] text-[var(--accent-foreground)] px-4 py-2.5 rounded-xl font-bold shadow-sm hover:opacity-90 transition-all"
        >
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
          className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all shadow-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map(doc => (
            <div 
              key={doc.id} 
              onClick={() => handleViewDoc(doc.id)}
              className="group p-5 bg-[var(--sidebar)] border border-[var(--border)] rounded-2xl hover:border-[var(--accent)] transition-all cursor-pointer shadow-sm hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3 text-left">
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
