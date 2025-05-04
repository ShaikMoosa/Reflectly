const crypto = require('crypto');
const fetch = require('node-fetch');
require('dotenv').config();

// Configuration
const WEBHOOK_SECRET = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET; // Get from environment variables
const WEBHOOK_URL = 'http://localhost:3000/api/lemonsqueezy-webhook';
const USER_ID = 'test_user_id'; // Replace with an actual user ID from your system

// Check if webhook secret is configured
if (!WEBHOOK_SECRET) {
  console.error('Error: LEMON_SQUEEZY_WEBHOOK_SECRET environment variable is not set.');
  console.error('Please set this variable in your .env file or environment before running the test.');
  process.exit(1);
}

/**
 * Calculate the HMAC signature for the webhook payload
 */
function calculateSignature(payload, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  return hmac.update(typeof payload === 'string' ? payload : JSON.stringify(payload)).digest('hex');
}

/**
 * Send a test webhook event
 */
async function sendWebhookEvent(eventType, payload) {
  const payloadString = JSON.stringify(payload);
  const signature = calculateSignature(payloadString, WEBHOOK_SECRET);
  
  try {
    console.log(`Sending ${eventType} webhook event...`);
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': signature
      },
      body: payloadString
    });
    
    const responseData = await response.json();
    console.log(`Response (${response.status}):`, responseData);
    return response.status === 200;
  } catch (error) {
    console.error('Error sending webhook:', error);
    return false;
  }
}

/**
 * Generate a test order_created event
 */
function generateOrderCreatedEvent() {
  return {
    event: 'order_created',
    data: {
      order: {
        id: `order_${Date.now()}`,
        custom_data: {
          user_id: USER_ID
        },
        created_at: new Date().toISOString()
      }
    }
  };
}

/**
 * Generate a test subscription_created event
 */
function generateSubscriptionCreatedEvent() {
  const today = new Date();
  const renewalDate = new Date();
  renewalDate.setMonth(today.getMonth() + 1); // Renews in 1 month
  
  return {
    event: 'subscription_created',
    data: {
      subscription: {
        id: `sub_${Date.now()}`,
        status: 'active',
        renews_at: renewalDate.toISOString(),
        custom_data: {
          user_id: USER_ID
        },
        created_at: new Date().toISOString()
      }
    }
  };
}

/**
 * Generate a test subscription_updated event
 */
function generateSubscriptionUpdatedEvent(subscriptionId) {
  const today = new Date();
  const renewalDate = new Date();
  renewalDate.setMonth(today.getMonth() + 1); // Renews in 1 month
  
  return {
    event: 'subscription_updated',
    data: {
      subscription: {
        id: subscriptionId || `sub_${Date.now()}`,
        status: 'active',
        renews_at: renewalDate.toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  };
}

/**
 * Generate a test subscription_cancelled event
 */
function generateSubscriptionCancelledEvent(subscriptionId) {
  return {
    event: 'subscription_cancelled',
    data: {
      subscription: {
        id: subscriptionId || `sub_${Date.now()}`,
        status: 'cancelled',
        updated_at: new Date().toISOString()
      }
    }
  };
}

/**
 * Run the test sequence
 */
async function runTests() {
  console.log('Testing Lemon Squeezy webhook handler...');
  console.log('Make sure your server is running on http://localhost:3000');
  console.log('---------------------------------------------------');
  
  // Test order_created event
  const orderEvent = generateOrderCreatedEvent();
  await sendWebhookEvent('order_created', orderEvent);
  
  // Test subscription_created event
  const subscriptionEvent = generateSubscriptionCreatedEvent();
  const subscriptionId = subscriptionEvent.data.subscription.id;
  await sendWebhookEvent('subscription_created', subscriptionEvent);
  
  // Test subscription_updated event
  const updateEvent = generateSubscriptionUpdatedEvent(subscriptionId);
  await sendWebhookEvent('subscription_updated', updateEvent);
  
  // Test subscription_cancelled event
  const cancelEvent = generateSubscriptionCancelledEvent(subscriptionId);
  await sendWebhookEvent('subscription_cancelled', cancelEvent);
  
  console.log('---------------------------------------------------');
  console.log('Tests completed! Check your server logs for details.');
}

// Run the tests
runTests(); 