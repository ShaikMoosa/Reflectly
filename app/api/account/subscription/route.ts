import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserSubscriptionStatus } from '@/app/utils/subscriptions';

// Explicitly make this route dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const { userId } = await auth();
    
    // For testing, allow unauthenticated requests
    if (!userId) {
      return NextResponse.json({ 
        subscriptionData: {
          isPremium: false,
          plan: 'free',
          status: 'inactive',
          usageStats: {
            transcriptions: {
              used: 0,
              limit: 5,
              percentage: 0,
            },
            aiChat: {
              used: 0,
              limit: 5,
              percentage: 0,
            },
          },
        },
        message: 'Demo data - not authenticated'
      });
    }
    
    // Get the user's subscription status
    const subscriptionData = await getUserSubscriptionStatus(userId);
    
    // Return the subscription data
    return NextResponse.json({ subscriptionData });
  } catch (error: any) {
    console.error('Error fetching subscription status:', error);
    
    // For testing, return demo data on error
    return NextResponse.json({ 
      subscriptionData: {
        isPremium: false,
        plan: 'free',
        status: 'inactive',
        usageStats: {
          transcriptions: {
            used: 0,
            limit: 5,
            percentage: 0,
          },
          aiChat: {
            used: 0,
            limit: 5,
            percentage: 0,
          },
        },
      },
      error: `Error occurred: ${error.message}`
    });
  }
} 