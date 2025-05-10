import { 
  CreateNoteParams, 
  Note, 
  NoteSearchParams, 
  UpdateNoteParams 
} from '@/app/models/note';
import { getServerSupabaseClient } from '@/app/utils/supabase/clerk-auth';
import { handleSupabaseError } from '@/app/utils/supabase/error-handler';

/**
 * Repository for note operations
 */
export const NoteRepository = {
  /**
   * Get a note by ID
   */
  async getById(id: string): Promise<Note | null> {
    try {
      const supabase = await getServerSupabaseClient();
      
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to retrieve note');
      }
      
      if (!data) {
        return null;
      }
      
      return mapDbNoteToModel(data);
    } catch (error) {
      console.error('Error retrieving note:', error);
      throw error;
    }
  },
  
  /**
   * Get notes with search parameters
   */
  async search(params: NoteSearchParams): Promise<Note[]> {
    try {
      const supabase = await getServerSupabaseClient();
      const { projectId, query, tags, limit = 50, offset = 0 } = params;
      
      let queryBuilder = supabase
        .from('notes')
        .select('*');
      
      if (projectId) {
        queryBuilder = queryBuilder.eq('project_id', projectId);
      }
      
      if (query) {
        // Search in title and content
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
      }
      
      if (tags && tags.length > 0) {
        // For each tag, check if it's contained in the tags array
        tags.forEach(tag => {
          queryBuilder = queryBuilder.contains('tags', [tag]);
        });
      }
      
      const { data, error } = await queryBuilder
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to search notes');
      }
      
      return (data || []).map(mapDbNoteToModel);
    } catch (error) {
      console.error('Error searching notes:', error);
      throw error;
    }
  },
  
  /**
   * Create a new note
   */
  async create(params: CreateNoteParams): Promise<Note> {
    try {
      const supabase = await getServerSupabaseClient();
      
      const { projectId, title, content, tags = [] } = params;
      
      const { data, error } = await supabase
        .from('notes')
        .insert({
          project_id: projectId,
          title,
          content,
          tags
        })
        .select()
        .single();
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to create note');
      }
      
      return mapDbNoteToModel(data);
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  },
  
  /**
   * Update a note
   */
  async update(params: UpdateNoteParams): Promise<Note> {
    try {
      const supabase = await getServerSupabaseClient();
      
      const { id, title, content, tags } = params;
      
      const updateData: Record<string, any> = {};
      
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (tags !== undefined) updateData.tags = tags;
      
      const { data, error } = await supabase
        .from('notes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to update note');
      }
      
      return mapDbNoteToModel(data);
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  },
  
  /**
   * Delete a note
   */
  async delete(id: string): Promise<void> {
    try {
      const supabase = await getServerSupabaseClient();
      
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }
};

/**
 * Map a database note to a note model
 */
function mapDbNoteToModel(data: any): Note {
  return {
    id: data.id,
    projectId: data.project_id,
    userId: data.user_id,
    title: data.title,
    content: data.content,
    tags: data.tags || [],
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
} 