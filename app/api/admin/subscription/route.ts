import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/app/utils/supabase/server';
import { 
  getSubscription, 
  cancelSubscription, 
  pauseSubscription,
  resumeSubscription
} from '@/app/utils/lemonsqueezy';

/**
 * Admin endpoint for managing user subscriptions
 * Requires admin role to access
 */
export async function GET(req: NextRequest) {
  try {
    // Get the current user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if the user is an admin
    const supabase = createClient();
    const { data: adminData } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();
      
    if (!adminData) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Get all subscriptions
    const { data: subscriptions } = await supabase
      .from('user_subscriptions')
      .select('*');
      
    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('Error in admin subscription endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get the current user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if the user is an admin
    const supabase = createClient();
    const { data: adminData } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();
      
    if (!adminData) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Parse the request body
    const body = await req.json();
    const { action, subscriptionId, targetUserId } = body;
    
    if (!action || !subscriptionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Perform the requested action
    let success = false;
    
    switch (action) {
      case 'cancel':
        success = await cancelSubscription(subscriptionId);
        break;
      case 'pause':
        success = await pauseSubscription(subscriptionId);
        break;
      case 'resume':
        success = await resumeSubscription(subscriptionId);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    if (success && targetUserId) {
      // Update our database
      let updateData = {};
      
      if (action === 'cancel') {
        updateData = { status: 'cancelled' };
      } else if (action === 'pause') {
        updateData = { status: 'paused' };
      } else if (action === 'resume') {
        updateData = { status: 'active' };
      }
      
      await supabase
        .from('user_subscriptions')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', targetUserId);
    }
    
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error in admin subscription endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 