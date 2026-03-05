import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Terminal, CheckCircle2, ChevronDown, ChevronUp, Sparkles, Award, Mic, Square } from 'lucide-react';
import { streamMomo } from '../api';
import { useAuthStore } from '../store/authStore';
import useVoice from '../hooks/useVoice';
import { Avatar } from './Avatar';
import { HolographicAvatar } from './HolographicAvatar';
import { BriefingCard } from './BriefingCard';
import type { Message, ToolCall } from '../types';

const ToolCallCard: React.FC<{ tool: ToolCall }> = ({ tool }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-2 border border-[var(--border)] rounded-xl overflow-hidden bg-white dark:bg-black/20 shadow-sm transition-all hover:shadow-md">
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          {tool.status === 'running' ? (
            <Loader2 size={16} className="animate-spin text-[var(--accent)]" />
          ) : (
            <CheckCircle2 size={16} className="text-green-500" />
          )}
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-gray-400" />
            <span className="text-sm font-medium font-mono">{tool.name}</span>
          </div>
        </div>
        {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </div>
      
      {isOpen && (
        <div className="p-3 border-t border-[var(--border)] bg-gray-50/50 dark:bg-black/40 space-y-3">
          {tool.inputs && (
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1 tracking-wider font-sans">Input</p>
              <pre className="text-xs p-2 rounded-lg bg-white dark:bg-black/20 border border-[var(--border)] overflow-x-auto font-mono text-gray-600 dark:text-gray-300">
                {JSON.stringify(tool.inputs, null, 2)}
              </pre>
            </div>
          )}
          {tool.output && (
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1 tracking-wider font-sans">Output</p>
              <pre className="text-xs p-2 rounded-lg bg-white dark:bg-black/20 border border-[var(--border)] overflow-x-auto font-mono text-green-600 dark:text-green-400">
                {tool.output}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const Chat: React.FC<{ messages: Message[], onSendMessage: (input: string) => void, status: string | null, momoState: string, xpUpdate: any, unlockedAchievements: string[] }> = ({ messages, onSendMessage, status, momoState, xpUpdate, unlockedAchievements }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const { voiceState, startVoice, stopVoice, audioData } = useVoice(token, (text) => {});

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status, xpUpdate, unlockedAchievements]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-[var(--background)] font-sans">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center py-10 animate-in fade-in zoom-in duration-1000">
            <div className="relative mb-10 group cursor-pointer" onClick={voiceState === 'idle' ? startVoice : stopVoice}>
              <HolographicAvatar size={240} state={voiceState !== 'idle' ? voiceState : momoState as any} audioData={audioData} level={user?.character_level || 1} />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-blue-500/10 blur-xl rounded-full animate-pulse" />
            </div>
            
            <div className="mb-10 w-full flex justify-center">
              <BriefingCard />
            </div>

            <p className="text-lg text-gray-500 font-medium max-w-lg mx-auto">
              Momo is ready. Use the mic or type below to begin.
            </p>
          </div>
        )}
        
        <div className="max-w-3xl mx-auto space-y-8 w-full">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="mt-1 flex-shrink-0">
                  <Avatar size={32} />
                </div>
              )}
              
              <div className={`max-w-[85%] rounded-2xl p-4 ${
                m.role === 'user' 
                  ? 'chat-bubble-user shadow-md' 
                  : 'chat-bubble-momo shadow-sm'
              }`}>
                {m.toolCalls && m.toolCalls.length > 0 && (
                  <div className="mb-4">
                    {m.toolCalls.map(tc => <ToolCallCard key={tc.id} tool={tc} />)}
                  </div>
                )}
                <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{m.content}</p>
              </div>
            </div>
          ))}
          
          {(status || voiceState !== 'idle') && (
            <div className="flex items-center gap-4 text-sm text-gray-500 ml-12 animate-pulse">
              <Loader2 size={16} className="animate-spin text-[var(--accent)]" />
              <span className="font-bold tracking-tight uppercase text-[10px] tracking-widest">
                {voiceState === 'listening' ? 'Momo is listening...' : 
                 voiceState === 'speaking' ? 'Momo is speaking...' : 
                 status || 'Momo is processing...'}
              </span>
            </div>
          )}

          <div className="space-y-2 flex flex-col items-end">
            {xpUpdate && (
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1.5 rounded-full w-fit mr-2 animate-bounce shadow-sm">
                <Sparkles size={12} />
                <span>+{xpUpdate.amount} XP earned</span>
                {xpUpdate.leveledUp && <span className="ml-1 border-l border-[var(--accent)]/30 pl-2 text-yellow-600 dark:text-yellow-400 uppercase tracking-tighter">Level Up! (Lvl {xpUpdate.level})</span>}
              </div>
            )}

            {unlockedAchievements.map((ach, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-bold text-yellow-600 bg-yellow-500/10 px-3 py-1.5 rounded-full w-fit mr-2 animate-pulse shadow-sm border border-yellow-500/20">
                <Award size={12} />
                <span>ACHIEVEMENT UNLOCKED: {ach}</span>
              </div>
            ))}
          </div>
        </div>
        <div ref={scrollRef} />
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative group flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={voiceState === 'listening' ? "Listening..." : "Ask Momo anything..."}
              className="w-full bg-[var(--input-bg)] text-[var(--foreground)] border border-[var(--border)] rounded-2xl py-5 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all placeholder:text-gray-500 shadow-sm font-sans"
              disabled={voiceState !== 'idle'}
            />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-xl hover:opacity-90 transition-opacity disabled:opacity-30 shadow-sm"
              disabled={!input.trim() || voiceState !== 'idle'}
            >
              <Send size={22} />
            </button>
          </div>
          
          <button
            type="button"
            onClick={voiceState === 'idle' ? startVoice : stopVoice}
            className={`p-4 rounded-2xl border transition-all shadow-sm ${
              voiceState === 'listening' 
                ? 'bg-red-500 text-white border-red-600 animate-pulse' 
                : 'bg-[var(--sidebar)] text-[var(--foreground)] border-[var(--border)] hover:border-[var(--accent)]'
            }`}
          >
            {voiceState === 'idle' ? <Mic size={24} /> : <Square size={24} />}
          </button>
        </form>
        <p className="text-[11px] text-center mt-3 text-gray-400 font-bold uppercase tracking-widest opacity-50">
          Momo v1.6.1 • Real-time Voice Enabled • Tier 3 Neural Engine
        </p>
      </div>
    </div>
  );
};
