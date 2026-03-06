import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Terminal, CheckCircle2, ChevronDown, ChevronUp, Sparkles, Award, Mic, Square, ImagePlus, X, Copy, Check, ThumbsUp, ThumbsDown, Download } from 'lucide-react';
import { Avatar } from './Avatar';
import { BriefingCard } from './BriefingCard';
import { TemplateSelector } from './TemplateSelector';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ContextPanel } from './chat/ContextPanel';
import { useAuthStore } from '../store/authStore';
import { submitFeedback } from '../api';
import type { Message, ToolCall } from '../types';

const ToolCallCard: React.FC<{ tool: ToolCall }> = ({ tool }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="my-2 border border-[var(--border)] rounded-xl overflow-hidden bg-white dark:bg-black/20 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-3">
          {tool.status === 'running' ? <Loader2 size={16} className="animate-spin text-[var(--accent)]" /> : <CheckCircle2 size={16} className="text-green-500" />}
          <div className="flex items-center gap-2"><Terminal size={14} className="text-gray-400" /><span className="text-sm font-medium font-mono">{tool.name}</span></div>
        </div>
        {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </div>
      {isOpen && (
        <div className="p-3 border-t border-[var(--border)] bg-gray-50/50 dark:bg-black/40 space-y-3">
          {tool.inputs && <div><p className="text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1 tracking-wider font-sans">Input</p><pre className="text-xs p-2 rounded-lg bg-white dark:bg-black/20 border border-[var(--border)] overflow-x-auto font-mono text-gray-600 dark:text-gray-300">{JSON.stringify(tool.inputs, null, 2)}</pre></div>}
          {tool.output && <div><p className="text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1 tracking-wider font-sans">Output</p><pre className="text-xs p-2 rounded-lg bg-white dark:bg-black/20 border border-[var(--border)] overflow-x-auto font-mono text-green-600 dark:text-green-400">{tool.output}</pre></div>}
        </div>
      )}
    </div>
  );
};

