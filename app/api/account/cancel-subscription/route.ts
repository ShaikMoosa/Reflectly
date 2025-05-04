import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { cancelUserSubscription } from '@/app/utils/subscriptions';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
    }
    
    // Display confirmation page
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cancel Subscription</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              padding: 24px;
              margin-top: 32px;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 16px;
            }
            p {
              margin-bottom: 24px;
            }
            .button-group {
              display: flex;
              gap: 12px;
            }
            .button {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 4px;
              font-size: 14px;
              font-weight: 500;
              text-decoration: none;
              cursor: pointer;
              transition: background-color 0.2s;
            }
            .primary {
              background-color: #f44336;
              color: white;
              border: none;
            }
            .primary:hover {
              background-color: #d32f2f;
            }
            .secondary {
              background-color: transparent;
              color: #333;
              border: 1px solid #ddd;
            }
            .secondary:hover {
              background-color: #f5f5f5;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Cancel Your Subscription</h1>
            <p>Are you sure you want to cancel your Reflectly Premium subscription? You'll lose access to:</p>
            <ul>
              <li>50 video transcriptions</li>
              <li>1000 AI chat sessions</li>
              <li>Advanced note-taking</li>
              <li>High quality video</li>
              <li>Priority support</li>
              <li>Advanced analytics</li>
              <li>Custom organization</li>
            </ul>
            <p>Your subscription will remain active until the end of your current billing period.</p>
            <div class="button-group">
              <a href="/api/account/cancel-subscription?confirm=true" class="button primary">Yes, Cancel Subscription</a>
              <a href="/account" class="button secondary">No, Keep My Subscription</a>
            </div>
          </div>
        </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  } catch (error) {
    console.error('Error in cancel subscription page:', error);
    return NextResponse.redirect(new URL('/account', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const success = await cancelUserSubscription(userId);
    
    if (success) {
      return NextResponse.redirect(new URL('/account?canceled=true', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
    } else {
      return NextResponse.redirect(new URL('/account?error=cancel_failed', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
    }
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 