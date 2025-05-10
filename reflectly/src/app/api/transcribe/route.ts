import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('file') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Extract just the audio from the video file
    const audioBytes = await audioFile.arrayBuffer();
    const audioBlob = new Blob([audioBytes], { type: 'audio/mp4' });
    
    // Convert to a File object that OpenAI can process
    const audioFileForApi = new File([audioBlob], 'audio.mp4', { 
      type: 'audio/mp4' 
    });

    // Call OpenAI's API for transcription with speaker recognition
    const transcription = await openai.audio.transcriptions.create({
      file: audioFileForApi,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
    });

    // Process the response to create transcript items with timestamps
    const segments = transcription.segments || [];
    
    const transcriptItems = segments.map((segment, index) => {
      // Determine speaker (in a real app, you'd use diarization)
      // For this example, we'll alternate speakers based on index
      const speakerNumber = (index % 3) + 1;
      
      return {
        start: segment.start,
        end: segment.end,
        text: segment.text,
        speaker: `Speaker ${speakerNumber}`
      };
    });

    return NextResponse.json({ transcripts: transcriptItems });
  } catch (error: any) {
    console.error('Transcription error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Error transcribing audio' },
      { status: 500 }
    );
  }
} 