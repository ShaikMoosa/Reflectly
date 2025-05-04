import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

/**
 * This endpoint receives webhook events from Lemon Squeezy
 * and updates the user's subscription status in Supabase.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, data } = body;
    
    // Verify the webhook signature (in production, add signature verification)
    // const signature = req.headers.get('x-signature');
    // if (!verifySignature(signature, body)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }
    
    // Process the webhook based on the event type
    if (event === 'order_created') {
      await handleOrderCreated(data);
    } else if (event === 'subscription_created') {
      await handleSubscriptionCreated(data);
    } else if (event === 'subscription_updated') {
      await handleSubscriptionUpdated(data);
    } else if (event === 'subscription_cancelled') {
      await handleSubscriptionCancelled(data);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing LemonSqueezy webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleOrderCreated(data: any) {
  const { order } = data;
  const customData = order.custom_data || {};
  const userId = customData.user_id;
  
  if (!userId) {
    console.error('No user ID found in order custom data');
    return;
  }
  
  const supabase = createClient();
  
  // Create or update user subscription
  await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      order_id: order.id,
      plan_type: 'premium',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
}

async function handleSubscriptionCreated(data: any) {
  const { subscription } = data;
  const customData = subscription.custom_data || {};
  const userId = customData.user_id;
  
  if (!userId) {
    console.error('No user ID found in subscription custom data');
    return;
  }
  
  const supabase = createClient();
  
  // Update user subscription with subscription details
  await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      subscription_id: subscription.id,
      plan_type: 'premium',
      status: 'active',
      renews_at: subscription.renews_at,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
}

async function handleSubscriptionUpdated(data: any) {
  const { subscription } = data;
  const supabase = createClient();
  
  // Find the user associated with this subscription
  const { data: userData } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('subscription_id', subscription.id)
    .single();
  
  if (!userData) {
    console.error('No user found for subscription:', subscription.id);
    return;
  }
  
  // Update the subscription status
  await supabase
    .from('user_subscriptions')
    .update({
      status: subscription.status,
      renews_at: subscription.renews_at,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userData.user_id);
}

async function handleSubscriptionCancelled(data: any) {
  const { subscription } = data;
  const supabase = createClient();
  
  // Find the user associated with this subscription
  const { data: userData } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('subscription_id', subscription.id)
    .single();
  
  if (!userData) {
    console.error('No user found for subscription:', subscription.id);
    return;
  }
  
  // Update the subscription status to cancelled
  await supabase
    .from('user_subscriptions')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userData.user_id);
}