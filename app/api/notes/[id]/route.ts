import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { UserNoteUpdateInput } from '@/app/models/note';

// Get a specific note by ID
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

    // Get the note
    const { data, error } = await supabase
      .from('user_notes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 });
      }
      console.error('Error fetching note:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ note: data });
  } catch (error: any) {
    console.error('Error in note GET:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update a note
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

    // Get the note update data from the request
    const updateData: UserNoteUpdateInput = await request.json();

    // Ensure the user only updates their own note
    const { data: existingNote, error: fetchError } = await supabase
      .from('user_notes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 });
      }
      console.error('Error fetching note:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Update the note
    const { data, error } = await supabase
      .from('user_notes')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating note:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ note: data });
  } catch (error: any) {
    console.error('Error in note PATCH:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete a note
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

    // Ensure the user only deletes their own note
    const { data: existingNote, error: fetchError } = await supabase
      .from('user_notes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 });
      }
      console.error('Error fetching note:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Delete the note
    const { error } = await supabase
      .from('user_notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting note:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in note DELETE:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 