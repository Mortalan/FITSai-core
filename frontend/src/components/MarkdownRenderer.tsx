import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose dark:prose-invert max-w-none prose-sm prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        rehypePlugins={[rehypeHighlight]}
        components={{
          table: ({node, ...props}) => (
            <div className="overflow-x-auto my-4 rounded-xl border border-[var(--border)]">
              <table className="w-full text-left text-xs" {...props} />
            </div>
          ),
          th: ({node, ...props}) => <th className="p-3 bg-[var(--input-bg)] font-bold" {...props} />,
          td: ({node, ...props}) => <td className="p-3 border-t border-[var(--border)]" {...props} />,
          code: ({node, inline, className, children, ...props}: any) => {
            return (
              <code className={`${className} rounded px-1.5 py-0.5 ${inline ? 'bg-gray-100 dark:bg-white/10 text-[var(--accent)]' : ''}`} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
