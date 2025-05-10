import { NextRequest, NextResponse } from 'next/server';
import { GET } from '@/app/api/subscription/checkout-url/route';
import { auth } from '@clerk/nextjs/server';

// Mock dependencies
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data) => ({ data })),
    redirect: jest.fn((url) => ({ url })),
  },
}));

jest.mock('@/app/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('Subscription Checkout URL API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.LEMONSQUEEZY_CHECKOUT_URL = 'https://reflectly.lemonsqueezy.com/checkout/test';
  });

  it('should require authentication', async () => {
    // Mock auth to return no userId
    (auth as jest.Mock).mockResolvedValue({ userId: null });
    
    const req = new NextRequest('http://localhost:3000/api/subscription/checkout-url');
    
    const response = await GET(req);
    
    expect(NextResponse.redirect).toHaveBeenCalled();
    expect(response.url).toContain('/sign-in');
  });

  it('should return checkout URL with user ID for authenticated users', async () => {
    // Mock auth to return a userId
    const mockUserId = 'user_123';
    (auth as jest.Mock).mockResolvedValue({ userId: mockUserId });
    
    const req = new NextRequest('http://localhost:3000/api/subscription/checkout-url');
    
    const response = await GET(req);
    
    expect(NextResponse.json).toHaveBeenCalled();
    expect(response.data).toHaveProperty('url');
    expect(response.data.url).toContain(mockUserId);
    expect(response.data.url).toContain('https://reflectly.lemonsqueezy.com/checkout/test');
  });

  it('should handle missing checkout URL configuration', async () => {
    // Remove the checkout URL from env
    delete process.env.LEMONSQUEEZY_CHECKOUT_URL;
    
    // Mock auth to return a userId
    const mockUserId = 'user_123';
    (auth as jest.Mock).mockResolvedValue({ userId: mockUserId });
    
    const req = new NextRequest('http://localhost:3000/api/subscription/checkout-url');
    
    const response = await GET(req);
    
    expect(NextResponse.json).toHaveBeenCalled();
    expect(response.data).toHaveProperty('error');
    expect(response.data.error).toContain('Checkout URL not configured');
  });

  it('should handle errors gracefully', async () => {
    // Mock auth to throw an error
    (auth as jest.Mock).mockRejectedValue(new Error('Authentication failed'));
    
    const req = new NextRequest('http://localhost:3000/api/subscription/checkout-url');
    
    const response = await GET(req);
    
    expect(NextResponse.json).toHaveBeenCalled();
    expect(response.data).toHaveProperty('error');
    expect(response.data.error).toContain('Internal server error');
  });
}); 