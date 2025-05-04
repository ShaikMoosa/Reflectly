import { User } from '@clerk/nextjs/server';
import { createClient } from './supabase/server';
import { getSubscription, cancelSubscription } from './lemonsqueezy';

export type SubscriptionStatus = {
  isPremium: boolean;
  plan: 'free' | 'premium';
  status: string;
  subscriptionId?: string;
  renews_at?: string;
  usageStats: {
    transcriptions: {
      used: number;
      limit: number;
      percentage: number;
    };
    aiChat: {
      used: number;
      limit: number;
      percentage: number;
    };
  };
};

/**
 * Refreshes subscription data from Lemon Squeezy
 */
export async function refreshSubscriptionFromLemonSqueezy(userId: string): Promise<boolean> {
  const supabase = createClient();
  
  // Get the current subscription
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (!subscription?.subscription_id) {
    // No subscription to refresh
    return false;
  }
  
  // Get the latest subscription data from Lemon Squeezy
  const lemonSqueezyData = await getSubscription(subscription.subscription_id);
  
  if (!lemonSqueezyData) {
    return false;
  }
  
  // Update the subscription in our database
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: lemonSqueezyData.status,
      renews_at: lemonSqueezyData.renews_at,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
  
  return !error;
}

/**
 * Checks if the user is on a premium plan
 */
export async function getUserSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  // Initialize Supabase client
  const supabase = createClient();
  
  // Get the user's subscription
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  // Get the user's usage
  const { data: usage } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  // If subscription exists and is active, refresh from Lemon Squeezy occasionally
  if (subscription?.subscription_id) {
    // Refresh if the data is older than a day
    const lastUpdate = new Date(subscription.updated_at);
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    if (lastUpdate < oneDayAgo) {
      await refreshSubscriptionFromLemonSqueezy(userId);
      
      // Refetch the subscription data
      const { data: refreshedSubscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (refreshedSubscription) {
        subscription.status = refreshedSubscription.status;
        subscription.renews_at = refreshedSubscription.renews_at;
      }
    }
  }
  
  // Default to free plan if no subscription found
  const plan = subscription?.plan_type || 'free';
  const status = subscription?.status || 'inactive';
  
  // Determine if the user is premium
  const isPremium = plan === 'premium' && status === 'active';
  
  // Calculate usage limits
  const transcriptionLimit = isPremium ? 50 : 5;
  const aiChatLimit = isPremium ? 1000 : 5;
  
  // Get usage counts
  const transcriptionCount = usage?.transcription_count || 0;
  const aiChatCount = usage?.ai_chat_count || 0;
  
  // Calculate usage percentages
  const transcriptionPercentage = (transcriptionCount / transcriptionLimit) * 100;
  const aiChatPercentage = (aiChatCount / aiChatLimit) * 100;
  
  return {
    isPremium,
    plan,
    status,
    subscriptionId: subscription?.subscription_id,
    renews_at: subscription?.renews_at,
    usageStats: {
      transcriptions: {
        used: transcriptionCount,
        limit: transcriptionLimit,
        percentage: transcriptionPercentage,
      },
      aiChat: {
        used: aiChatCount,
        limit: aiChatLimit,
        percentage: aiChatPercentage,
      },
    },
  };
}

/**
 * Increments the transcription count for a user
 * @returns true if successful, false if limit reached
 */
export async function incrementTranscriptionCount(userId: string): Promise<boolean> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .rpc('increment_transcription_count', { user_id: userId });
  
  return !!data && !error;
}

/**
 * Increments the AI chat count for a user
 * @returns true if successful, false if limit reached
 */
export async function incrementAiChatCount(userId: string): Promise<boolean> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .rpc('increment_ai_chat_count', { user_id: userId });
  
  return !!data && !error;
}

/**
 * Cancels a user's subscription
 */
export async function cancelUserSubscription(userId: string): Promise<boolean> {
  const supabase = createClient();
  
  // Get the user's subscription
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('subscription_id')
    .eq('user_id', userId)
    .single();
  
  if (!subscription?.subscription_id) {
    return false;
  }
  
  // Cancel the subscription via Lemon Squeezy
  const success = await cancelSubscription(subscription.subscription_id);
  
  if (success) {
    // Update our database
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
  }
  
  return success;
} 