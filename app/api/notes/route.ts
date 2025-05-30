import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { CreateNoteParams, Note } from '@/app/models/note';

// Get all notes for the authenticated user
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
      .from('user_notes')
      .select('*')
      .eq('user_id', user.id);
      
    // Add project filter if provided
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    // Execute the query
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ notes: data });
  } catch (error: any) {
    console.error('Error in notes GET:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Create a new note
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

    // Get the note data from the request
    const noteData: CreateNoteParams = await request.json();
    
    // Create DB-compatible object
    const dbNoteData = {
      user_id: user.id,
      project_id: noteData.projectId,
      title: noteData.title,
      content: noteData.content,
      tags: noteData.tags || []
    };
    
    // Verify the project exists and is owned by the user
    if (noteData.projectId) {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', noteData.projectId)
        .eq('user_id', user.id)
        .single();
        
      if (projectError) {
        return NextResponse.json({ error: 'Project not found or not owned by user' }, { status: 404 });
      }
    }

    // Create the note
    const { data, error } = await supabase
      .from('user_notes')
      .insert(dbNoteData)
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ note: data }, { status: 201 });
  } catch (error: any) {
    console.error('Error in notes POST:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 