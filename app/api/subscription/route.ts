import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/app/utils/supabase/server';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
    }
    
    // Redirect to LemonSqueezy checkout with user ID as a custom field
    const checkoutUrl = 'https://reflectly.lemonsqueezy.com/checkout/buy/5ddbd9b0-0b14-4fd0-8976-e341ab73a00b';
    const urlWithParams = new URL(checkoutUrl);
    urlWithParams.searchParams.append('checkout[custom][user_id]', userId);
    
    return NextResponse.redirect(urlWithParams);
  } catch (error) {
    console.error('Error in subscription route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 