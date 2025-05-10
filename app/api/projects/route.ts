import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { Project, ProjectCreateInput } from '@/app/models/project';
import { cookies } from 'next/headers';

// Get all projects for the authenticated user
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

    // Get all projects for the user
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ projects: data });
  } catch (error: any) {
    console.error('Error in projects GET:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Create a new project
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

    // Get the project data from the request
    const projectData: ProjectCreateInput = await request.json();
    
    // Create DB-compatible object with snake_case keys
    const dbProjectData = {
      name: projectData.name,
      description: projectData.description,
      user_id: user.id
    };

    // Create the project
    const { data, error } = await supabase
      .from('projects')
      .insert(dbProjectData)
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project: data }, { status: 201 });
  } catch (error: any) {
    console.error('Error in projects POST:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 