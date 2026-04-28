/**
 * Interface for user subscription
 */
export interface UserSubscription {
  id: string;
  userId: string;
  subscriptionId: string;
  planType: 'free' | 'premium';
  status: string;
  variantId?: string;
  renewsAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for user usage statistics
 */
export interface UserUsage {
  id: string;
  userId: string;
  transcriptionCount: number;
  aiChatCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for subscription status with usage data
 */
export interface SubscriptionStatus {
  isPremium: boolean;
  plan: 'free' | 'premium';
  status: string;
  subscriptionId?: string;
  renewsAt?: string;
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
}

/**
 * Interface for updating user usage
 */
export interface UpdateUserUsageParams {
  userId: string;
  transcriptionCount?: number;
  aiChatCount?: number;
}

/**
 * Interface for creating a subscription
 */
export interface CreateSubscriptionParams {
  userId: string;
  subscriptionId: string;
  planType: 'free' | 'premium';
  status: string;
  variantId?: string;
  renewsAt?: string;
}

/**
 * Interface for updating a subscription
 */
export interface UpdateSubscriptionParams {
  userId: string;
  subscriptionId?: string;
  planType?: 'free' | 'premium';
  status?: string;
  variantId?: string;
  renewsAt?: string;
} 