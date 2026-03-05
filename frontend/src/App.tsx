import { useState } from 'react';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/Layout';
import { Chat } from './components/Chat';
import { Login } from './components/Login';
import { DocumentLibrary } from './components/Documents';
import { Achievements } from './components/Achievements';
import { Leaderboard } from './components/Leaderboard';
import { GodMode } from './components/GodMode';
import { streamMomo } from './api';
import type { Message, ToolCall } from './types';

export type AppView = 'chat' | 'docs' | 'achievements' | 'leaderboard' | 'admin';

function App() {
  const token = useAuthStore((state) => state.token);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [view, setView] = useState<AppView>('chat');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [momoState, setMomoState] = useState<'idle' | 'thinking' | 'speaking'>('idle');
  const [xpUpdate, setXpUpdate] = useState<any>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);

  if (!token) {
    return <Login />;
  }

  const handleSendMessage = async (input: string) => {
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

  const handleNewChat = () => {
    setMessages([]);
    setStatus(null);
    setMomoState('idle');
    setXpUpdate(null);
    setUnlockedAchievements([]);
    setView('chat');
  };

  return (
    <Layout onViewChange={setView} currentView={view} onNewChat={handleNewChat}>
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
      {view === 'admin' && <GodMode />}
    </Layout>
  );
}

export default App;
