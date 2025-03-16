import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const audioBytes = await file.arrayBuffer();
    const buffer = Buffer.from(audioBytes);

    const response = await openai.audio.transcriptions.create({
      file: new File([buffer], file.name, { type: file.type }),
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Error processing transcription' },
      { status: 500 }
    );
  }
} 