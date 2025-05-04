import { User } from '@clerk/nextjs/server';
import { createClient } from './supabase/server';

export type SubscriptionStatus = {
  isPremium: boolean;
  plan: 'free' | 'premium';
  status: string;
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