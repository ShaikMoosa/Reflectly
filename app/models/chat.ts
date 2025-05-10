export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Interface for a chat message
 */
export interface ChatMessage {
  role: MessageRole;
  content: string;
  timestamp: string;
}

/**
 * Interface for a chat history
 */
export interface ChatHistory {
  id: string;
  userId: string;
  projectId?: string;
  title?: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for creating a new chat history
 */
export interface CreateChatHistoryParams {
  projectId?: string;
  title?: string;
  messages?: ChatMessage[];
}

/**
 * Interface for updating a chat history
 */
export interface UpdateChatHistoryParams {
  id: string;
  title?: string;
  messages?: ChatMessage[];
}

/**
 * Interface for chat history search parameters
 */
export interface ChatHistorySearchParams {
  projectId?: string;
  query?: string;
  limit?: number;
  offset?: number;
} 