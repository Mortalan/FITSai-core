import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FileText, Plus, Search, ChevronRight, Clock, ArrowLeft, Save, X, Loader2, UploadCloud, FileDown, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = 'http://10.0.0.231:9000/api/v1/docs';

interface Document {
  id: number; title: string; category: string; updated_at: string; content?: string;
}

export const DocumentLibrary: React.FC = () => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [search, setSearch] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => { fetchDocs(); }, []);

  const fetchDocs = async () => {
    try {
      const resp = await axios.get(`${API_BASE_URL}/`, { headers: { Authorization: `Bearer ${token}` } });
      setDocs(resp.data);
    } catch (err) {} finally { setIsLoading(false); }
  };

  const handleViewDoc = async (docId: number) => {
    setIsLoading(true);
    try {
      const resp = await axios.get(`${API_BASE_URL}/${docId}`, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedDoc(resp.data);
    } catch (err) {} finally { setIsLoading(false); }
  };

  const handleAnalyze = async (mode: string) => {
    if (!selectedDoc) return;
    setIsProcessing(true);
    try {
      const resp = await axios.post(`${API_BASE_URL}/${selectedDoc.id}/analyze?mode=${mode}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert(resp.data.analysis);
    } catch (err) { alert('Analysis failed'); }
    setIsProcessing(false);
  };

  const handleConvert = async () => {
    if (!selectedDoc) return;
    setIsProcessing(true);
    try {
      const resp = await axios.post(`${API_BASE_URL}/${selectedDoc.id}/convert`, {}, {
        headers: { Authorization: `Bearer ${token}` }, responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const a = document.createElement('a'); a.href = url; a.download = `${selectedDoc.title}.pdf`; a.click();
    } catch (err) { alert('Conversion failed'); }
    setIsProcessing(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    const formData = new FormData(); formData.append('file', file);
    try {
      await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      fetchDocs();
    } catch (err) {}
  };

  const filteredDocs = docs.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));

  if (selectedDoc) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setSelectedDoc(null)} className="flex items-center gap-2 text-gray-500 hover:text-[var(--foreground)] transition-colors"><ArrowLeft size={18} /> Back</button>
          <div className="flex gap-2">
            <button onClick={() => handleAnalyze('summarize')} disabled={isProcessing} className="flex items-center gap-2 bg-blue-500/10 text-blue-600 px-3 py-1.5 rounded-xl text-xs font-bold">{isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Summarize</button>
            <button onClick={handleConvert} disabled={isProcessing} className="flex items-center gap-2 bg-red-500/10 text-red-600 px-3 py-1.5 rounded-xl text-xs font-bold">{isProcessing ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />} Export PDF</button>
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">{selectedDoc.title}</h1>
        <div className="p-8 bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl shadow-sm min-h-[400px]">
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">{selectedDoc.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1><p className="text-gray-500 mt-1">Technical SOPs and guides. RAG Vectorization active.</p></div>
        <div className="flex items-center gap-3">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.docx,.txt" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-[var(--input-bg)] text-[var(--foreground)] border border-[var(--border)] px-4 py-2.5 rounded-xl font-bold"><UploadCloud size={18} /> Upload</button>
        </div>
      </div>
      <div className="relative group"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="Search documentation..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-[var(--accent)]" /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map(doc => (
          <div key={doc.id} onClick={() => handleViewDoc(doc.id)} className="group p-5 bg-[var(--sidebar)] border border-[var(--border)] rounded-2xl hover:border-[var(--accent)] transition-all cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="space-y-3 text-left">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded">{doc.category}</span>
                <h3 className="text-lg font-bold group-hover:text-[var(--accent)] transition-colors">{doc.title}</h3>
                <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold uppercase"><Clock size={12} /><span>Updated {new Date(doc.updated_at).toLocaleDateString()}</span></div>
              </div>
              <div className="p-2 rounded-full bg-white dark:bg-black/20 text-gray-400 group-hover:text-[var(--accent)]"><ChevronRight size={20} /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
