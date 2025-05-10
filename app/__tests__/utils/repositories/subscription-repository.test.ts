import { SubscriptionRepository } from '@/app/utils/repositories';
import { getServerSupabaseClient } from '@/app/utils/supabase/clerk-auth';
import { supabaseAdminClient } from '@/app/utils/supabase/admin';
import { 
  CreateSubscriptionParams, 
  UpdateSubscriptionParams, 
  UpdateUserUsageParams, 
  SubscriptionStatus 
} from '@/app/models/subscription';

// Mock dependencies
jest.mock('@/app/utils/supabase/clerk-auth', () => ({
  getServerSupabaseClient: jest.fn(),
}));

jest.mock('@/app/utils/supabase/admin', () => ({
  supabaseAdminClient: {
    from: jest.fn(),
  },
}));

describe('SubscriptionRepository', () => {
  // Mock Supabase client responses
  const mockSupabaseClient = {
    from: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSupabaseClient as jest.Mock).mockResolvedValue(mockSupabaseClient);
  });

  describe('getByUserId', () => {
    it('should return null when no subscription is found', async () => {
      // Mock Supabase response for no subscription
      const mockSelectSingle = jest.fn().mockResolvedValue({
        data: null,
        error: {
          code: 'PGRST116', // No rows returned
        },
      });

      const mockEq = jest.fn().mockReturnValue({ single: mockSelectSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabaseClient.from.mockReturnValue({ select: mockSelect });

      const result = await SubscriptionRepository.getByUserId('user123');

      expect(result).toBeNull();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_subscriptions');
    });

    it('should return subscription when found', async () => {
      // Mock subscription data
      const mockSubscriptionData = {
        id: 1,
        user_id: 'user123',
        subscription_id: 'sub_123',
        plan_type: 'premium',
        status: 'active',
        variant_id: 'var_123',
        renews_at: '2023-12-31T23:59:59Z',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      // Mock Supabase response
      const mockSelectSingle = jest.fn().mockResolvedValue({
        data: mockSubscriptionData,
        error: null,
      });

      const mockEq = jest.fn().mockReturnValue({ single: mockSelectSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabaseClient.from.mockReturnValue({ select: mockSelect });

      const result = await SubscriptionRepository.getByUserId('user123');

      expect(result).toEqual({
        id: 1,
        userId: 'user123',
        subscriptionId: 'sub_123',
        planType: 'premium',
        status: 'active',
        variantId: 'var_123',
        renewsAt: '2023-12-31T23:59:59Z',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      });
    });

    it('should throw error on database failure', async () => {
      // Mock Supabase error response
      const mockSelectSingle = jest.fn().mockResolvedValue({
        data: null,
        error: {
          code: 'ERROR',
          message: 'Database error',
        },
      });

      const mockEq = jest.fn().mockReturnValue({ single: mockSelectSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabaseClient.from.mockReturnValue({ select: mockSelect });

      await expect(SubscriptionRepository.getByUserId('user123')).rejects.toThrow();
    });
  });

  describe('upsertSubscription', () => {
    it('should create a new subscription', async () => {
      // Mock subscription data
      const mockSubscriptionData = {
        id: 1,
        user_id: 'user123',
        subscription_id: 'sub_123',
        plan_type: 'premium',
        status: 'active',
        variant_id: 'var_123',
        renews_at: '2023-12-31T23:59:59Z',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      // Mock Supabase response
      const mockSelectSingle = jest.fn().mockResolvedValue({
        data: mockSubscriptionData,
        error: null,
      });

      const mockSelect = jest.fn().mockReturnValue({ single: mockSelectSingle });
      const mockUpsert = jest.fn().mockReturnValue({ select: mockSelect });
      
      // Fix: properly type the mock function
      (supabaseAdminClient.from as jest.Mock).mockReturnValue({ upsert: mockUpsert });

      const params: CreateSubscriptionParams = {
        userId: 'user123',
        subscriptionId: 'sub_123',
        planType: 'premium',
        status: 'active',
        variantId: 'var_123',
        renewsAt: '2023-12-31T23:59:59Z',
      };

      const result = await SubscriptionRepository.upsertSubscription(params);

      expect(result).toEqual({
        id: 1,
        userId: 'user123',
        subscriptionId: 'sub_123',
        planType: 'premium',
        status: 'active',
        variantId: 'var_123',
        renewsAt: '2023-12-31T23:59:59Z',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      });

      expect(supabaseAdminClient.from).toHaveBeenCalledWith('user_subscriptions');
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user123',
          subscription_id: 'sub_123',
          plan_type: 'premium',
          status: 'active',
          variant_id: 'var_123',
          renews_at: '2023-12-31T23:59:59Z',
        }),
        expect.any(Object)
      );
    });
  });

  describe('getSubscriptionStatus', () => {
    it('should return "free" when no subscription is found', async () => {
      // Mock Supabase response for no subscription
      const mockSelectSingle = jest.fn().mockResolvedValue({
        data: null,
        error: {
          code: 'PGRST116', // No rows returned
        },
      });

      const mockEq = jest.fn().mockReturnValue({ single: mockSelectSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabaseClient.from.mockReturnValue({ select: mockSelect });

      const result = await SubscriptionRepository.getSubscriptionStatus('user123');

      expect(result).toBe('free');
    });

    it('should return subscription status when found', async () => {
      // Mock subscription data
      const mockSubscriptionData = {
        id: 1,
        user_id: 'user123',
        subscription_id: 'sub_123',
        plan_type: 'premium',
        status: 'active',
        variant_id: 'var_123',
        renews_at: '2023-12-31T23:59:59Z',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      // Mock Supabase response
      const mockSelectSingle = jest.fn().mockResolvedValue({
        data: mockSubscriptionData,
        error: null,
      });

      const mockEq = jest.fn().mockReturnValue({ single: mockSelectSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      mockSupabaseClient.from.mockReturnValue({ select: mockSelect });

      const result = await SubscriptionRepository.getSubscriptionStatus('user123');

      expect(result).toBe('active');
    });
  });
}); 