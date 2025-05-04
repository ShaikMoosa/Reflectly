import crypto from 'crypto';

// Types
export interface LemonSqueezySubscription {
  id: string;
  status: 'active' | 'cancelled' | 'expired' | 'paused' | 'past_due' | 'pending';
  user_id: string;
  plan_id: string;
  renews_at?: string;
  ends_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get a subscription from Lemon Squeezy API
 */
export async function getSubscription(subscriptionId: string): Promise<LemonSqueezySubscription | null> {
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  
  if (!apiKey) {
    console.error('Lemon Squeezy API key is not configured');
    return null;
  }
  
  try {
    const response = await fetch(`https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`, {
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch subscription: ${response.statusText}`);
    }
    
    const data = await response.json();
    return mapSubscriptionData(data.data);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
}

/**
 * Verify the signature of a webhook request
 */
export function verifyWebhookSignature(
  signature: string,
  rawBody: string | object
): boolean {
  const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('Lemon Squeezy webhook secret is not configured');
    return false;
  }
  
  // Convert body to string if it's an object
  const bodyString = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody);
  
  // Calculate HMAC signature
  const hmac = crypto.createHmac('sha256', webhookSecret);
  const calculatedSignature = hmac.update(bodyString).digest('hex');
  
  // Compare signatures
  return crypto.timingSafeEqual(
    Buffer.from(calculatedSignature), 
    Buffer.from(signature)
  );
}

/**
 * Map subscription data from API response to our interface
 */
function mapSubscriptionData(data: any): LemonSqueezySubscription {
  return {
    id: data.id,
    status: data.attributes.status,
    user_id: data.attributes.user_id,
    plan_id: data.attributes.variant_id,
    renews_at: data.attributes.renews_at,
    ends_at: data.attributes.ends_at,
    created_at: data.attributes.created_at,
    updated_at: data.attributes.updated_at
  };
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  
  if (!apiKey) {
    console.error('Lemon Squeezy API key is not configured');
    return false;
  }
  
  try {
    const response = await fetch(`https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        data: {
          type: 'subscriptions',
          id: subscriptionId,
          attributes: {
            cancelled: true
          }
        }
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return false;
  }
}

/**
 * Pause a subscription
 */
export async function pauseSubscription(subscriptionId: string): Promise<boolean> {
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  
  if (!apiKey) {
    console.error('Lemon Squeezy API key is not configured');
    return false;
  }
  
  try {
    const response = await fetch(`https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}/pause`, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error pausing subscription:', error);
    return false;
  }
}

/**
 * Resume a paused subscription
 */
export async function resumeSubscription(subscriptionId: string): Promise<boolean> {
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  
  if (!apiKey) {
    console.error('Lemon Squeezy API key is not configured');
    return false;
  }
  
  try {
    const response = await fetch(`https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}/resume`, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error resuming subscription:', error);
    return false;
  }
} 