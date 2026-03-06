import React, { useState, useRef } from 'react';
import { Upload, Image, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

export const AssetManager: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetClass, setTargetClass] = useState('kobold');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = useAuthStore((state) => state.token);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('filename', `${targetClass.toLowerCase()}.png`);

    try {
      await axios.post('http://10.0.0.231:9000/api/v1/admin/assets/upload', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      alert('Asset uploaded successfully');
      setSelectedFile(null);
    } catch (err) { alert('Upload failed'); }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 rounded-[40px] p-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-cyan-500/20 rounded-2xl text-cyan-400"><Image size={32} /></div>
          <div>
            <h2 className="text-3xl font-black tracking-tighter">Visual Asset Manager</h2>
            <p className="text-cyan-300 text-sm mt-1">Manage class-specific avatar images and system icons.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Target RPG Class</label>
              <select value={targetClass} onChange={e => setTargetClass(e.target.value)} className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-2xl py-4 px-6 outline-none font-bold">
                {['Kobold', 'Goblin', 'Troll', 'Dwarf', 'Elf', 'Wizard', 'Phoenix', 'Unicorn', 'Dragon', 'Demigod', 'God', 'BDFL'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div 
              className="border-2 border-dashed border-[var(--border)] rounded-2xl p-10 text-center cursor-pointer hover:border-[var(--accent)] transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} onChange={e => setSelectedFile(e.target.files?.[0] || null)} accept="image/png" className="hidden" />
              {selectedFile ? (
                <div className="space-y-2">
                  <CheckCircle className="mx-auto text-green-500" size={32} />
                  <p className="text-sm font-bold">{selectedFile.name}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto text-gray-400" size={32} />
                  <p className="text-sm font-bold text-gray-500">Click to select class image (.png)</p>
                </div>
              )}
            </div>

            <button onClick={handleUpload} disabled={loading || !selectedFile} className="w-full bg-[var(--accent)] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-[var(--accent)]/30 hover:scale-105 transition-all disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Overwrite Class Asset'}
            </button>
          </div>

          <div className="flex items-center justify-center border-2 border-dashed border-[var(--border)] rounded-[40px] opacity-20">
             <p className="text-sm font-bold uppercase tracking-widest">Preview Area Under Construction</p>
          </div>
        </div>
      </div>
    </div>
  );
};
