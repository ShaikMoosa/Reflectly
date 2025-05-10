import { 
  CreateTranscriptParams, 
  Transcript, 
  TranscriptSearchParams, 
  UpdateTranscriptParams 
} from '@/app/models/transcript';
import { getServerSupabaseClient } from '@/app/utils/supabase/clerk-auth';
import { handleSupabaseError } from '@/app/utils/supabase/error-handler';

/**
 * Repository for transcript operations
 */
export const TranscriptRepository = {
  /**
   * Get a transcript by ID
   */
  async getById(id: string): Promise<Transcript | null> {
    try {
      const supabase = await getServerSupabaseClient();
      
      const { data, error } = await supabase
        .from('transcripts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to retrieve transcript');
      }
      
      if (!data) {
        return null;
      }
      
      return {
        id: data.id,
        projectId: data.project_id,
        userId: data.user_id,
        title: data.title,
        content: data.content,
        audioUrl: data.audio_url,
        duration: data.duration,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Error retrieving transcript:', error);
      throw error;
    }
  },
  
  /**
   * Get transcripts with search parameters
   */
  async search(params: TranscriptSearchParams): Promise<Transcript[]> {
    try {
      const supabase = await getServerSupabaseClient();
      const { projectId, query, limit = 50, offset = 0 } = params;
      
      let queryBuilder = supabase
        .from('transcripts')
        .select('*');
      
      if (projectId) {
        queryBuilder = queryBuilder.eq('project_id', projectId);
      }
      
      if (query) {
        queryBuilder = queryBuilder.textSearch('content', query);
      }
      
      const { data, error } = await queryBuilder
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to search transcripts');
      }
      
      return (data || []).map(item => ({
        id: item.id,
        projectId: item.project_id,
        userId: item.user_id,
        title: item.title,
        content: item.content,
        audioUrl: item.audio_url,
        duration: item.duration,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
    } catch (error) {
      console.error('Error searching transcripts:', error);
      throw error;
    }
  },
  
  /**
   * Create a new transcript
   */
  async create(params: CreateTranscriptParams): Promise<Transcript> {
    try {
      const supabase = await getServerSupabaseClient();
      
      const { projectId, title, content = [], audioUrl, duration } = params;
      
      const { data, error } = await supabase
        .from('transcripts')
        .insert({
          project_id: projectId,
          title,
          content,
          audio_url: audioUrl,
          duration
        })
        .select()
        .single();
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to create transcript');
      }
      
      return {
        id: data.id,
        projectId: data.project_id,
        userId: data.user_id,
        title: data.title,
        content: data.content,
        audioUrl: data.audio_url,
        duration: data.duration,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Error creating transcript:', error);
      throw error;
    }
  },
  
  /**
   * Update a transcript
   */
  async update(params: UpdateTranscriptParams): Promise<Transcript> {
    try {
      const supabase = await getServerSupabaseClient();
      
      const { id, title, content, audioUrl, duration } = params;
      
      const updateData: Record<string, any> = {};
      
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (audioUrl !== undefined) updateData.audio_url = audioUrl;
      if (duration !== undefined) updateData.duration = duration;
      
      const { data, error } = await supabase
        .from('transcripts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to update transcript');
      }
      
      return {
        id: data.id,
        projectId: data.project_id,
        userId: data.user_id,
        title: data.title,
        content: data.content,
        audioUrl: data.audio_url,
        duration: data.duration,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Error updating transcript:', error);
      throw error;
    }
  },
  
  /**
   * Delete a transcript
   */
  async delete(id: string): Promise<void> {
    try {
      const supabase = await getServerSupabaseClient();
      
      const { error } = await supabase
        .from('transcripts')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to delete transcript');
      }
    } catch (error) {
      console.error('Error deleting transcript:', error);
      throw error;
    }
  }
}; 