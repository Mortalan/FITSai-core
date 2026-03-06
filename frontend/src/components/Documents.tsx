import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Plus, Search, ChevronRight, Clock, ArrowLeft, Loader2, UploadCloud, FileDown, Sparkles, ShieldCheck, BookOpen
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = 'http://10.0.0.231:9000/api/v1/docs';

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
      const resp = await axios.get(`${API_BASE_URL}/`, { headers: { Authorization: `Bearer ${token}` } });
      let data = resp.data;
      
      // TRIPLE CHECK: Category Filtering Logic
      if (forceCategory) {
        data = data.filter((d: any) => d.category === forceCategory);
      } else if (type === 'SOP') {
        data = data.filter((d: any) => d.category === 'SOP');
      } else {
        // KB shows everything that IS NOT an SOP and IS NOT a System Doc
        data = data.filter((d: any) => d.category !== 'SOP' && d.category !== 'GOD_MODE');
      }
      setDocs(data);
    } catch (err) { alert('Failed to fetch docs'); }
    setIsLoading(false);
  };

  const filteredDocs = docs.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));

  if (selectedDoc) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button onClick={() => setSelectedDoc(null)} className="flex items-center gap-2 text-gray-500 hover:text-[var(--foreground)] font-bold transition-all bg-[var(--input-bg)] px-4 py-2 rounded-xl"><ArrowLeft size={18} /> Back</button>
        <div className="bg-[var(--sidebar)] border border-[var(--border)] rounded-[40px] p-12 shadow-sm min-h-[600px] relative">
          <h1 className="text-5xl font-black tracking-tighter mb-8">{selectedDoc.title}</h1>
          <p className="whitespace-pre-wrap text-[16px] leading-relaxed text-gray-700 dark:text-gray-300">{selectedDoc.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-[var(--sidebar)] p-10 border border-[var(--border)] rounded-[40px] shadow-sm">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">
            {forceCategory === 'GOD_MODE' ? 'System Documents' : type === 'SOP' ? 'Technical SOPs' : 'Knowledge Base'}
          </h1>
          <p className="text-gray-500 font-medium mt-2">
            {forceCategory === 'GOD_MODE' ? 'Internal system architecture.' : type === 'SOP' ? 'Verified technical procedures.' : 'Reference guides and manuals.'}
          </p>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
        <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-3xl py-6 pl-16 pr-8 outline-none text-lg font-medium transition-all" />
      </div>

      {isLoading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--accent)]" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.length === 0 ? <div className="col-span-full text-center py-20 text-gray-400 font-bold uppercase tracking-widest">Section Empty.</div> : filteredDocs.map(doc => (
            <div key={doc.id} onClick={() => setSelectedDoc(doc)} className="group p-8 bg-[var(--sidebar)] border border-[var(--border)] rounded-[32px] hover:border-[var(--accent)] transition-all cursor-pointer shadow-sm relative overflow-hidden">
              <div className="flex flex-col h-full space-y-4 relative z-10">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase px-3 py-1 bg-[var(--accent)]/5 text-[var(--accent)] rounded-lg">{doc.category}</span>
                  {doc.category === 'SOP' ? <ShieldCheck className="text-green-500" size={18} /> : <BookOpen size={18} className="text-blue-500" />}
                </div>
                <h3 className="text-xl font-black leading-tight">{doc.title}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
