import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { UpdateChatHistoryParams } from '@/app/models/chat';

// Get a specific chat history by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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

    // Get the chat history
    const { data, error } = await supabase
      .from('ai_chat_history')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Chat history not found' }, { status: 404 });
      }
      console.error('Error fetching chat history:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ chatHistory: data });
  } catch (error: any) {
    console.error('Error in chat history GET:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update a chat history by appending a message
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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

    // Get the chat history update data from the request
    const updateData: UpdateChatHistoryParams = await request.json();

    // Create DB-compatible update object (convert camelCase to snake_case)
    const dbUpdateData = {
      title: updateData.title,
      messages: updateData.messages
    };

    // Ensure the user only updates their own chat history
    const { data: existingChat, error: fetchError } = await supabase
      .from('ai_chat_history')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Chat history not found' }, { status: 404 });
      }
      console.error('Error fetching chat history:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Update the chat history
    const { data, error } = await supabase
      .from('ai_chat_history')
      .update(dbUpdateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating chat history:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ chatHistory: data });
  } catch (error: any) {
    console.error('Error in chat history PATCH:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete a chat history
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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

    // Ensure the user only deletes their own chat history
    const { data: existingChat, error: fetchError } = await supabase
      .from('ai_chat_history')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Chat history not found' }, { status: 404 });
      }
      console.error('Error fetching chat history:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Delete the chat history
    const { error } = await supabase
      .from('ai_chat_history')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting chat history:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in chat history DELETE:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 