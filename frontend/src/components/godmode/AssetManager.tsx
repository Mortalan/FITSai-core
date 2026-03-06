import React, { useState, useRef } from 'react';
import { Upload, Image, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

export const AssetManager: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetClass, setTargetClass] = useState('Kobold');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = useAuthStore((state) => state.token);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    
    // TRIPLE CHECK: Use standard FormData fields expected by the restored endpoint
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('filename', `${targetClass.toLowerCase()}.png`);

    try {
      await axios.post('http://10.0.0.231:9000/api/v1/admin/assets/upload', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Asset uploaded successfully');
      setSelectedFile(null);
    } catch (err) { 
      console.error(err);
      alert('Upload failed'); 
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-[var(--accent)]/20 rounded-[40px] p-10 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-[var(--accent)]/20 rounded-2xl text-[var(--accent)]"><Image size={32} /></div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Visual Asset Manager</h2>
            <p className="text-gray-500 font-medium text-sm mt-1">Manage class-specific avatar images and system icons.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[var(--sidebar)] border border-[var(--border)] rounded-[32px] p-8 space-y-6 shadow-sm">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Target RPG Class</label>
              <select value={targetClass} onChange={e => setTargetClass(e.target.value)} className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-2xl py-4 px-6 outline-none font-bold text-sm">
                {['Kobold', 'Goblin', 'Troll', 'Dwarf', 'Elf', 'Wizard', 'Phoenix', 'Unicorn', 'Dragon', 'Demigod', 'God', 'BDFL'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div 
              className="border-2 border-dashed border-[var(--border)] rounded-2xl p-12 text-center cursor-pointer hover:border-[var(--accent)] transition-all bg-[var(--input-bg)]/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} onChange={e => setSelectedFile(e.target.files?.[0] || null)} accept="image/png" className="hidden" />
              {selectedFile ? (
                <div className="space-y-2">
                  <CheckCircle className="mx-auto text-green-500" size={40} />
                  <p className="text-sm font-bold">{selectedFile.name}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto text-gray-400" size={40} />
                  <p className="text-sm font-bold text-gray-500">Click to select .png asset</p>
                </div>
              )}
            </div>

            <button onClick={handleUpload} disabled={loading || !selectedFile} className="w-full bg-[var(--accent)] text-white py-4 rounded-2xl font-bold uppercase text-xs tracking-widest shadow-lg shadow-[var(--accent)]/30 hover:scale-[1.02] transition-all disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Overwrite Class Asset'}
            </button>
          </div>

          <div className="flex flex-col items-center justify-center border border-[var(--border)] rounded-[40px] bg-[var(--input-bg)]/30 p-10">
             <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden mb-6">
               {selectedFile ? <img src={URL.createObjectURL(selectedFile)} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400"><Image size={40} /></div>}
             </div>
             <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Preview</p>
          </div>
        </div>
      </div>
    </div>
  );
};
