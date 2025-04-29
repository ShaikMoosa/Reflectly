import { 
  ChatHistory, 
  ChatHistorySearchParams, 
  CreateChatHistoryParams,
  UpdateChatHistoryParams 
} from '@/app/models/chat';
import { getServerSupabaseClient } from '@/app/utils/supabase/clerk-auth';
import { handleSupabaseError } from '@/app/utils/supabase/error-handler';

/**
 * Repository for chat history operations
 */
export const ChatRepository = {
  /**
   * Get a chat history by ID
   */
  async getById(id: string): Promise<ChatHistory | null> {
    try {
      const supabase = await getServerSupabaseClient();
      
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to retrieve chat history');
      }
      
      if (!data) {
        return null;
      }
      
      return mapDbChatToModel(data);
    } catch (error) {
      console.error('Error retrieving chat history:', error);
      throw error;
    }
  },
  
  /**
   * Get chat histories with search parameters
   */
  async search(params: ChatHistorySearchParams): Promise<ChatHistory[]> {
    try {
      const supabase = await getServerSupabaseClient();
      const { projectId, query, limit = 50, offset = 0 } = params;
      
      let queryBuilder = supabase
        .from('chat_history')
        .select('*');
      
      if (projectId) {
        queryBuilder = queryBuilder.eq('project_id', projectId);
      }
      
      if (query) {
        // Search in title and messages content
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,messages->content.ilike.%${query}%`);
      }
      
      const { data, error } = await queryBuilder
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to search chat histories');
      }
      
      return (data || []).map(mapDbChatToModel);
    } catch (error) {
      console.error('Error searching chat histories:', error);
      throw error;
    }
  },
  
  /**
   * Create a new chat history
   */
  async create(params: CreateChatHistoryParams): Promise<ChatHistory> {
    try {
      const supabase = await getServerSupabaseClient();
      
      const { projectId, title, messages = [] } = params;
      
      const { data, error } = await supabase
        .from('chat_history')
        .insert({
          project_id: projectId,
          title,
          messages
        })
        .select()
        .single();
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to create chat history');
      }
      
      return mapDbChatToModel(data);
    } catch (error) {
      console.error('Error creating chat history:', error);
      throw error;
    }
  },
  
  /**
   * Update a chat history
   */
  async update(params: UpdateChatHistoryParams): Promise<ChatHistory> {
    try {
      const supabase = await getServerSupabaseClient();
      
      const { id, title, messages } = params;
      
      const updateData: Record<string, any> = {};
      
      if (title !== undefined) updateData.title = title;
      if (messages !== undefined) updateData.messages = messages;
      
      const { data, error } = await supabase
        .from('chat_history')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to update chat history');
      }
      
      return mapDbChatToModel(data);
    } catch (error) {
      console.error('Error updating chat history:', error);
      throw error;
    }
  },
  
  /**
   * Add a message to a chat history
   */
  async addMessage(id: string, message: any): Promise<ChatHistory> {
    try {
      const supabase = await getServerSupabaseClient();
      
      // First, get the current messages
      const { data: chatData, error: chatError } = await supabase
        .from('chat_history')
        .select('messages')
        .eq('id', id)
        .single();
      
      if (chatError) {
        throw handleSupabaseError(chatError, 'Failed to retrieve chat history');
      }
      
      // Add the new message
      const updatedMessages = [...(chatData.messages || []), message];
      
      // Update the chat history
      const { data, error } = await supabase
        .from('chat_history')
        .update({ 
          messages: updatedMessages,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to add message to chat history');
      }
      
      return mapDbChatToModel(data);
    } catch (error) {
      console.error('Error adding message to chat history:', error);
      throw error;
    }
  },
  
  /**
   * Delete a chat history
   */
  async delete(id: string): Promise<void> {
    try {
      const supabase = await getServerSupabaseClient();
      
      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to delete chat history');
      }
    } catch (error) {
      console.error('Error deleting chat history:', error);
      throw error;
    }
  }
};

/**
 * Map a database chat history to a chat history model
 */
function mapDbChatToModel(data: any): ChatHistory {
  return {
    id: data.id,
    userId: data.user_id,
    projectId: data.project_id,
    title: data.title,
    messages: data.messages || [],
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
} 