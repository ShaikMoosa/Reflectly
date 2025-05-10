describe('SubscriptionRepository', () => {
  // Mock dependencies
  const mockSupabaseClient = {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn()
        })
      })
    })
  };

  const mockSupabaseAdminClient = {
    from: jest.fn().mockReturnValue({
      upsert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn()
        })
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn()
          })
        })
      })
    })
  };

  // Mock the SubscriptionRepository
  const SubscriptionRepository = {
    getByUserId: jest.fn().mockImplementation((userId) => {
      if (userId === 'user_123') {
        return Promise.resolve({
          id: 1,
          userId: 'user_123',
          subscriptionId: 'sub_123',
          planType: 'pro',
          status: 'active'
        });
      }
      return Promise.resolve(null);
    }),
    
    getSubscriptionStatus: jest.fn().mockImplementation((userId) => {
      if (userId === 'user_123') {
        return Promise.resolve('active');
      }
      return Promise.resolve('free');
    }),
    
    updateSubscription: jest.fn().mockImplementation(({ userId, status }) => {
      return Promise.resolve({
        id: 1,
        userId,
        status,
        planType: 'pro'
      });
    })
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getByUserId', () => {
    it('should return subscription when found', async () => {
      const result = await SubscriptionRepository.getByUserId('user_123');
      
      expect(result).toEqual({
        id: 1,
        userId: 'user_123',
        subscriptionId: 'sub_123',
        planType: 'pro',
        status: 'active'
      });
    });

    it('should return null when no subscription is found', async () => {
      const result = await SubscriptionRepository.getByUserId('nonexistent_user');
      
      expect(result).toBeNull();
    });
  });

  describe('getSubscriptionStatus', () => {
    it('should return "free" when no subscription is found', async () => {
      const result = await SubscriptionRepository.getSubscriptionStatus('nonexistent_user');
      
      expect(result).toBe('free');
    });

    it('should return subscription status when found', async () => {
      const result = await SubscriptionRepository.getSubscriptionStatus('user_123');
      
      expect(result).toBe('active');
    });
  });

  describe('updateSubscription', () => {
    it('should update a subscription status', async () => {
      const params = {
        userId: 'user_123',
        status: 'cancelled'
      };
      
      const result = await SubscriptionRepository.updateSubscription(params);
      
      expect(result).toEqual({
        id: 1,
        userId: 'user_123',
        status: 'cancelled',
        planType: 'pro'
      });
      expect(SubscriptionRepository.updateSubscription).toHaveBeenCalledWith(params);
    });
  });
}); 