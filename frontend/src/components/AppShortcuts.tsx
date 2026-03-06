import React, { useState, useEffect, useCallback } from 'react';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { AppView } from '../types';

interface AppShortcutsProps {
  onViewChange: (view: AppView) => void;
  onNewChat: () => void;
}

export const AppShortcuts: React.FC<AppShortcutsProps> = ({ onViewChange, onNewChat }) => {
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    if (e.key === 'Escape') {
      if (showShortcutsModal) {
        e.preventDefault();
        setShowShortcutsModal(false);
        return;
      }
    }

    if (isInput) return;

    const ctrl = e.ctrlKey || e.metaKey;

    if (ctrl && (e.key === '/' || e.key === '?')) {
      e.preventDefault();
      setShowShortcutsModal(true);
      return;
    }

    if (ctrl && e.key === 'n') {
      e.preventDefault();
      onNewChat();
      return;
    }

    if (e.key === '?') {
      e.preventDefault();
      setShowShortcutsModal(true);
      return;
    }

    if (e.key === '1') { e.preventDefault(); onViewChange('chat'); return; }
    if (e.key === '2') { e.preventDefault(); onViewChange('workspace'); return; }
  }, [showShortcutsModal, onNewChat, onViewChange]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <KeyboardShortcutsModal
      isOpen={showShortcutsModal}
      onClose={() => setShowShortcutsModal(false)}
    />
  );
};
