import { useAuthStore } from './store/authStore';

const API_BASE_URL = 'http://10.0.0.231:9000/api/v1';

export async function* streamMomo(question: string) {
  const token = useAuthStore.getState().token;
  
  const response = await fetch(`${API_BASE_URL}/chat/stream`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ question }),
  });

  if (response.status === 401) {
    useAuthStore.getState().logout();
    throw new Error('Session expired');
  }

  if (!response.ok) {
    throw new Error('Failed to connect to Momo');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) return;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n\n');

    for (const line of lines) {
      if (!line.trim()) continue;
      
      const eventMatch = line.match(/^event: (.*)/m);
      const dataMatch = line.match(/^data: (.*)/m);
      
      if (eventMatch && dataMatch) {
        const eventType = eventMatch[1].trim();
        const data = JSON.parse(dataMatch[1].trim());
        yield { type: eventType, ...data };
      }
    }
  }
}
