import { NextRequest, NextResponse } from 'next/server';
import { GET } from '@/app/api/subscription/route';
import { auth } from '@clerk/nextjs/server';

// Mock dependencies
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    redirect: jest.fn().mockReturnValue({ status: 307 }),
    json: jest.fn().mockReturnValue({ status: 500 }),
  },
}));

jest.mock('@/app/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('Subscription Route API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to sign-in when no user is authenticated', async () => {
    // Mock auth to return no userId
    (auth as jest.Mock).mockResolvedValue({ userId: null });
    
    const req = new NextRequest('http://localhost:3000/api/subscription');
    
    await GET(req);
    
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      expect.objectContaining({
        href: expect.stringContaining('/sign-in')
      }),
      expect.anything()
    );
  });

  it('should redirect to LemonSqueezy checkout with user ID when authenticated', async () => {
    // Mock auth to return a userId
    const mockUserId = 'user_123';
    (auth as jest.Mock).mockResolvedValue({ userId: mockUserId });
    
    const req = new NextRequest('http://localhost:3000/api/subscription');
    
    await GET(req);
    
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      expect.objectContaining({
        href: expect.stringContaining('user_id=' + mockUserId)
      }),
      307
    );
  });

  it('should handle errors gracefully', async () => {
    // Mock auth to throw an error
    (auth as jest.Mock).mockRejectedValue(new Error('Authentication failed'));
    
    const req = new NextRequest('http://localhost:3000/api/subscription');
    
    await GET(req);
    
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Internal server error'
      }),
      { status: 500 }
    );
  });
}); 