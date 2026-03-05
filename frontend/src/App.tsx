import { useState } from 'react';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/Layout';
import { Chat } from './components/Chat';
import { Login } from './components/Login';
import { DocumentLibrary } from './components/Documents';
import { Achievements } from './components/Achievements';
import { Leaderboard } from './components/Leaderboard';
import { Settings } from './components/Settings';
import { streamMomo, getConversation } from './api';
import type { Message, ToolCall } from './types';

export type AppView = 'chat' | 'docs' | 'achievements' | 'leaderboard' | 'settings';

function App() {
  const token = useAuthStore((state) => state.token);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [view, setView] = useState<AppView>('chat');
  
  // Centralized Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [momoState, setMomoState] = useState<'idle' | 'thinking' | 'speaking'>('idle');
  const [xpUpdate, setXpUpdate] = useState<any>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | undefined>(undefined);

  if (!token) {
    return <Login />;
  }

  const handleSendMessage = async (input: string, imageData?: string) => {
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setStatus('Momo is thinking...');
    setMomoState('thinking');
    setXpUpdate(null);
    setUnlockedAchievements([]);

    let assistantContent = '';
    const assistantId = (Date.now() + 1).toString();
    let currentToolCalls: ToolCall[] = [];

    try {
      for await (const event of streamMomo(input, currentConversationId, imageData)) {
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
          if (event.conversation_id) setCurrentConversationId(event.conversation_id);
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

  const handleNewChat = () => {
    setMessages([]);
    setStatus(null);
    setMomoState('idle');
    setXpUpdate(null);
    setUnlockedAchievements([]);
    setCurrentConversationId(undefined);
    setView('chat');
  };

  const handleChatSelect = async (id: number) => {
    setStatus('Loading conversation...');
    setView('chat');
    try {
      const conv = await getConversation(id);
      setCurrentConversationId(id);
      const mappedMessages: Message[] = conv.messages.map((m: any, i: number) => ({
        id: `msg_${i}`,
        role: m.role,
        content: m.content,
        toolCalls: m.tool_calls
      }));
      setMessages(mappedMessages);
      setStatus(null);
    } catch (err) {
      setStatus('Failed to load conversation');
    }
  };

  return (
    <Layout onViewChange={setView} currentView={view} onNewChat={handleNewChat} onChatSelect={handleChatSelect}>
      {view === 'chat' && (
        <Chat 
          messages={messages} 
          onSendMessage={handleSendMessage}
          status={status}
          momoState={momoState}
          xpUpdate={xpUpdate}
          unlockedAchievements={unlockedAchievements}
        />
      )}
      {view === 'docs' && <DocumentLibrary />}
      {view === 'achievements' && <Achievements />}
      {view === 'leaderboard' && <Leaderboard />}
      {view === 'settings' && <Settings />}
    </Layout>
  );
}

export default App;
