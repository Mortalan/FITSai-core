import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  FileText, Plus, Search, ChevronRight, Clock, ArrowLeft, Save, X, 
  Loader2, UploadCloud, FileDown, Sparkles, ShieldCheck, Bookmark, FileCode2
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = 'http://10.0.0.231:9000/api/v1/docs';

interface Document {
  id: number; title: string; category: string; updated_at: string; content?: string;
}

export const DocumentLibrary: React.FC<{ forceCategory?: string }> = ({ forceCategory }) => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => { fetchDocs(); }, [forceCategory]);

  const fetchDocs = async () => {
    try {
      const resp = await axios.get(`${API_BASE_URL}/`, { headers: { Authorization: `Bearer ${token}` } });
      let data = resp.data;
      if (forceCategory) data = data.filter((d: any) => d.category === forceCategory);
      setDocs(data);
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
    if (forceCategory) formData.append('category', forceCategory);
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
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <button onClick={() => setSelectedDoc(null)} className="flex items-center gap-2 text-gray-500 hover:text-[var(--foreground)] font-bold transition-all bg-[var(--input-bg)] px-4 py-2 rounded-xl"><ArrowLeft size={18} /> Back to Library</button>
          <div className="flex gap-3">
            <button onClick={() => handleAnalyze('summarize')} disabled={isProcessing} className="flex items-center gap-2 bg-blue-500/10 text-blue-600 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border border-blue-500/20 shadow-sm">{isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} AI Summarize</button>
            <button onClick={handleConvert} disabled={isProcessing} className="flex items-center gap-2 bg-red-500/10 text-red-600 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border border-red-500/20 shadow-sm">{isProcessing ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />} Export PDF</button>
          </div>
        </div>
        <div className="bg-[var(--sidebar)] border border-[var(--border)] rounded-[40px] p-12 shadow-sm min-h-[600px] relative">
          <div className="absolute top-10 right-10 flex gap-2">
            <span className="px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-black uppercase rounded-lg border border-[var(--accent)]/20">{selectedDoc.category}</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-8">{selectedDoc.title}</h1>
          <div className="prose dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-[16px] leading-relaxed text-gray-700 dark:text-gray-300">{selectedDoc.content}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-[var(--sidebar)] p-10 border border-[var(--border)] rounded-[40px] shadow-sm">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">{forceCategory === 'SOP' ? 'Technical SOPs' : 'Knowledge Base'}</h1>
          <p className="text-gray-500 font-medium mt-2">{forceCategory === 'SOP' ? 'Standard Operating Procedures for high-risk technical operations.' : 'Search company documentation and technical guides.'}</p>
        </div>
        <div className="flex items-center gap-4">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.docx,.txt" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-[var(--accent)] text-white px-6 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-[var(--accent)]/30 hover:opacity-90 transition-all"><UploadCloud size={18} /> Ingest Document</button>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
        <input type="text" placeholder="Search documentation..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-3xl py-6 pl-16 pr-8 outline-none focus:ring-4 focus:ring-[var(--accent)]/10 text-lg font-medium transition-all" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map(doc => (
          <div key={doc.id} onClick={() => handleViewDoc(doc.id)} className="group p-8 bg-[var(--sidebar)] border border-[var(--border)] rounded-[32px] hover:border-[var(--accent)] transition-all cursor-pointer shadow-sm hover:shadow-xl relative overflow-hidden">
            <div className="absolute -right-2 -top-2 opacity-5 group-hover:opacity-10 transition-opacity">
              {doc.category === 'SOP' ? <FileCode2 size={120} /> : <BookOpen size={120} />}
            </div>
            <div className="flex flex-col h-full space-y-4 relative z-10">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-[var(--accent)]/5 text-[var(--accent)] rounded-lg border border-[var(--accent)]/10">{doc.category}</span>
                {doc.category === 'SOP' && <ShieldCheck className="text-green-500" size={18} />}
              </div>
              <h3 className="text-xl font-black leading-tight group-hover:text-[var(--accent)] transition-colors line-clamp-2">{doc.title}</h3>
              <div className="mt-auto flex items-center gap-4 text-[10px] text-gray-400 font-black uppercase tracking-widest pt-4 border-t border-[var(--border)]">
                <Clock size={12} /><span>Updated {new Date(doc.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
