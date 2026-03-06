import React, { useState, useEffect } from 'react';
import { FileText, Database, Clock, RefreshCw, Loader2, Search } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

export const DocsPanel: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    axios.get('http://10.0.0.231:9000/api/v1/admin/stats', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setStats(res.data)).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[var(--accent)]" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl space-y-2">
          <FileText className="text-blue-500" size={24} />
          <p className="text-xs font-bold text-gray-400 uppercase">Total Documents</p>
          <h3 className="text-3xl font-bold">{stats?.knowledge_base?.split(' ')[0] || 0}</h3>
        </div>
        <div className="p-6 bg-[var(--sidebar)] border border border-[var(--border)] rounded-3xl space-y-2">
          <Database className="text-green-500" size={24} />
          <p className="text-xs font-bold text-gray-400 uppercase">RAG Vector Chunks</p>
          <h3 className="text-3xl font-bold">1,242</h3>
        </div>
        <div className="p-6 bg-[var(--sidebar)] border border border-[var(--border)] rounded-3xl space-y-2">
          <Clock className="text-purple-500" size={24} />
          <p className="text-xs font-bold text-gray-400 uppercase">Last Ingestion</p>
          <h3 className="text-lg font-bold">2 hours ago</h3>
        </div>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/20 p-8 rounded-3xl space-y-4">
        <div className="flex items-center gap-3">
          <Database className="text-blue-600" size={24} />
          <h3 className="font-bold text-blue-900 dark:text-blue-100">Knowledge Base Health</h3>
        </div>
        <p className="text-sm text-blue-800/70 dark:text-blue-200/70 leading-relaxed">
          The RAG (Retrieval-Augmented Generation) system is currently indexing the company's SOPs. 
          Semantic search is active across all 12 departments.
        </p>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:opacity-90 transition-all">
          <RefreshCw size={14} /> Force Re-index Vector Store
        </button>
      </div>
    </div>
  );
};
