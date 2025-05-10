import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Explicitly make this route dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user (optional for test route)
    const { userId } = await auth();
    
    // Return response
    return NextResponse.json({ 
      message: 'Test API route is working!',
      authenticated: !!userId,
      userId: userId || 'not authenticated'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 401 }
    );
  }
} 