import { useState } from 'react';
import { chatApi } from '../services/chatApi';

export function useChat(projectId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = async (content: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await chatApi.sendMessage({ projectId, content });
      setMessages(prev => [...prev, response]);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send message'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, error, sendMessage };
}
