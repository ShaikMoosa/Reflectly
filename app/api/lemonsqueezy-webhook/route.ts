import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { SubscriptionRepository } from '@/app/utils/repositories';

// Ensure this route is always served dynamically
export const dynamic = 'force-dynamic';

// Event types from Lemon Squeezy
type LemonSqueezyEventType =
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_cancelled'
  | 'subscription_resumed'
  | 'subscription_expired'
  | 'subscription_paused'
  | 'subscription_unpaused'
  | 'order_created'
  | 'order_refunded';

interface LemonSqueezyEvent {
  meta: {
    event_name: LemonSqueezyEventType;
    custom_data?: {
      userId?: string;
    };
  };
  data: {
    id: string;
    type: string;
    attributes: {
      status: string;
      order_id: number;
      product_id: number;
      variant_id: number;
      user_name: string;
      user_email: string;
      created_at: string;
      renewed_at: string | null;
      updated_at: string;
      renews_at: string | null;
      cancelled_at: string | null;
      test_mode: boolean;
    };
  };
}

/**
 * This endpoint receives webhook events from Lemon Squeezy
 * and updates the user's subscription status in Supabase.
 */
export async function POST(request: NextRequest) {
  try {
    // Get the request body as text for signature verification
    const rawBody = await request.text();
    const body = JSON.parse(rawBody) as LemonSqueezyEvent;

    // Get the signature from headers
    const signature = request.headers.get('x-signature');
    if (!signature) {
      console.error('No signature provided in webhook');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the signature using your webhook secret
    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }

    // Create the HMAC signature
    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(rawBody);
    const generatedSignature = hmac.digest('hex');

    // Compare signatures
    if (signature !== generatedSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the event type
    const eventType = body.meta.event_name;
    
    // Get userId from custom data
    const userId = body.meta.custom_data?.userId;
    if (!userId) {
      console.error('No userId in custom_data', body.meta);
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    // Process different event types
    switch (eventType) {
      case 'subscription_created':
        await handleSubscriptionCreated(body, userId);
        break;
      case 'subscription_updated':
        await handleSubscriptionUpdated(body, userId);
        break;
      case 'subscription_cancelled':
        await handleSubscriptionCancelled(body, userId);
        break;
      case 'subscription_resumed':
        await handleSubscriptionResumed(body, userId);
        break;
      case 'subscription_expired':
        await handleSubscriptionExpired(body, userId);
        break;
      case 'subscription_paused':
        await handleSubscriptionPaused(body, userId);
        break;
      case 'subscription_unpaused':
        await handleSubscriptionUnpaused(body, userId);
        break;
      case 'order_created':
        // You might want to handle new orders differently than subscriptions
        console.log(`Order created for user ${userId}`);
        break;
      case 'order_refunded':
        // Handle refunds - potentially downgrade user to free plan
        await handleOrderRefunded(body, userId);
        break;
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    // Return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Handle subscription created event
async function handleSubscriptionCreated(event: LemonSqueezyEvent, userId: string) {
  try {
    const attributes = event.data.attributes;
    const subscriptionId = event.data.id;
    const variantId = attributes.variant_id.toString();
    const status = attributes.status;
    const renewsAt = attributes.renews_at;
    
    // Determine plan type based on variant ID
    // You should configure these IDs in your environment variables
    const premiumVariantIds = (process.env.PREMIUM_VARIANT_IDS || '').split(',');
    const planType = premiumVariantIds.includes(variantId) ? 'premium' : 'free';
    
    // Create or update the subscription
    await SubscriptionRepository.upsertSubscription({
      userId,
      subscriptionId,
      planType,
      status,
      variantId: variantId.toString(),
      renewsAt: renewsAt || undefined
    });
    
    console.log(`Subscription created for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription_created:', error);
    throw error;
  }
}

// Handle subscription updated event
async function handleSubscriptionUpdated(event: LemonSqueezyEvent, userId: string) {
  try {
    const attributes = event.data.attributes;
    const subscriptionId = event.data.id;
    const status = attributes.status;
    const renewsAt = attributes.renews_at;
    
    // Update the subscription status
    await SubscriptionRepository.updateSubscription({
      userId,
      subscriptionId,
      status,
      renewsAt: renewsAt || undefined
    });
    
    console.log(`Subscription updated for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription_updated:', error);
    throw error;
  }
}

// Handle subscription cancelled event
async function handleSubscriptionCancelled(event: LemonSqueezyEvent, userId: string) {
  try {
    const subscriptionId = event.data.id;
    
    // Update the subscription status to cancelled
    await SubscriptionRepository.updateSubscription({
      userId,
      subscriptionId,
      status: 'cancelled'
    });
    
    console.log(`Subscription cancelled for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription_cancelled:', error);
    throw error;
  }
}

// Handle subscription resumed event
async function handleSubscriptionResumed(event: LemonSqueezyEvent, userId: string) {
  try {
    const attributes = event.data.attributes;
    const subscriptionId = event.data.id;
    const renewsAt = attributes.renews_at;
    
    // Update the subscription status to active
    await SubscriptionRepository.updateSubscription({
      userId,
      subscriptionId,
      status: 'active',
      renewsAt: renewsAt || undefined
    });
    
    console.log(`Subscription resumed for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription_resumed:', error);
    throw error;
  }
}

// Handle subscription expired event
async function handleSubscriptionExpired(event: LemonSqueezyEvent, userId: string) {
  try {
    const subscriptionId = event.data.id;
    
    // Update the subscription status to expired
    await SubscriptionRepository.updateSubscription({
      userId,
      subscriptionId,
      status: 'expired'
    });
    
    console.log(`Subscription expired for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription_expired:', error);
    throw error;
  }
}

// Handle subscription paused event
async function handleSubscriptionPaused(event: LemonSqueezyEvent, userId: string) {
  try {
    const subscriptionId = event.data.id;
    
    // Update the subscription status to paused
    await SubscriptionRepository.updateSubscription({
      userId,
      subscriptionId,
      status: 'paused'
    });
    
    console.log(`Subscription paused for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription_paused:', error);
    throw error;
  }
}

// Handle subscription unpaused event
async function handleSubscriptionUnpaused(event: LemonSqueezyEvent, userId: string) {
  try {
    const attributes = event.data.attributes;
    const subscriptionId = event.data.id;
    const renewsAt = attributes.renews_at;
    
    // Update the subscription status to active
    await SubscriptionRepository.updateSubscription({
      userId,
      subscriptionId,
      status: 'active',
      renewsAt: renewsAt || undefined
    });
    
    console.log(`Subscription unpaused for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription_unpaused:', error);
    throw error;
  }
}

// Handle order refunded event
async function handleOrderRefunded(event: LemonSqueezyEvent, userId: string) {
  try {
    const subscriptionId = event.data.id;
    
    // Get the current subscription
    const subscription = await SubscriptionRepository.getByUserId(userId);
    
    // If this refund is for the current subscription, downgrade to free
    if (subscription && subscription.subscriptionId === subscriptionId) {
      await SubscriptionRepository.updateSubscription({
        userId,
        status: 'refunded',
        planType: 'free'
      });
      
      console.log(`Subscription refunded for user ${userId}`);
    }
  } catch (error) {
    console.error('Error handling order_refunded:', error);
    throw error;
  }
}