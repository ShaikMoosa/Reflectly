import { useCallback, useEffect, useState } from 'react';
import { SubscriptionStatus } from '@/app/models/subscription';
import { supabaseClient } from '@/app/utils/supabase/client';

/**
 * Hook for accessing subscription data and features
 */
export const useSubscription = () => {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch subscription status
  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Using the `.match()` filters rather than `.single()` to avoid errors if no record exists
      const { data: subscriptionData, error: subscriptionError } = await supabaseClient
        .from('user_subscriptions')
        .select('*')
        .maybeSingle();
      
      const { data: usageData, error: usageError } = await supabaseClient
        .from('user_usage')
        .select('*')
        .maybeSingle();
      
      if (subscriptionError || usageError) {
        throw subscriptionError || usageError;
      }
      
      // Determine premium status - if any of these are false, not premium
      const plan = subscriptionData?.plan_type || 'free';
      const subscriptionStatus = subscriptionData?.status || 'inactive';
      const isPremium = plan === 'premium' && subscriptionStatus === 'active';
      
      // Set limits based on plan
      const transcriptionLimit = isPremium ? 50 : 5;
      const aiChatLimit = isPremium ? 1000 : 5;
      
      // Get current counts (default to 0 if no usage record)
      const transcriptionCount = usageData?.transcription_count || 0;
      const aiChatCount = usageData?.ai_chat_count || 0;
      
      // Calculate percentages (capped at 100%)
      const transcriptionPercentage = Math.min(
        100, 
        Math.round((transcriptionCount / transcriptionLimit) * 100)
      );
      
      const aiChatPercentage = Math.min(
        100, 
        Math.round((aiChatCount / aiChatLimit) * 100)
      );
      
      setStatus({
        isPremium,
        plan: plan as 'free' | 'premium',
        status: subscriptionStatus,
        subscriptionId: subscriptionData?.subscription_id,
        renewsAt: subscriptionData?.renews_at,
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
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch subscription status'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check if user has access to a specific feature based on usage
  const hasAccess = useCallback(
    (featureType: 'transcription' | 'ai_chat') => {
      if (!status) return false;
      
      const { isPremium, usageStats } = status;
      
      // Premium users always have access
      if (isPremium) return true;
      
      // Check usage for free users
      if (featureType === 'transcription') {
        return usageStats.transcriptions.used < usageStats.transcriptions.limit;
      } else if (featureType === 'ai_chat') {
        return usageStats.aiChat.used < usageStats.aiChat.limit;
      }
      
      return false;
    },
    [status]
  );

  // Check remaining usage
  const getRemainingUsage = useCallback(
    (featureType: 'transcription' | 'ai_chat') => {
      if (!status) return 0;
      
      const { usageStats } = status;
      
      if (featureType === 'transcription') {
        return Math.max(0, usageStats.transcriptions.limit - usageStats.transcriptions.used);
      } else if (featureType === 'ai_chat') {
        return Math.max(0, usageStats.aiChat.limit - usageStats.aiChat.used);
      }
      
      return 0;
    },
    [status]
  );

  // Function to update local usage count after using a feature
  const incrementUsage = useCallback(
    (featureType: 'transcription' | 'ai_chat') => {
      if (!status) return;
      
      setStatus((prevStatus: SubscriptionStatus | null) => {
        if (!prevStatus) return prevStatus;
        
        if (featureType === 'transcription') {
          const used = prevStatus.usageStats.transcriptions.used + 1;
          const percentage = Math.min(
            100, 
            Math.round((used / prevStatus.usageStats.transcriptions.limit) * 100)
          );
          
          return {
            ...prevStatus,
            usageStats: {
              ...prevStatus.usageStats,
              transcriptions: {
                ...prevStatus.usageStats.transcriptions,
                used,
                percentage
              }
            }
          };
        } else if (featureType === 'ai_chat') {
          const used = prevStatus.usageStats.aiChat.used + 1;
          const percentage = Math.min(
            100, 
            Math.round((used / prevStatus.usageStats.aiChat.limit) * 100)
          );
          
          return {
            ...prevStatus,
            usageStats: {
              ...prevStatus.usageStats,
              aiChat: {
                ...prevStatus.usageStats.aiChat,
                used,
                percentage
              }
            }
          };
        }
        
        return prevStatus;
      });
    },
    [status]
  );

  // Set up a subscription to listen for changes
  useEffect(() => {
    // Initialize subscription status
    fetchSubscriptionStatus();

    // Set up subscription for user_subscriptions changes
    const subscriptionsChannel = supabaseClient
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_subscriptions',
        },
        () => {
          fetchSubscriptionStatus();
        }
      )
      .subscribe();

    // Set up subscription for user_usage changes
    const usageChannel = supabaseClient
      .channel('usage-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_usage',
        },
        () => {
          fetchSubscriptionStatus();
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      subscriptionsChannel.unsubscribe();
      usageChannel.unsubscribe();
    };
  }, [fetchSubscriptionStatus]);

  return {
    status,
    isLoading,
    error,
    fetchSubscriptionStatus,
    hasAccess,
    getRemainingUsage,
    incrementUsage,
    isPremium: status?.isPremium || false
  };
}; 