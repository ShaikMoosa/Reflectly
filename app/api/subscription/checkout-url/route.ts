import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createCheckoutUrl } from '@/app/utils/lemonsqueezy';

// Ensure this route is always served dynamically
export const dynamic = 'force-dynamic';

/**
 * Generate a checkout URL for Lemon Squeezy
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Lemon Squeezy API credentials
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    const variantId = process.env.LEMONSQUEEZY_VARIANT_ID;

    if (!apiKey || !storeId || !variantId) {
      console.error('Missing Lemon Squeezy configuration');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Make request to Lemon Squeezy API to create checkout
    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            store_id: parseInt(storeId, 10),
            variant_id: parseInt(variantId, 10),
            custom_price: null,
            product_options: {
              redirect_url: `${request.nextUrl.origin}/account`,
              receipt_button_text: 'Back to Dashboard',
            },
            checkout_data: {
              custom: {
                userId: userId,
              },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      console.error('Lemon Squeezy API error:', await response.text());
      return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
    }

    const data = await response.json();
    const checkoutUrl = data?.data?.attributes?.url;

    if (!checkoutUrl) {
      return NextResponse.json({ error: 'Invalid response from payment provider' }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('Error creating checkout:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 