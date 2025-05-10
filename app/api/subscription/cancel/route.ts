import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { SubscriptionRepository } from '@/app/utils/repositories/subscription-repository';
import { supabaseAdminClient } from '@/app/utils/supabase/admin';
import { cancelSubscription } from '@/app/utils/lemonsqueezy';

// Ensure this route is always served dynamically
export const dynamic = 'force-dynamic';

interface CancellationRequest {
  reason: string;
  feedback?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const body: CancellationRequest = await request.json();
    
    // Get current subscription
    const subscription = await SubscriptionRepository.getByUserId(userId);
    
    if (!subscription || !subscription.subscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription found' }, 
        { status: 400 }
      );
    }
    
    // Cancel subscription in Lemon Squeezy if it's active
    if (subscription.status === 'active') {
      const success = await cancelSubscription(subscription.subscriptionId);
      
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to cancel subscription with payment provider' }, 
          { status: 500 }
        );
      }
    }
    
    // Update subscription in database
    await SubscriptionRepository.updateSubscription({
      userId,
      status: 'cancelled'
    });
    
    // Store cancellation feedback
    if (body.reason) {
      await supabaseAdminClient.rpc('record_subscription_cancellation', {
        user_id: userId,
        subscription_id: subscription.subscriptionId,
        cancel_reason: body.reason,
        cancel_feedback: body.feedback || null
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 