const MessageBubble: React.FC<{ m: Message, conversationId?: number }> = ({ m, conversationId }) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const handleCopy = () => { navigator.clipboard.writeText(m.content); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleFeedback = async (type: 'up' | 'down') => { if (!conversationId) return; setFeedback(type); await submitFeedback(conversationId, type === 'up' ? 'thumbs_up' : 'thumbs_down'); };

  return (
    <div className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {m.role === 'assistant' && <div className="mt-1 flex-shrink-0"><Avatar size={32} /></div>}
      <div className={`max-w-[85%] rounded-2xl p-4 relative group ${m.role === 'user' ? 'chat-bubble-user shadow-md' : 'chat-bubble-momo shadow-sm'}`}>
        {m.toolCalls && m.toolCalls.length > 0 && <div className="mb-4">{m.toolCalls.map(tc => <ToolCallCard key={tc.id} tool={tc} />)}</div>}
        <MarkdownRenderer content={m.content} />
        
        {/* RAG Context Panel */}
        {m.sources && m.sources.length > 0 && <ContextPanel sources={m.sources} />}
        
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {m.role === 'assistant' && (
            <>
              <button onClick={() => handleFeedback('up')} className={`p-1.5 rounded-lg transition-colors ${feedback === 'up' ? 'bg-green-500/20 text-green-500' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}><ThumbsUp size={14} /></button>
              <button onClick={() => handleFeedback('down')} className={`p-1.5 rounded-lg transition-colors ${feedback === 'down' ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}><ThumbsDown size={14} /></button>
            </>
          )}
          <button onClick={handleCopy} className="p-1.5 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20">{copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}</button>
        </div>
      </div>
    </div>
  );
};

export const Chat: React.FC<{ messages: Message[], onSendMessage: (input: string, imageData?: string) => void, status: string | null, momoState: string, xpUpdate: any, unlockedAchievements: string[], voice: any, conversationId?: number }> = ({ messages, onSendMessage, status, momoState, xpUpdate, unlockedAchievements, voice, conversationId }) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const user = useAuthStore((state) => state.user);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const handleScroll = () => { if (!containerRef.current) return; const { scrollTop, scrollHeight, clientHeight } = containerRef.current; setShouldAutoScroll(scrollHeight - scrollTop - clientHeight < 100); };
  useEffect(() => { if (shouldAutoScroll) scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, status, shouldAutoScroll]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.ctrlKey && e.key === 't') { e.preventDefault(); setShowTemplates(prev => !prev); } };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setSelectedImage((reader.result as string).split(',')[1]); reader.readAsDataURL(file); } };
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!input.trim() && !selectedImage) return; onSendMessage(input, selectedImage || undefined); setInput(''); setSelectedImage(null); setShouldAutoScroll(true); };
  const handleTemplateSelect = (prompt: string) => { setInput(prompt); setShowTemplates(false); inputRef.current?.focus(); };
  const exportChat = () => { const content = messages.map(m => `[${m.role.toUpperCase()}]\n${m.content}`).join('\n\n'); const blob = new Blob([content], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `momo-chat-${Date.now()}.txt`; a.click(); };

  const { voiceState, startVoice, stopVoice } = voice;

  return (
    <div className="flex flex-col h-full bg-[var(--background)] font-sans relative">
      <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center py-10 animate-in fade-in zoom-in duration-1000">
            <div className="mb-10 w-full flex justify-center"><BriefingCard /></div>
            <h2 className="text-5xl font-bold mb-4 text-[var(--foreground)] tracking-tight">Hello, {user?.name || 'Louis'}</h2>
            <p className="text-lg text-gray-500 font-medium max-w-lg mx-auto">Momo is ready. Use the mic, type below, or press <kbd className="bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-sm mx-1">Ctrl+T</kbd> for templates.</p>
          </div>
        )}
        
        <div className="max-w-3xl mx-auto space-y-8 w-full">
          {messages.map((m) => <MessageBubble key={m.id} m={m} conversationId={conversationId} />)}
          {(status || voiceState !== 'idle') && (
            <div className="flex items-center gap-4 text-sm text-gray-500 ml-12 animate-pulse">
              <Loader2 size={16} className="animate-spin text-[var(--accent)]" />
              <span className="font-bold tracking-tight uppercase text-[10px] tracking-widest">{voiceState === 'listening' ? 'Momo is listening...' : voiceState === 'speaking' ? 'Momo is speaking...' : status || 'Momo is processing...'}</span>
            </div>
          )}
          <div className="space-y-2 flex flex-col items-end">
            {xpUpdate && <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1.5 rounded-full w-fit mr-2 animate-bounce shadow-sm"><Sparkles size={12} /><span>+{xpUpdate.amount} XP earned</span></div>}
          </div>
        </div>
        <div ref={scrollRef} />
      </div>

      <div className="absolute top-4 right-8 z-20">
        {messages.length > 0 && <button onClick={exportChat} className="flex items-center gap-2 bg-[var(--sidebar)] border border-[var(--border)] px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-[var(--accent)] transition-colors shadow-sm"><Download size={14} /> Export Chat</button>}
      </div>

      {showTemplates && <TemplateSelector onSelect={handleTemplateSelect} onClose={() => setShowTemplates(false)} />}

      <div className="p-6">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-4">
          {selectedImage && <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-[var(--accent)] shadow-lg animate-in zoom-in-95"><img src={`data:image/png;base64,${selectedImage}`} alt="Preview" className="w-full h-full object-cover" /><button type="button" onClick={() => setSelectedImage(null)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"><X size={12} /></button></div>}
          <div className="relative group flex items-center gap-3">
            <div className="relative flex-1">
              <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask Momo anything..." className="w-full bg-[var(--input-bg)] text-[var(--foreground)] border border-[var(--border)] rounded-2xl py-5 pl-14 pr-14 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all shadow-sm" disabled={voiceState !== 'idle'} />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[var(--accent)]"><ImagePlus size={20} /></button>
              <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-[var(--accent)] text-white rounded-xl hover:opacity-90 shadow-sm" disabled={(!input.trim() && !selectedImage) || voiceState !== 'idle'}><Send size={22} /></button>
            </div>
            <button type="button" onClick={voiceState === 'idle' ? startVoice : stopVoice} className={`p-4 rounded-2xl border transition-all shadow-sm ${voiceState === 'listening' ? 'bg-red-500 text-white border-red-600 animate-pulse' : 'bg-[var(--sidebar)] text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--accent)]'}`}>{voiceState === 'idle' ? <Mic size={24} /> : <Square size={24} />}</button>
          </div>
        </form>
        <p className="text-[11px] text-center mt-3 text-gray-400 font-bold uppercase tracking-widest opacity-50">Momo v2.0.6 • Source Transparency Active</p>
      </div>
    </div>
  );
};
