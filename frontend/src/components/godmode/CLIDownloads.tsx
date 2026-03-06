import React, { useState, useEffect } from 'react';
import { Download, Terminal, Laptop, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

export const CLIDownloads: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    axios.get('http://10.0.0.231:9000/api/v1/admin/downloads', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setData(res.data)).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[var(--accent)]" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[40px] p-10 text-white shadow-xl shadow-blue-500/20">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-white/20 rounded-[24px]"><Terminal size={40} /></div>
          <div>
            <h2 className="text-3xl font-black tracking-tighter">Momo CLI Toolset</h2>
            <p className="opacity-80 text-sm mt-1">v{data?.cli_version} • Deploy, Debug, and Automate from your local machine</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data?.downloads.map((d: any) => (
          <div key={d.platform} className="p-8 bg-[var(--sidebar)] border border-[var(--border)] rounded-[32px] space-y-6 hover:border-[var(--accent)] transition-all shadow-sm group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--input-bg)] rounded-2xl group-hover:bg-[var(--accent)]/10 transition-colors"><Laptop size={24} className="text-gray-400 group-hover:text-[var(--accent)]" /></div>
              <div>
                <h4 className="font-black text-lg tracking-tight">{d.display_name}</h4>
                <p className="text-[10px] font-black uppercase text-gray-400">{d.available ? `${(d.file_size / 1024 / 1024).toFixed(1)} MB` : 'Pending Release'}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed min-h-[40px]">{d.description}</p>
            {d.available ? (
              <button onClick={() => window.open(`http://10.0.0.231:9000/api/v1/library/cli_${d.platform}.zip?token=${token}`, '_blank')} className="w-full flex items-center justify-center gap-2 bg-[var(--accent)] text-white py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-[var(--accent)]/30 hover:scale-[1.02] transition-all">
                <Download size={16} /> Download {d.platform.toUpperCase()}
              </button>
            ) : (
              <div className="w-full text-center py-3.5 bg-gray-100 dark:bg-white/5 rounded-2xl text-[10px] font-black uppercase text-gray-400 tracking-widest">Not Available</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
