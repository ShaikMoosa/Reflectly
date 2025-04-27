export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: MessageRole;
  content: string;
  timestamp: string;
}

export interface AIChatHistory {
  id: string;
  user_id: string;
  project_id: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export type AIChatHistoryCreateInput = Omit<AIChatHistory, 'id' | 'created_at' | 'updated_at'>;
export type AIChatHistoryUpdateInput = Partial<Omit<AIChatHistory, 'id' | 'user_id' | 'project_id' | 'created_at' | 'updated_at'>>; 