import { useState } from 'react';
import { chatApi } from '../services/api';

export interface SourceChunk {
  content: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceChunk[];
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (content: string) => {
    // 1. Add user message locally immediately for quick UI response
    const userMessage: ChatMessage = { role: 'user', content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 2. Call our FastAPI backend with the FULL history (giving Claude memory!)
      const response = await chatApi(newMessages);
      
      // 3. Add AI response to local state, including the sources array
      setMessages((prev) => [
        ...prev,
        { 
          role: 'assistant', 
          content: response.answer, 
          sources: response.sources 
        }
      ]);
      
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, error, sendMessage };
}
