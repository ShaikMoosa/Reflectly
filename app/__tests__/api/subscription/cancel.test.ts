import { NextRequest, NextResponse } from 'next/server';
import { POST } from '@/app/api/subscription/cancel/route';
import { auth } from '@clerk/nextjs';
import { SubscriptionRepository } from '@/app/utils/repositories';
import { cancelSubscription } from '@/app/utils/lemonsqueezy';
import { supabaseAdminClient } from '@/app/utils/supabase/admin';

// Mock dependencies
jest.mock('@clerk/nextjs', () => ({
  auth: jest.fn(),
}));

jest.mock('@/app/utils/repositories', () => ({
  SubscriptionRepository: {
    getByUserId: jest.fn(),
    updateSubscription: jest.fn(),
  },
}));

jest.mock('@/app/utils/lemonsqueezy', () => ({
  cancelSubscription: jest.fn(),
}));

jest.mock('@/app/utils/supabase/admin', () => ({
  supabaseAdminClient: {
    rpc: jest.fn().mockReturnValue({ error: null }),
  },
}));

jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation(() => ({
    json: jest.fn().mockResolvedValue({}),
  })),
  NextResponse: {
    json: jest.fn((data, options) => ({ data, status: options?.status })),
  },
}));

describe('Subscription Cancellation API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 when no user is authenticated', async () => {
    // Mock auth to return no userId
    (auth as jest.Mock).mockResolvedValue({ userId: null });
    
    const req = new NextRequest('http://localhost:3000/api/subscription/cancel');
    req.json = jest.fn().mockResolvedValue({ reason: 'too expensive' });
    
    const response = await POST(req);
    
    expect(response.data).toEqual({ error: 'Unauthorized' });
    expect(response.status).toBe(401);
  });

  it('should return 400 when no active subscription is found', async () => {
    // Mock auth to return a userId
    const mockUserId = 'user_123';
    (auth as jest.Mock).mockResolvedValue({ userId: mockUserId });
    
    // Mock no subscription found
    (SubscriptionRepository.getByUserId as jest.Mock).mockResolvedValue(null);
    
    const req = new NextRequest('http://localhost:3000/api/subscription/cancel');
    req.json = jest.fn().mockResolvedValue({ reason: 'too expensive' });
    
    const response = await POST(req);
    
    expect(response.data).toEqual({ error: 'No active subscription found' });
    expect(response.status).toBe(400);
  });

  it('should cancel an active subscription successfully', async () => {
    // Mock auth to return a userId
    const mockUserId = 'user_123';
    (auth as jest.Mock).mockResolvedValue({ userId: mockUserId });
    
    // Mock active subscription
    const mockSubscription = {
      userId: mockUserId,
      subscriptionId: 'sub_123',
      status: 'active'
    };
    (SubscriptionRepository.getByUserId as jest.Mock).mockResolvedValue(mockSubscription);
    
    // Mock successful cancellation
    (cancelSubscription as jest.Mock).mockResolvedValue(true);
    
    const req = new NextRequest('http://localhost:3000/api/subscription/cancel');
    req.json = jest.fn().mockResolvedValue({ 
      reason: 'too expensive',
      feedback: 'It was a bit over my budget'
    });
    
    const response = await POST(req);
    
    // Verify subscription was updated in the database
    expect(SubscriptionRepository.updateSubscription).toHaveBeenCalledWith({
      userId: mockUserId,
      status: 'cancelled'
    });
    
    // Verify cancellation feedback was recorded
    expect(supabaseAdminClient.rpc).toHaveBeenCalledWith(
      'record_subscription_cancellation',
      expect.objectContaining({
        user_id: mockUserId,
        subscription_id: 'sub_123',
        cancel_reason: 'too expensive',
        cancel_feedback: 'It was a bit over my budget'
      })
    );
    
    expect(response.data).toEqual({ success: true });
  });

  it('should handle failed cancellation with payment provider', async () => {
    // Mock auth to return a userId
    const mockUserId = 'user_123';
    (auth as jest.Mock).mockResolvedValue({ userId: mockUserId });
    
    // Mock active subscription
    const mockSubscription = {
      userId: mockUserId,
      subscriptionId: 'sub_123',
      status: 'active'
    };
    (SubscriptionRepository.getByUserId as jest.Mock).mockResolvedValue(mockSubscription);
    
    // Mock failed cancellation
    (cancelSubscription as jest.Mock).mockResolvedValue(false);
    
    const req = new NextRequest('http://localhost:3000/api/subscription/cancel');
    req.json = jest.fn().mockResolvedValue({ reason: 'too expensive' });
    
    const response = await POST(req);
    
    expect(response.data).toEqual({ 
      error: 'Failed to cancel subscription with payment provider' 
    });
    expect(response.status).toBe(500);
  });

  it('should handle unexpected errors', async () => {
    // Mock auth to throw an error
    (auth as jest.Mock).mockRejectedValue(new Error('Authentication failed'));
    
    const req = new NextRequest('http://localhost:3000/api/subscription/cancel');
    req.json = jest.fn().mockResolvedValue({ reason: 'too expensive' });
    
    const response = await POST(req);
    
    expect(response.data).toEqual({ error: 'Internal server error' });
    expect(response.status).toBe(500);
  });
}); 