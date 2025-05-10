import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/utils/supabase';
import { v4 as uuidv4 } from 'uuid';
import { incrementTranscriptionCount } from '@/app/utils/subscriptions';

// Explicitly make this route dynamic
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    console.log('Transcription API called');
    
    // Extract the form data
    let formData;
    try {
      formData = await request.formData();
      console.log('Form data received');
    } catch (error) {
      console.error('Error parsing form data:', error);
      return NextResponse.json(
        { error: 'Failed to parse form data' },
        { status: 400 }
      );
    }
    
    // Get the video file and project ID from the form data
    const file = formData.get('file');
    const projectId = formData.get('projectId');
    
    if (!file || !(file instanceof File)) {
      console.error('No file or invalid file in form data');
      return NextResponse.json(
        { error: 'No file uploaded or invalid file' },
        { status: 400 }
      );
    }
    
    console.log(`File received: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
    
    // Initialize OpenAI client with API key from .env
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    if (!openai.apiKey) {
      console.error('OpenAI API key is missing');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }
    
    console.log('Creating transcription with OpenAI Whisper API...');
    
    // Convert the file to a Buffer and then to a Blob with the correct type
    const fileArrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileArrayBuffer);
    
    // Create a transcription using the OpenAI API
    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: new File([fileBuffer], file.name, { type: file.type }),
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
    });
    
    console.log('Transcription received from OpenAI');
    
    // Transform the OpenAI response to our expected format
    const transformedTranscripts = transcriptionResponse.segments?.map((segment, index) => {
      return {
        start: segment.start,
        end: segment.end,
        text: segment.text,
        speaker: `Speaker ${(index % 2) + 1}` // Alternate between Speaker 1 and Speaker 2
      };
    }) || [];
    
    console.log(`Transformed ${transformedTranscripts.length} transcript segments`);
    
    // Store the transcript in Supabase if a project ID was provided
    let storedTranscriptId;
    let userId = null;
    
    if (projectId) {
      try {
        // Get user from auth header if available (optional)
        const authHeader = request.headers.get('authorization');
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.replace('Bearer ', '');
          const { data: { user } } = await supabase.auth.getUser(token);
          if (user) {
            userId = user.id;
          }
        }
        
        // Verify the project exists (if user is authenticated, verify ownership)
        if (userId) {
          const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .select('id')
            .eq('id', projectId)
            .eq('user_id', userId)
            .single();
            
          if (projectError) {
            console.error('Project not found or not owned by user:', projectError);
            // Continue with transcription but don't store in DB
          }
        }
        
        // Store the transcript
        const transcriptId = uuidv4();
        const { data, error } = await supabase
          .from('video_transcripts')
          .insert({
            id: transcriptId,
            project_id: projectId,
            filename: file.name,
            content: transformedTranscripts,
            duration: transcriptionResponse.duration
          })
          .select()
          .single();
          
        if (error) {
          console.error('Error storing transcript:', error);
        } else {
          console.log('Transcript stored in Supabase with ID:', data.id);
          storedTranscriptId = data.id;
          
          // Increment transcription count for the user
          if (userId) {
            const success = await incrementTranscriptionCount(userId);
            console.log(`Transcription count incremented for user ${userId}: ${success ? 'success' : 'failed or limit reached'}`);
          }
        }
      } catch (error) {
        console.error('Error storing transcript in Supabase:', error);
        // Continue with returning the transcript even if storage failed
      }
    }
    
    return NextResponse.json({ 
      transcripts: transformedTranscripts,
      id: storedTranscriptId,
      message: 'Transcript generated successfully'
    });
  } catch (error: any) {
    console.error('Error generating transcript:', error);
    return NextResponse.json(
      { error: `Failed to generate transcript: ${error.message}` },
      { status: 500 }
    );
  }
} 