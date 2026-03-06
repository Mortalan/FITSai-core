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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-2xl"><Terminal size={32} /></div>
          <div>
            <h2 className="text-2xl font-bold">Momo CLI Tool</h2>
            <p className="opacity-80 text-sm mt-1">v{data?.cli_version} • Technical automation from your terminal</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data?.downloads.map((d: any) => (
          <div key={d.platform} className="p-6 bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--input-bg)] rounded-xl"><Laptop size={20} className="text-gray-400" /></div>
              <h4 className="font-bold text-sm">{d.display_name}</h4>
            </div>
            <p className="text-xs text-gray-500">{d.description}</p>
            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase">{d.available ? `${(d.file_size / 1024 / 1024).toFixed(1)} MB` : 'Pending'}</span>
              {d.available ? (
                <button className="flex items-center gap-2 bg-[var(--accent)] text-white px-3 py-1.5 rounded-lg text-xs font-bold"><Download size={14} /> Get</button>
              ) : (
                <span className="text-[10px] font-bold text-gray-400 uppercase">Coming Soon</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
