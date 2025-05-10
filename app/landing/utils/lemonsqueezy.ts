// Lemon Squeezy store information
export const LEMON_SQUEEZY_STORE_ID = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID || '';

// Plan variant IDs
export const PREMIUM_PLAN_VARIANT_ID = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PREMIUM_VARIANT_ID || '';

// Redirect URLs
export const SUCCESS_URL = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_SUCCESS_URL || '';
export const CANCEL_URL = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_CANCEL_URL || '';

/**
 * Generates a checkout URL for Lemon Squeezy
 * @param variantId The variant ID of the product to purchase
 * @param email Optional email to prefill the checkout form
 * @returns The checkout URL
 */
export function generateCheckoutUrl(variantId: string, email?: string): string {
  // Base checkout URL
  const baseUrl = `https://reflectly.lemonsqueezy.com/checkout/buy/${variantId}`;
  
  // Parameters
  const params = new URLSearchParams();
  
  // Add success and cancel URLs
  if (SUCCESS_URL) params.append('checkout[success_url]', SUCCESS_URL);
  if (CANCEL_URL) params.append('checkout[cancel_url]', CANCEL_URL);
  
  // Add email if provided
  if (email) params.append('checkout[email]', email);
  
  // Return the URL with parameters
  const paramsString = params.toString();
  return paramsString ? `${baseUrl}?${paramsString}` : baseUrl;
}

/**
 * Types for Lemon Squeezy webhook events
 */
export type LemonSqueezyWebhookEvent = {
  meta: {
    event_name: string;
    custom_data?: any;
  };
  data: {
    id: string;
    type: string;
    attributes: {
      status: string;
      order_id: string;
      customer_id: string;
      variant_id: string;
      product_id: string;
      store_id: string;
      status_formatted: string;
      user_email: string;
      user_name: string;
      [key: string]: any;
    };
  };
};

/**
 * Verifies the webhook signature from Lemon Squeezy
 * @param signature The signature from the X-Signature header
 * @param body The raw request body
 * @returns Whether the signature is valid
 */
export function verifyWebhookSignature(signature: string, body: string): boolean {
  // In a real implementation, you would verify the signature
  // using a library like crypto
  return true; // Placeholder for now
} 