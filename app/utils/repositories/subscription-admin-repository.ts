import { supabaseAdminClient } from '@/app/utils/supabase/admin';
import { handleSupabaseError } from '@/app/utils/supabase/error-handler';

/**
 * Types for subscription analytics
 */
export interface SubscriptionMetrics {
  total_subscribers: number;
  active_premium: number;
  free_users: number;
  cancellations_last_30d: number;
}

export interface CancellationReason {
  reason: string;
  count: number;
  percentage: number;
}

export interface SubscriptionData {
  user_id: string;
  subscription_id: string;
  plan_type: string;
  status: string;
  created_at: string;
  renewed_at: string;
  transcription_count: number;
  ai_chat_count: number;
  cancellation_reason: string | null;
}

/**
 * Repository for admin subscription operations
 */
export const SubscriptionAdminRepository = {
  /**
   * Check if a user is an admin
   */
  async isAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseAdminClient
        .rpc('is_admin', { user_id: userId });
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to check admin status');
      }
      
      return !!data;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },
  
  /**
   * Add a user as an admin
   */
  async addAdmin(adminUserId: string, targetUserId: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseAdminClient
        .rpc('add_admin_user', { 
          admin_user_id: adminUserId,
          target_user_id: targetUserId 
        });
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to add admin user');
      }
      
      return !!data;
    } catch (error) {
      console.error('Error adding admin user:', error);
      return false;
    }
  },
  
  /**
   * Remove an admin user
   */
  async removeAdmin(adminUserId: string, targetUserId: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseAdminClient
        .rpc('remove_admin_user', { 
          admin_user_id: adminUserId,
          target_user_id: targetUserId 
        });
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to remove admin user');
      }
      
      return !!data;
    } catch (error) {
      console.error('Error removing admin user:', error);
      return false;
    }
  },
  
  /**
   * Get subscription metrics
   */
  async getSubscriptionMetrics(): Promise<SubscriptionMetrics> {
    try {
      const { data, error } = await supabaseAdminClient
        .rpc('get_subscription_metrics');
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to get subscription metrics');
      }
      
      // Convert array to object
      const metrics: SubscriptionMetrics = {
        total_subscribers: 0,
        active_premium: 0,
        free_users: 0,
        cancellations_last_30d: 0
      };
      
      data.forEach((item: { metric_name: keyof SubscriptionMetrics; metric_value: number }) => {
        metrics[item.metric_name] = item.metric_value;
      });
      
      return metrics;
    } catch (error) {
      console.error('Error getting subscription metrics:', error);
      throw error;
    }
  },
  
  /**
   * Get cancellation reasons
   */
  async getCancellationReasons(): Promise<CancellationReason[]> {
    try {
      const { data, error } = await supabaseAdminClient
        .from('cancellation_reasons_analytics')
        .select('*');
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to get cancellation reasons');
      }
      
      return data;
    } catch (error) {
      console.error('Error getting cancellation reasons:', error);
      throw error;
    }
  },
  
  /**
   * Reset monthly usage for all free users
   */
  async resetMonthlyUsage(): Promise<boolean> {
    try {
      const { error } = await supabaseAdminClient
        .rpc('reset_monthly_usage');
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to reset monthly usage');
      }
      
      return true;
    } catch (error) {
      console.error('Error resetting monthly usage:', error);
      return false;
    }
  },
  
  /**
   * Export subscription data
   */
  async exportSubscriptionData(days: number = 30): Promise<SubscriptionData[]> {
    try {
      const { data, error } = await supabaseAdminClient
        .rpc('export_subscription_data', { days });
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to export subscription data');
      }
      
      return data;
    } catch (error) {
      console.error('Error exporting subscription data:', error);
      throw error;
    }
  },
  
  /**
   * Update a user's subscription
   */
  async updateSubscription(userId: string, updateData: {
    status?: string;
    planType?: string;
    renewsAt?: string | null;
  }): Promise<boolean> {
    try {
      const data: Record<string, any> = {
        updated_at: new Date().toISOString()
      };
      
      if (updateData.status) data.status = updateData.status;
      if (updateData.planType) data.plan_type = updateData.planType;
      if ('renewsAt' in updateData) data.renews_at = updateData.renewsAt;
      
      const { error } = await supabaseAdminClient
        .from('user_subscriptions')
        .update(data)
        .eq('user_id', userId);
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to update subscription');
      }
      
      return true;
    } catch (error) {
      console.error('Error updating subscription:', error);
      return false;
    }
  },
  
  /**
   * Reset a user's usage
   */
  async resetUserUsage(userId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdminClient
        .from('user_usage')
        .update({
          transcription_count: 0,
          ai_chat_count: 0,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to reset user usage');
      }
      
      return true;
    } catch (error) {
      console.error('Error resetting user usage:', error);
      return false;
    }
  }
}; 