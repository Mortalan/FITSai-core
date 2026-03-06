import React from 'react';
import { Tag, BookOpen } from 'lucide-react';

interface ContextPanelProps {
  sources?: string[];
}

export const ContextPanel: React.FC<ContextPanelProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-[var(--border)] animate-in fade-in slide-in-from-top-1 duration-300">
      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
        <BookOpen size={12} />
        <span>Knowledge Base Sources</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {sources.map((source, index) => (
          <div
            key={index}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent)]/5 text-[var(--accent)] border border-[var(--accent)]/20 shadow-sm"
          >
            <Tag size={10} className="opacity-60" />
            <span className="text-[10px] font-bold">{source}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
