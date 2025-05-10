import { 
  CreateProjectParams, 
  Project, 
  ProjectSearchParams, 
  UpdateProjectParams 
} from '@/app/models/project';
import { getServerSupabaseClient } from '@/app/utils/supabase/clerk-auth';
import { handleSupabaseError } from '@/app/utils/supabase/error-handler';
import { Database } from '@/app/utils/supabase/database.types';

/**
 * Repository for project operations
 */
export const ProjectRepository = {
  /**
   * Get a project by ID
   */
  async getById(id: string): Promise<Project | null> {
    try {
      const supabase = await getServerSupabaseClient();
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to retrieve project');
      }
      
      if (!data) {
        return null;
      }
      
      return mapDatabaseProjectToModel(data);
    } catch (error) {
      console.error('Error retrieving project:', error);
      throw error;
    }
  },
  
  /**
   * Get projects with search parameters
   */
  async search(params: ProjectSearchParams): Promise<Project[]> {
    try {
      const supabase = await getServerSupabaseClient();
      const { userId, status, query, limit = 50, offset = 0 } = params;
      
      let queryBuilder = supabase
        .from('projects')
        .select('*');
      
      if (userId) {
        queryBuilder = queryBuilder.eq('user_id', userId);
      }
      
      if (status) {
        queryBuilder = queryBuilder.eq('status', status);
      }
      
      if (query) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
      }
      
      const { data, error } = await queryBuilder
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to search projects');
      }
      
      return (data || []).map(mapDatabaseProjectToModel);
    } catch (error) {
      console.error('Error searching projects:', error);
      throw error;
    }
  },
  
  /**
   * Get count of projects for a user
   */
  async countByUserId(userId: string): Promise<number> {
    try {
      const supabase = await getServerSupabaseClient();
      
      const { count, error } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to count projects');
      }
      
      return count || 0;
    } catch (error) {
      console.error('Error counting projects:', error);
      throw error;
    }
  },
  
  /**
   * Create a new project
   */
  async create(params: CreateProjectParams): Promise<Project> {
    try {
      const supabase = await getServerSupabaseClient();
      
      const { userId, name, description, status = 'active' } = params;
      
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          name,
          description,
          status
        })
        .select()
        .single();
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to create project');
      }
      
      return mapDatabaseProjectToModel(data);
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },
  
  /**
   * Update a project
   */
  async update(params: UpdateProjectParams): Promise<Project> {
    try {
      const supabase = await getServerSupabaseClient();
      
      const { id, name, description, status } = params;
      
      const updateData: Record<string, any> = {};
      
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (status !== undefined) updateData.status = status;
      
      const { data, error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to update project');
      }
      
      return mapDatabaseProjectToModel(data);
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },
  
  /**
   * Delete a project
   */
  async delete(id: string): Promise<void> {
    try {
      const supabase = await getServerSupabaseClient();
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },
  
  /**
   * Get projects with related data (transcripts, notes, etc.)
   */
  async getWithRelatedData(id: string): Promise<Project & { transcriptCount: number, noteCount: number }> {
    try {
      const supabase = await getServerSupabaseClient();
      
      // Get the project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (projectError) {
        throw handleSupabaseError(projectError, 'Failed to retrieve project');
      }
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      // Count related transcripts
      const { count: transcriptCount, error: transcriptError } = await supabase
        .from('video_transcripts')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', id);
      
      if (transcriptError) {
        throw handleSupabaseError(transcriptError, 'Failed to count transcripts');
      }
      
      // Count related notes
      const { count: noteCount, error: noteError } = await supabase
        .from('user_notes')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', id);
      
      if (noteError) {
        throw handleSupabaseError(noteError, 'Failed to count notes');
      }
      
      return {
        ...mapDatabaseProjectToModel(project),
        transcriptCount: transcriptCount || 0,
        noteCount: noteCount || 0
      };
    } catch (error) {
      console.error('Error retrieving project with related data:', error);
      throw error;
    }
  }
};

/**
 * Helper function to map database project to model
 */
function mapDatabaseProjectToModel(data: Database['public']['Tables']['projects']['Row']): Project {
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    description: data.description || undefined,
    status: data.status || 'active',
    createdAt: data.created_at || new Date().toISOString(),
    updatedAt: data.updated_at || new Date().toISOString()
  };
} 