import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Terminal, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { streamMomo } from '../api';
import type { Message, ToolCall } from '../types';

const ToolCallCard: React.FC<{ tool: ToolCall }> = ({ tool }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-2 border border-[var(--border)] rounded-xl overflow-hidden bg-white dark:bg-black/20 shadow-sm">
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
              <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1 tracking-wider">Input</p>
              <pre className="text-xs p-2 rounded-lg bg-white dark:bg-black/20 border border-[var(--border)] overflow-x-auto font-mono">
                {JSON.stringify(tool.inputs, null, 2)}
              </pre>
            </div>
          )}
          {tool.output && (
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1 tracking-wider">Output</p>
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setStatus('Momo is thinking...');

    let assistantContent = '';
    const assistantId = (Date.now() + 1).toString();
    let currentToolCalls: ToolCall[] = [];

    try {
      for await (const event of streamMomo(input)) {
        if (event.type === 'token') {
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
          setStatus(event.message);
        } else if (event.type === 'tool_start') {
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
          setStatus(null);
        }
      }
    } catch (err) {
      console.error(err);
      setStatus('Error connecting to Momo');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <h2 className="text-4xl font-semibold mb-4 text-[var(--foreground)]">Hello, Louis</h2>
            <p className="text-xl text-gray-500 font-medium">How can I help your workflow today?</p>
          </div>
        )}
        
        <div className="max-w-3xl mx-auto space-y-6 w-full">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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
            <div className="flex items-center gap-3 text-sm text-gray-500 ml-2">
              <Loader2 size={16} className="animate-spin text-[var(--accent)]" />
              <span>{status}</span>
            </div>
          )}
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
        <p className="text-[11px] text-center mt-3 text-gray-500 font-medium opacity-70">
          Momo is an autonomous agent. Confirm critical system changes before proceeding.
        </p>
      </div>
    </div>
  );
};
