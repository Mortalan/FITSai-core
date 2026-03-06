import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  FileText, Plus, Search, ChevronRight, Clock, ArrowLeft, Save, X, 
  Loader2, UploadCloud, FileDown, Sparkles, ShieldCheck, BookOpen, FileCode2
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = 'http://10.0.0.231:9000/api/v1/docs';
const LIBRARY_BASE_URL = 'http://10.0.0.231:9000/api/v1/library';

interface Document {
  id: any; title: string; category: string; updated_at?: string; content?: string; filename?: string;
}

export const DocumentLibrary: React.FC<{ type: 'SOP' | 'KB' }> = ({ type }) => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [search, setSearch] = useState('');
  const token = useAuthStore((state) => state.token);

  useEffect(() => { fetchDocs(); }, [type]);

  const fetchDocs = async () => {
    setIsLoading(true);
    try {
      if (type === 'SOP') {
        const resp = await axios.get(`${API_BASE_URL}/`, { headers: { Authorization: `Bearer ${token}` } });
        setDocs(resp.data.filter((d: any) => d.category === 'SOP'));
      } else {
        const resp = await axios.get(`${LIBRARY_BASE_URL}/`, { headers: { Authorization: `Bearer ${token}` } });
        setDocs(resp.data);
      }
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  const handleDownload = (filename: string) => {
    window.open(`${LIBRARY_BASE_URL}/${filename}?token=${token}`, '_blank');
  };

  const filteredDocs = docs.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-[var(--sidebar)] p-10 border border-[var(--border)] rounded-[40px] shadow-sm">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">{type === 'SOP' ? 'Technical SOPs' : 'File Library'}</h1>
          <p className="text-gray-500 font-medium mt-2">{type === 'SOP' ? 'Verified Standard Operating Procedures.' : 'Manuals, drivers, and reference documents.'}</p>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
        <input type="text" placeholder="Search documentation..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-3xl py-6 pl-16 pr-8 outline-none text-lg font-medium transition-all" />
      </div>

      {isLoading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--accent)]" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.length === 0 ? <div className="col-span-full text-center py-20 text-gray-400 font-bold uppercase tracking-widest opacity-50">No documents found in this section.</div> : filteredDocs.map(doc => (
            <div key={doc.id} onClick={() => type === 'KB' && doc.filename ? handleDownload(doc.filename) : null} className="group p-8 bg-[var(--sidebar)] border border-[var(--border)] rounded-[32px] hover:border-[var(--accent)] transition-all cursor-pointer shadow-sm relative overflow-hidden">
              <div className="flex flex-col h-full space-y-4 relative z-10">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase px-3 py-1 bg-[var(--accent)]/5 text-[var(--accent)] rounded-lg">{type === 'SOP' ? 'PROCEDURE' : 'MANUAL'}</span>
                  {type === 'SOP' ? <ShieldCheck className="text-green-500" size={18} /> : <FileDown size={18} className="text-blue-500" />}
                </div>
                <h3 className="text-xl font-black leading-tight">{doc.title}</h3>
                <div className="mt-auto pt-4 border-t border-[var(--border)]">
                   <span className="text-[10px] text-gray-400 font-black uppercase">{type === 'KB' ? `FILE: ${doc.filename}` : `UPDATED: ${new Date(doc.updated_at || '').toLocaleDateString()}`}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
