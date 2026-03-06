import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Mic, Upload, FileText, Download, Loader2, X, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://10.0.0.231:9000/api/v1/meetings';

export const MeetingTranscription: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [info, setInfo] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/info`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setInfo(res.data))
      .catch(() => {});
  }, [token]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
  };

  const handleTranscribe = async () => {
    if (!selectedFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await axios.post(`${API_BASE_URL}/transcribe`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setJobs(prev => [...prev, { job_id: res.data.job_id, status: 'pending', message: 'Starting...' }]);
      pollStatus(res.data.job_id);
      setSelectedFile(null);
    } catch (err) {
      alert('Upload failed');
    }
    setUploading(false);
  };

  const pollStatus = useCallback(async (jobId: string) => {
    const poll = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/status/${jobId}`, { headers: { Authorization: `Bearer ${token}` } });
        setJobs(prev => prev.map(j => j.job_id === jobId ? { ...j, ...res.data } : j));
        if (res.data.status === 'processing' || res.data.status === 'pending') {
          setTimeout(poll, 3000);
        }
      } catch (err) {}
    };
    poll();
  }, [token]);

  const handleDownload = async (jobId: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/download/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcript-${jobId}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) { alert('Download failed'); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-3xl p-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-purple-500/20 rounded-2xl text-purple-400"><Mic size={32} /></div>
          <div>
            <h2 className="text-2xl font-bold">Meeting Transcription</h2>
            <p className="text-purple-300 text-sm mt-1">Convert audio recordings to text documents autonomously.</p>
          </div>
        </div>
      </div>

      <div className="bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl p-8 shadow-sm">
        <div 
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${selectedFile ? 'border-green-500/50 bg-green-500/5' : 'border-[var(--border)] hover:border-[var(--accent)]'}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".mp3,.wav,.m4a,.mp4" className="hidden" />
          {selectedFile ? (
            <div className="flex flex-col items-center gap-3">
              <FileText className="text-green-500" size={48} />
              <p className="font-bold">{selectedFile.name}</p>
              <span className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className="text-gray-400" size={48} />
              <p className="font-bold">Click or drag audio file to upload</p>
              <span className="text-xs text-gray-500">Supports {info?.supported_formats.join(', ')} (Max {info?.max_file_size_mb}MB)</span>
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="mt-6 flex justify-end">
            <button onClick={handleTranscribe} disabled={uploading} className="flex items-center gap-2 bg-[var(--accent)] text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg">
              {uploading ? <Loader2 size={18} className="animate-spin" /> : <Mic size={18} />} 
              Start Transcription
            </button>
          </div>
        )}
      </div>

      {jobs.length > 0 && (
        <div className="bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl p-6">
          <h3 className="font-bold uppercase text-xs tracking-widest text-gray-400 mb-4">Active Jobs</h3>
          <div className="space-y-3">
            {jobs.map(j => (
              <div key={j.job_id} className="p-4 bg-[var(--input-bg)] rounded-2xl border border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {j.status === 'processing' || j.status === 'pending' ? <Loader2 className="text-blue-500 animate-spin" size={20} /> :
                   j.status === 'completed' ? <CheckCircle className="text-green-500" size={20} /> : <AlertCircle className="text-red-500" size={20} />}
                  <div>
                    <h4 className="font-bold text-sm uppercase">{j.status}</h4>
                    <p className="text-xs text-gray-500 mt-1">{j.message}</p>
                  </div>
                </div>
                {j.status === 'completed' && (
                  <button onClick={() => handleDownload(j.job_id)} className="flex items-center gap-2 bg-green-500/10 text-green-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-500/20 transition-all">
                    <Download size={14} /> Download
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
