import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { AIChatHistoryCreateInput } from '@/app/models/chat';

// Get all chat histories for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user from the request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Authenticate with Supabase using the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get project ID filter from query params if it exists
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    // Build the query
    let query = supabase
      .from('ai_chat_history')
      .select('*')
      .eq('user_id', user.id);
      
    // Add project filter if provided
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    // Execute the query
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching chat histories:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ chatHistories: data });
  } catch (error: any) {
    console.error('Error in chat histories GET:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Create a new chat history
export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user from the request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Authenticate with Supabase using the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the chat history data from the request
    const chatHistoryData: AIChatHistoryCreateInput = await request.json();
    
    // Set the user_id to the authenticated user
    chatHistoryData.user_id = user.id;
    
    // Verify the project exists and is owned by the user
    if (chatHistoryData.project_id) {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', chatHistoryData.project_id)
        .eq('user_id', user.id)
        .single();
        
      if (projectError) {
        return NextResponse.json({ error: 'Project not found or not owned by user' }, { status: 404 });
      }
    }

    // Create the chat history
    const { data, error } = await supabase
      .from('ai_chat_history')
      .insert(chatHistoryData)
      .select()
      .single();

    if (error) {
      console.error('Error creating chat history:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ chatHistory: data }, { status: 201 });
  } catch (error: any) {
    console.error('Error in chat history POST:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 