import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// Get a specific transcript by ID - accessible without authentication
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get the transcript
    const { data, error } = await supabase
      .from('video_transcripts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Transcript not found' }, { status: 404 });
      }
      console.error('Error fetching transcript:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ transcript: data });
  } catch (error: any) {
    console.error('Error in public transcript GET:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 