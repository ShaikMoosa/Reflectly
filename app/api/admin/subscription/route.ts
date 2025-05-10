import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { SubscriptionAdminRepository } from '@/app/utils/repositories/subscription-admin-repository';

// Ensure this route is always served dynamically
export const dynamic = 'force-dynamic';

/**
 * Admin API for subscription management
 * This endpoint allows admin users to view subscription data and analytics
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is an admin
    const isAdmin = await SubscriptionAdminRepository.isAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'stats';
    const days = parseInt(searchParams.get('days') || '30', 10);
    
    switch (action) {
      case 'stats':
        const metrics = await SubscriptionAdminRepository.getSubscriptionMetrics();
        return NextResponse.json(metrics);
      
      case 'export':
        const data = await SubscriptionAdminRepository.exportSubscriptionData(days);
        return NextResponse.json(data);
      
      case 'reset_usage':
        const success = await SubscriptionAdminRepository.resetMonthlyUsage();
        return NextResponse.json({ 
          success, 
          message: success ? 'Monthly usage reset successfully' : 'Failed to reset monthly usage' 
        });
      
      case 'cancellation_reasons':
        const reasons = await SubscriptionAdminRepository.getCancellationReasons();
        return NextResponse.json(reasons);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in admin subscription API:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

/**
 * Admin API for subscription management - POST actions
 * This endpoint allows admin users to perform subscription-related actions
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is an admin
    const isAdmin = await SubscriptionAdminRepository.isAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { action, targetUserId, data } = body;
    
    if (!action || !targetUserId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    switch (action) {
      case 'update_subscription':
        if (!data) {
          return NextResponse.json({ error: 'Missing subscription data' }, { status: 400 });
        }
        const updateSuccess = await SubscriptionAdminRepository.updateSubscription(targetUserId, {
          status: data.status,
          planType: data.planType,
          renewsAt: data.renewsAt
        });
        return NextResponse.json({ 
          success: updateSuccess,
          message: updateSuccess ? 'Subscription updated successfully' : 'Failed to update subscription'
        });
      
      case 'reset_user_usage':
        const resetSuccess = await SubscriptionAdminRepository.resetUserUsage(targetUserId);
        return NextResponse.json({ 
          success: resetSuccess,
          message: resetSuccess ? 'User usage reset successfully' : 'Failed to reset user usage'
        });
      
      case 'add_admin':
        const addSuccess = await SubscriptionAdminRepository.addAdmin(userId, targetUserId);
        return NextResponse.json({ 
          success: addSuccess,
          message: addSuccess ? 'Admin user added successfully' : 'Failed to add admin user'
        });
        
      case 'remove_admin':
        const removeSuccess = await SubscriptionAdminRepository.removeAdmin(userId, targetUserId);
        return NextResponse.json({ 
          success: removeSuccess,
          message: removeSuccess ? 'Admin user removed successfully' : 'Failed to remove admin user'
        });
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in admin subscription API:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 