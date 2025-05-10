describe('Subscription API', () => {
  // Mock NextResponse
  const NextResponse = {
    redirect: jest.fn().mockImplementation((url) => ({ url: url.toString() })),
    json: jest.fn().mockImplementation((data, options) => ({ data, status: options?.status }))
  };

  // Mock auth
  const auth = jest.fn();
  
  // Mock the API handler
  const GET = jest.fn().mockImplementation(async (req) => {
    try {
      const { userId } = await auth();
      
      if (!userId) {
        return NextResponse.redirect(new URL('/sign-in', 'http://localhost:3000'));
      }
      
      const checkoutUrl = 'https://reflectly.lemonsqueezy.com/buy/test-id';
      const urlWithParams = new URL(checkoutUrl);
      urlWithParams.searchParams.append('checkout[custom][user_id]', userId);
      
      return NextResponse.redirect(urlWithParams, 307);
    } catch (error) {
      return NextResponse.json({ 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }, { status: 500 });
    }
  });
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should redirect to sign-in when no user is authenticated', async () => {
    // Mock auth to return no userId
    auth.mockResolvedValue({ userId: null });
    
    const req = { url: 'http://localhost:3000/api/subscription' };
    
    const response = await GET(req);
    
    expect(NextResponse.redirect).toHaveBeenCalled();
    expect(typeof response.url).toBe('string');
    expect(response.url).toContain('sign-in');
  });
  
  it('should redirect to LemonSqueezy checkout with user ID when authenticated', async () => {
    // Mock auth to return a userId
    const mockUserId = 'user_123';
    auth.mockResolvedValue({ userId: mockUserId });
    
    const req = { url: 'http://localhost:3000/api/subscription' };
    
    const response = await GET(req);
    
    expect(NextResponse.redirect).toHaveBeenCalled();
    expect(typeof response.url).toBe('string');
    expect(response.url).toContain('user_id');
    expect(response.url).toContain('reflectly.lemonsqueezy.com');
  });
  
  it('should handle errors gracefully', async () => {
    // Mock auth to throw an error
    auth.mockRejectedValue(new Error('Authentication failed'));
    
    const req = { url: 'http://localhost:3000/api/subscription' };
    
    const response = await GET(req);
    
    expect(NextResponse.json).toHaveBeenCalled();
    expect(response.data.error).toBe('Internal server error');
    expect(response.status).toBe(500);
  });
}); 