import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

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
    
    // Get the video file from the form data
    const file = formData.get('file');
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
    
    return NextResponse.json({ 
      transcripts: transformedTranscripts,
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