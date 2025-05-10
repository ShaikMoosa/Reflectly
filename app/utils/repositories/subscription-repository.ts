import { 
  CreateSubscriptionParams, 
  SubscriptionStatus, 
  UpdateSubscriptionParams, 
  UpdateUserUsageParams, 
  UserSubscription, 
  UserUsage 
} from '@/app/models/subscription';
import { getServerSupabaseClient } from '@/app/utils/supabase/clerk-auth';
import { handleSupabaseError } from '@/app/utils/supabase/error-handler';
import { Database } from '@/app/utils/supabase/database.types';
import { supabaseAdminClient } from '@/app/utils/supabase/admin';

/**
 * Repository for subscription operations
 */
export const SubscriptionRepository = {
  /**
   * Get a user's subscription
   */
  async getByUserId(userId: string): Promise<UserSubscription | null> {
    try {
      const supabase = await getServerSupabaseClient();
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw handleSupabaseError(error, 'Failed to retrieve subscription');
      }
      
      if (!data) {
        return null;
      }
      
      return mapDatabaseSubscriptionToModel(data);
    } catch (error) {
      console.error('Error retrieving user subscription:', error);
      throw error;
    }
  },
  
  /**
   * Get a user's usage
   */
  async getUserUsage(userId: string): Promise<UserUsage | null> {
    try {
      const supabase = await getServerSupabaseClient();
      
      const { data, error } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw handleSupabaseError(error, 'Failed to retrieve user usage');
      }
      
      if (!data) {
        return null;
      }
      
      return mapDatabaseUsageToModel(data);
    } catch (error) {
      console.error('Error retrieving user usage:', error);
      throw error;
    }
  },
  
  /**
   * Create or update a user's subscription
   */
  async upsertSubscription(params: CreateSubscriptionParams): Promise<UserSubscription> {
    try {
      // Using admin client for potential creation of records for other users
      const { userId, subscriptionId, planType, status, variantId, renewsAt } = params;
      
      const { data, error } = await supabaseAdminClient
        .from('user_subscriptions')
        .upsert({
          user_id: userId,
          subscription_id: subscriptionId,
          plan_type: planType,
          status,
          variant_id: variantId,
          renews_at: renewsAt,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to create/update subscription');
      }
      
      return mapDatabaseSubscriptionToModel(data);
    } catch (error) {
      console.error('Error creating/updating subscription:', error);
      throw error;
    }
  },
  
  /**
   * Update a user's subscription
   */
  async updateSubscription(params: UpdateSubscriptionParams): Promise<UserSubscription> {
    try {
      // Using admin client for potential updates to other users
      const { userId, subscriptionId, planType, status, variantId, renewsAt } = params;
      
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString()
      };
      
      if (subscriptionId !== undefined) updateData.subscription_id = subscriptionId;
      if (planType !== undefined) updateData.plan_type = planType;
      if (status !== undefined) updateData.status = status;
      if (variantId !== undefined) updateData.variant_id = variantId;
      if (renewsAt !== undefined) updateData.renews_at = renewsAt;
      
      const { data, error } = await supabaseAdminClient
        .from('user_subscriptions')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to update subscription');
      }
      
      return mapDatabaseSubscriptionToModel(data);
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  },
  
  /**
   * Update user usage
   */
  async updateUserUsage(params: UpdateUserUsageParams): Promise<UserUsage> {
    try {
      const supabase = await getServerSupabaseClient();
      const { userId, transcriptionCount, aiChatCount } = params;
      
      // First check if user usage exists
      const { data: existingUsage, error: checkError } = await supabase
        .from('user_usage')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      // Determine if we need to insert or update
      if (!existingUsage && (checkError?.code === 'PGRST116' || !checkError)) {
        // Insert new usage record
        const { data, error } = await supabase
          .from('user_usage')
          .insert({
            user_id: userId,
            transcription_count: transcriptionCount || 0,
            ai_chat_count: aiChatCount || 0
          })
          .select()
          .single();
        
        if (error) {
          throw handleSupabaseError(error, 'Failed to create user usage');
        }
        
        return mapDatabaseUsageToModel(data);
      } else {
        // Update existing usage record
        const updateData: Record<string, any> = {};
        
        if (transcriptionCount !== undefined) updateData.transcription_count = transcriptionCount;
        if (aiChatCount !== undefined) updateData.ai_chat_count = aiChatCount;
        
        const { data, error } = await supabase
          .from('user_usage')
          .update(updateData)
          .eq('user_id', userId)
          .select()
          .single();
        
        if (error) {
          throw handleSupabaseError(error, 'Failed to update user usage');
        }
        
        return mapDatabaseUsageToModel(data);
      }
    } catch (error) {
      console.error('Error updating user usage:', error);
      throw error;
    }
  },
  
  /**
   * Increment transcription count
   */
  async incrementTranscriptionCount(userId: string): Promise<boolean> {
    try {
      const supabase = await getServerSupabaseClient();
      
      const { data, error } = await supabase
        .rpc('increment_transcription_count', { user_id: userId });
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to increment transcription count');
      }
      
      return !!data;
    } catch (error) {
      console.error('Error incrementing transcription count:', error);
      throw error;
    }
  },
  
  /**
   * Increment AI chat count
   */
  async incrementAiChatCount(userId: string): Promise<boolean> {
    try {
      const supabase = await getServerSupabaseClient();
      
      const { data, error } = await supabase
        .rpc('increment_ai_chat_count', { user_id: userId });
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to increment AI chat count');
      }
      
      return !!data;
    } catch (error) {
      console.error('Error incrementing AI chat count:', error);
      throw error;
    }
  },
  
  /**
   * Get complete subscription status with usage statistics
   */
  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    try {
      const supabase = await getServerSupabaseClient();
      
      // Get subscription data
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      // Get usage data
      const { data: usage } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      // Determine premium status
      const plan = subscription?.plan_type || 'free';
      const status = subscription?.status || 'inactive';
      const isPremium = plan === 'premium' && status === 'active';
      
      // Set limits based on plan
      const transcriptionLimit = isPremium ? 50 : 5;
      const aiChatLimit = isPremium ? 1000 : 5;
      
      // Get current counts
      const transcriptionCount = usage?.transcription_count || 0;
      const aiChatCount = usage?.ai_chat_count || 0;
      
      // Calculate percentages
      const transcriptionPercentage = Math.min(
        100, 
        Math.round((transcriptionCount / transcriptionLimit) * 100)
      );
      
      const aiChatPercentage = Math.min(
        100, 
        Math.round((aiChatCount / aiChatLimit) * 100)
      );
      
      return {
        isPremium,
        plan: plan as 'free' | 'premium',
        status,
        subscriptionId: subscription?.subscription_id,
        renewsAt: subscription?.renews_at,
        usageStats: {
          transcriptions: {
            used: transcriptionCount,
            limit: transcriptionLimit,
            percentage: transcriptionPercentage
          },
          aiChat: {
            used: aiChatCount,
            limit: aiChatLimit,
            percentage: aiChatPercentage
          }
        }
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      throw error;
    }
  }
};

/**
 * Helper function to map database subscription to model
 */
function mapDatabaseSubscriptionToModel(
  data: Database['public']['Tables']['user_subscriptions']['Row']
): UserSubscription {
  return {
    id: data.id,
    userId: data.user_id,
    subscriptionId: data.subscription_id,
    planType: data.plan_type as 'free' | 'premium',
    status: data.status,
    variantId: data.variant_id || undefined,
    renewsAt: data.renews_at || undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

/**
 * Helper function to map database usage to model
 */
function mapDatabaseUsageToModel(
  data: Database['public']['Tables']['user_usage']['Row']
): UserUsage {
  return {
    id: data.id,
    userId: data.user_id,
    transcriptionCount: data.transcription_count,
    aiChatCount: data.ai_chat_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
} 