import { useState } from 'react';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/Layout';
import { Chat } from './components/Chat';
import { Login } from './components/Login';
import { DocumentLibrary } from './components/Documents';

function App() {
  const token = useAuthStore((state) => state.token);
  const [view, setView] = useState<'chat' | 'docs'>('chat');

  if (!token) {
    return <Login />;
  }

  return (
    <Layout onViewChange={setView} currentView={view}>
      {view === 'chat' ? <Chat /> : <DocumentLibrary />}
    </Layout>
  );
}

export default App;
