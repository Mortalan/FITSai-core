import { useAuthStore } from './store/authStore';
import { Layout } from './components/Layout';
import { Chat } from './components/Chat';
import { Login } from './components/Login';

function App() {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Login />;
  }

  return (
    <Layout>
      <Chat />
    </Layout>
  );
}

export default App;
