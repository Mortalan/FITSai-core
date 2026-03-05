import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Terminal, CheckCircle2, ChevronDown, ChevronUp, Sparkles, Award } from 'lucide-react';
import { streamMomo } from '../api';
import { useAuthStore } from '../store/authStore';
import { Avatar } from './Avatar';
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

export const Chat: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [momoState, setMomoState] = useState<'idle' | 'thinking' | 'speaking'>('idle');
  const [xpUpdate, setXpUpdate] = useState<{ amount: number, level: number, leveledUp: boolean } | null>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status, xpUpdate, unlockedAchievements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setStatus('Momo is thinking...');
    setMomoState('thinking');
    setXpUpdate(null);
    setUnlockedAchievements([]);

    let assistantContent = '';
    const assistantId = (Date.now() + 1).toString();
    let currentToolCalls: ToolCall[] = [];

    try {
      for await (const event of streamMomo(input)) {
        if (event.type === 'token') {
          setMomoState('speaking');
          assistantContent += event.content;
          setMessages(prev => {
            const others = prev.filter(m => m.id !== assistantId);
            return [...others, { 
              id: assistantId, 
              role: 'assistant', 
              content: assistantContent,
              toolCalls: [...currentToolCalls]
            }];
          });
          setStatus(null);
        } else if (event.type === 'status') {
          setMomoState('thinking');
          setStatus(event.message);
        } else if (event.type === 'tool_start') {
          setMomoState('thinking');
          const newTool: ToolCall = {
            id: Math.random().toString(),
            name: event.name,
            inputs: event.inputs,
            status: 'running'
          };
          currentToolCalls.push(newTool);
          setMessages(prev => {
            const others = prev.filter(m => m.id !== assistantId);
            return [...others, { 
              id: assistantId, 
              role: 'assistant', 
              content: assistantContent,
              toolCalls: [...currentToolCalls]
            }];
          });
        } else if (event.type === 'tool_end') {
          currentToolCalls = currentToolCalls.map(tc => 
            tc.name === event.name && tc.status === 'running' 
              ? { ...tc, output: event.output, status: 'completed' }
              : tc
          );
          setMessages(prev => {
            const others = prev.filter(m => m.id !== assistantId);
            return [...others, { 
              id: assistantId, 
              role: 'assistant', 
              content: assistantContent,
              toolCalls: [...currentToolCalls]
            }];
          });
        } else if (event.type === 'done') {
          setMomoState('idle');
          setStatus(null);
          if (event.xp_progress) {
            updateUser({ xp_total: event.xp_progress.xp_total });
            setXpUpdate({
              amount: event.xp_progress.xp_awarded,
              level: event.xp_progress.level,
              leveledUp: event.xp_progress.leveled_up
            });
          }
          if (event.new_achievements && event.new_achievements.length > 0) {
            setUnlockedAchievements(event.new_achievements);
          }
          
          setTimeout(() => {
            setXpUpdate(null);
            setUnlockedAchievements([]);
          }, 8000);
        }
      }
    } catch (err) {
      console.error(err);
      setMomoState('idle');
      setStatus('Error connecting to Momo');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--background)] font-sans">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center py-20">
            <div className="mb-8 animate-in fade-in zoom-in duration-700">
              <Avatar size={120} state={momoState} />
            </div>
            <h2 className="text-4xl font-semibold mb-4 text-[var(--foreground)] tracking-tight">Hello, {user?.name || 'Louis'}</h2>
            <p className="text-xl text-gray-500 font-medium">How can I help your workflow today?</p>
          </div>
        )}
        
        <div className="max-w-3xl mx-auto space-y-8 w-full">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="mt-1 flex-shrink-0">
                  <Avatar size={28} />
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
          
          {status && (
            <div className="flex items-center gap-3 text-sm text-gray-500 ml-12">
              <Loader2 size={16} className="animate-spin text-[var(--accent)]" />
              <span className="font-medium tracking-tight">{status}</span>
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
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Momo anything..."
            className="w-full bg-[var(--input-bg)] text-[var(--foreground)] border border-[var(--border)] rounded-2xl py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all placeholder:text-gray-500 shadow-sm"
          />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-xl hover:opacity-90 transition-opacity disabled:opacity-30 shadow-sm"
            disabled={!input.trim()}
          >
            <Send size={20} />
          </button>
        </form>
        <p className="text-[11px] text-center mt-3 text-gray-500 font-medium opacity-70 font-sans">
          Momo is an autonomous agent. Confirm critical system changes before proceeding.
        </p>
      </div>
    </div>
  );
};
