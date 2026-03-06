import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Plus, Search, ChevronRight, Clock, ArrowLeft, Loader2, UploadCloud, FileDown, Sparkles, ShieldCheck, BookOpen
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = 'http://10.0.0.231:9000/api/v1/docs';
const LIBRARY_BASE_URL = 'http://10.0.0.231:9000/api/v1/library';

interface Document {
  id: any; title: string; category: string; updated_at?: string; content?: string; filename?: string;
}

export const DocumentLibrary: React.FC<{ type: 'SOP' | 'KB', forceCategory?: string }> = ({ type, forceCategory }) => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => { fetchDocs(); }, [type, forceCategory, token]);

  const fetchDocs = async () => {
    setIsLoading(true);
    try {
      if (type === 'SOP') {
        const resp = await axios.get(`${API_BASE_URL}/`, { headers: { Authorization: `Bearer ${token}` } });
        // TRIPLE CHECK: Filter out anything that is NOT a verified SOP
        setDocs(resp.data.filter((d: any) => d.category === 'SOP'));
      } else if (forceCategory === 'GOD_MODE') {
        const resp = await axios.get(`${API_BASE_URL}/`, { headers: { Authorization: `Bearer ${token}` } });
        setDocs(resp.data.filter((d: any) => d.category === 'GOD_MODE'));
      } else {
        const resp = await axios.get(`${LIBRARY_BASE_URL}/`, { headers: { Authorization: `Bearer ${token}` } });
        // File library (KB) should not show SOPs or System Docs
        setDocs(resp.data.filter((d: any) => d.category !== 'SOP' && d.category !== 'GOD_MODE'));
      }
    } catch (err) {}
    setIsLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    formData.append('category', forceCategory || (type === 'SOP' ? 'SOP' : 'General'));
    
    try {
      const url = (type === 'SOP' || forceCategory === 'GOD_MODE') ? `${API_BASE_URL}/upload` : `${LIBRARY_BASE_URL}/upload`;
      await axios.post(url, formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
      fetchDocs();
    } catch (err) { alert('Upload failed'); }
  };

  const filteredDocs = docs.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));

  if (selectedDoc) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button onClick={() => setSelectedDoc(null)} className="flex items-center gap-2 text-gray-500 hover:text-[var(--foreground)] font-black transition-all bg-[var(--input-bg)] px-5 py-2.5 rounded-2xl mb-4"><ArrowLeft size={18} /> BACK TO LIST</button>
        <div className="bg-[var(--sidebar)] border border-[var(--border)] rounded-[48px] p-16 shadow-sm min-h-[700px]">
          <h1 className="text-4xl font-bold mb-10">{selectedDoc.title}</h1>
          <p className="whitespace-pre-wrap text-lg leading-relaxed text-gray-700 dark:text-gray-300">{selectedDoc.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-[var(--sidebar)] p-12 border border-[var(--border)] rounded-[48px] shadow-sm">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{forceCategory === 'GOD_MODE' ? 'System Documents' : type === 'SOP' ? 'Technical SOPs' : 'File Library'}</h1>
          <p className="text-gray-500 font-medium mt-3 text-lg">{forceCategory === 'GOD_MODE' ? 'Internal system architecture.' : type === 'SOP' ? 'Verified technical procedures.' : 'Manuals, drivers, and reference documents.'}</p>
        </div>
        <div className="flex items-center gap-4">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.docx,.txt" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 bg-[var(--accent)] text-white px-8 py-4 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl shadow-[var(--accent)]/30 hover:scale-105 transition-all"><UploadCloud size={20} /> Ingest Document</button>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400" size={28} />
        <input type="text" placeholder="Search catalog..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-[32px] py-8 pl-20 pr-10 outline-none text-xl font-bold focus:ring-8 focus:ring-[var(--accent)]/10 transition-all" />
      </div>

      {isLoading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--accent)]" size={40} /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDocs.length === 0 ? <div className="col-span-full text-center py-32 text-gray-400 font-black uppercase tracking-[0.3em] opacity-30">Section Empty.</div> : filteredDocs.map(doc => (
            <div key={doc.id} onClick={() => setSelectedDoc(doc)} className="group p-10 bg-[var(--sidebar)] border border-[var(--border)] rounded-[40px] hover:border-[var(--accent)] transition-all cursor-pointer shadow-sm hover:shadow-2xl relative overflow-hidden">
              <div className="flex flex-col h-full space-y-6 relative z-10">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase px-4 py-1.5 bg-[var(--accent)]/5 text-[var(--accent)] rounded-xl border border-[var(--accent)]/10">{doc.category}</span>
                  {doc.category === 'SOP' ? <ShieldCheck className="text-green-500" size={22} /> : <BookOpen size={22} className="text-blue-500" />}
                </div>
                <h3 className="text-2xl font-black leading-tight group-hover:text-[var(--accent)] transition-colors">{doc.title}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
