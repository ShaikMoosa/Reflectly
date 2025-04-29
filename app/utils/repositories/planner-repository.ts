import { 
  CreatePlannerParams, 
  Planner, 
  PlannerSearchParams, 
  UpdatePlannerParams 
} from '@/app/models/planner';
import { getServerSupabaseClient } from '@/app/utils/supabase/clerk-auth';
import { handleSupabaseError } from '@/app/utils/supabase/error-handler';

/**
 * Repository for planner operations
 */
export const PlannerRepository = {
  /**
   * Get a planner by ID
   */
  async getById(id: string): Promise<Planner | null> {
    try {
      const supabase = await getServerSupabaseClient();
      
      const { data, error } = await supabase
        .from('planner')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to retrieve planner');
      }
      
      if (!data) {
        return null;
      }
      
      return mapDbPlannerToModel(data);
    } catch (error) {
      console.error('Error retrieving planner:', error);
      throw error;
    }
  },
  
  /**
   * Get planners with search parameters
   */
  async search(params: PlannerSearchParams): Promise<Planner[]> {
    try {
      const supabase = await getServerSupabaseClient();
      const { projectId, title, limit = 50, offset = 0 } = params;
      
      let queryBuilder = supabase
        .from('planner')
        .select('*');
      
      if (projectId) {
        queryBuilder = queryBuilder.eq('project_id', projectId);
      }
      
      if (title) {
        queryBuilder = queryBuilder.ilike('title', `%${title}%`);
      }
      
      const { data, error } = await queryBuilder
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to search planners');
      }
      
      return (data || []).map(mapDbPlannerToModel);
    } catch (error) {
      console.error('Error searching planners:', error);
      throw error;
    }
  },
  
  /**
   * Create a new planner
   */
  async create(params: CreatePlannerParams): Promise<Planner> {
    try {
      const supabase = await getServerSupabaseClient();
      
      const { projectId, title, data = {} } = params;
      
      const { data: plannerData, error } = await supabase
        .from('planner')
        .insert({
          project_id: projectId,
          title,
          data
        })
        .select()
        .single();
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to create planner');
      }
      
      return mapDbPlannerToModel(plannerData);
    } catch (error) {
      console.error('Error creating planner:', error);
      throw error;
    }
  },
  
  /**
   * Update a planner
   */
  async update(params: UpdatePlannerParams): Promise<Planner> {
    try {
      const supabase = await getServerSupabaseClient();
      
      const { id, title, data } = params;
      
      const updateData: Record<string, any> = {};
      
      if (title !== undefined) updateData.title = title;
      if (data !== undefined) updateData.data = data;
      
      const { data: plannerData, error } = await supabase
        .from('planner')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to update planner');
      }
      
      return mapDbPlannerToModel(plannerData);
    } catch (error) {
      console.error('Error updating planner:', error);
      throw error;
    }
  },
  
  /**
   * Delete a planner
   */
  async delete(id: string): Promise<void> {
    try {
      const supabase = await getServerSupabaseClient();
      
      const { error } = await supabase
        .from('planner')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to delete planner');
      }
    } catch (error) {
      console.error('Error deleting planner:', error);
      throw error;
    }
  }
};

/**
 * Map a database planner to a planner model
 */
function mapDbPlannerToModel(data: any): Planner {
  return {
    id: data.id,
    userId: data.user_id,
    projectId: data.project_id,
    title: data.title,
    data: data.data || {},
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
} 