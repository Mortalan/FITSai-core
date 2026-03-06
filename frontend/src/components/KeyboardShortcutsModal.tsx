import React from 'react';
import { X, Command, FileText, MessageSquare, Plus, Settings } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[var(--sidebar)] border border-[var(--border)] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl">
              <Command size={20} />
            </div>
            <h2 className="text-xl font-bold">Keyboard Shortcuts</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Global Actions</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-[var(--input-bg)] rounded-xl">
                <div className="flex items-center gap-3 text-sm font-medium">
                  <Plus size={16} className="text-gray-400" /> New Chat
                </div>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 bg-[var(--background)] border border-[var(--border)] rounded text-xs font-mono">Ctrl</kbd>
                  <span className="text-gray-400">+</span>
                  <kbd className="px-2 py-1 bg-[var(--background)] border border-[var(--border)] rounded text-xs font-mono">N</kbd>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-[var(--input-bg)] rounded-xl">
                <div className="flex items-center gap-3 text-sm font-medium">
                  <FileText size={16} className="text-gray-400" /> Chat Templates
                </div>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 bg-[var(--background)] border border-[var(--border)] rounded text-xs font-mono">Ctrl</kbd>
                  <span className="text-gray-400">+</span>
                  <kbd className="px-2 py-1 bg-[var(--background)] border border-[var(--border)] rounded text-xs font-mono">T</kbd>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Navigation</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-[var(--input-bg)] rounded-xl">
                <div className="flex items-center gap-3 text-sm font-medium">
                  <MessageSquare size={16} className="text-gray-400" /> Go to Chat
                </div>
                <kbd className="px-2 py-1 bg-[var(--background)] border border-[var(--border)] rounded text-xs font-mono">1</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-[var(--input-bg)] rounded-xl">
                <div className="flex items-center gap-3 text-sm font-medium">
                  <Settings size={16} className="text-gray-400" /> Go to Workspace
                </div>
                <kbd className="px-2 py-1 bg-[var(--background)] border border-[var(--border)] rounded text-xs font-mono">2</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
