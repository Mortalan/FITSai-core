import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/Layout';
import { Chat } from './components/Chat';
import { Login } from './components/Login';
import { Workspace } from './components/Workspace';
import { AppShortcuts } from './components/AppShortcuts';
import { streamMomo, getConversation } from './api';
import axios from 'axios';
import useVoice from './hooks/useVoice';
import type { Message, ToolCall, AppView } from './types';

function App() {
  const token = useAuthStore((state) => state.token);
  const updateUser = useAuthStore((state) => state.updateUser);
  const logout = useAuthStore((state) => state.logout);
  const [view, setView] = useState<AppView>('chat');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [momoState, setMomoState] = useState<'idle' | 'thinking' | 'speaking'>('idle');
  const [xpUpdate, setXpUpdate] = useState<any>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | undefined>(undefined);
  const [activeProjectId, setActiveProjectId] = useState<number | undefined>(undefined);

  // Sync user profile on mount
  useEffect(() => {
    if (token) {
      axios.get('http://10.0.0.231:9000/api/v1/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => updateUser(res.data)).catch(err => { if (err.response?.status === 401) logout(); });
    }
  }, [token, updateUser, logout]);

  const handleVoiceMessage = useCallback((text: string) => {}, []);
  const voice = useVoice(token, handleVoiceMessage);

  if (!token) return <Login />;

  const handleSendMessage = async (input: string, imageData?: string) => {
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setStatus('Momo is thinking...'); setMomoState('thinking'); setXpUpdate(null); setUnlockedAchievements([]);

    let assistantContent = '';
    const assistantId = (Date.now() + 1).toString();
    let currentToolCalls: ToolCall[] = [];

    try {
      for await (const event of streamMomo(input, currentConversationId, imageData, activeProjectId)) {
        if (event.type === 'token') {
          setMomoState('speaking'); assistantContent += event.content;
          setMessages(prev => { const others = prev.filter(m => m.id !== assistantId); return [...others, { id: assistantId, role: 'assistant', content: assistantContent, toolCalls: [...currentToolCalls] }]; });
          setStatus(null);
        } else if (event.type === 'status') { setStatus(event.message); }
        else if (event.type === 'tool_start') {
          const newTool: ToolCall = { id: Math.random().toString(), name: event.name, inputs: event.inputs, status: 'running' };
          currentToolCalls.push(newTool);
          setMessages(prev => { const others = prev.filter(m => m.id !== assistantId); return [...others, { id: assistantId, role: 'assistant', content: assistantContent, toolCalls: [...currentToolCalls] }]; });
        } else if (event.type === 'tool_end') {
          currentToolCalls = currentToolCalls.map(tc => tc.name === event.name && tc.status === 'running' ? { ...tc, output: event.output, status: 'completed' } : tc);
          setMessages(prev => { const others = prev.filter(m => m.id !== assistantId); return [...others, { id: assistantId, role: 'assistant', content: assistantContent, toolCalls: [...currentToolCalls] }]; });
        } else if (event.type === 'done') {
          setMomoState('idle'); setStatus(null);
          if (event.conversation_id) setCurrentConversationId(event.conversation_id);
          if (event.sources && event.sources.length > 0) {
            setMessages(prev => { const others = prev.filter(m => m.id !== assistantId); return [...others, { id: assistantId, role: 'assistant', content: assistantContent, toolCalls: [...currentToolCalls], sources: event.sources }]; });
          }
          if (event.xp_progress) {
            updateUser({ xp_total: event.xp_progress.xp_total, character_level: event.xp_progress.level, character_class: event.xp_progress.class, stats: event.xp_progress.stats });
            setXpUpdate({ amount: event.xp_progress.xp_awarded, level: event.xp_progress.level, leveledUp: event.xp_progress.leveled_up });
          }
          if (event.new_achievements) setUnlockedAchievements(event.new_achievements);
          setTimeout(() => { setXpUpdate(null); setUnlockedAchievements([]); }, 8000);
        }
      }
    } catch (err) { setMomoState('idle'); setStatus('Error connecting'); }
  };

  const handleNewChat = () => { setMessages([]); setStatus(null); setMomoState('idle'); setCurrentConversationId(undefined); setActiveProjectId(undefined); setView('chat'); };

  const handleChatSelect = async (id: number) => {
    setStatus('Loading...'); setView('chat');
    try {
      const conv = await getConversation(id); setCurrentConversationId(id); setActiveProjectId(conv.project_id);
      const mapped: Message[] = conv.messages.map((m: any, i: number) => ({ id: `msg_${i}`, role: m.role, content: m.content, toolCalls: m.tool_calls, sources: m.sources }));
      setMessages(mapped); setStatus(null);
    } catch (err) { setStatus('Failed to load'); }
  };

  const handleInitProjectChat = (projectId: number) => { handleNewChat(); setActiveProjectId(projectId); setView('chat'); };

  return (
    <>
      <AppShortcuts onViewChange={setView} onNewChat={handleNewChat} />
      <Layout onViewChange={setView} currentView={view} onNewChat={handleNewChat} onChatSelect={handleChatSelect}>
        {view === 'chat' && <Chat messages={messages} onSendMessage={handleSendMessage} status={status} momoState={momoState} xpUpdate={xpUpdate} unlockedAchievements={unlockedAchievements} voice={voice} conversationId={currentConversationId} />}
        {view === 'workspace' && <Workspace onInitProjectChat={handleInitProjectChat} />}
      </Layout>
    </>
  );
}

export default App;
