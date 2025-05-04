import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/app/utils/supabase/server';

export async function GET(req: NextRequest) {
  console.log('Subscription API endpoint called');
  
  try {
    const { userId } = await auth();
    console.log('Auth check completed, userId:', userId ? 'exists' : 'not found');
    
    if (!userId) {
      console.log('No userId found, redirecting to sign-in');
      return NextResponse.redirect(new URL('/sign-in', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
    }
    
    // Redirect to LemonSqueezy checkout with user ID as a custom field
    const checkoutUrl = 'https://reflectly.lemonsqueezy.com/buy/7732cab7-c161-47ce-b210-f706ab1d901a';
    const urlWithParams = new URL(checkoutUrl);
    urlWithParams.searchParams.append('checkout[custom][user_id]', userId);
    
    console.log('Redirecting to LemonSqueezy checkout with params:', urlWithParams.toString());
    
    // Use 307 Temporary Redirect to ensure the browser uses GET for the redirect
    return NextResponse.redirect(urlWithParams, 307);
  } catch (error) {
    console.error('Error in subscription route:', error);
    
    // Return a more detailed error response
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    }, { status: 500 });
  }
} 