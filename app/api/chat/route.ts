import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// For debugging - log the API key existence but not the key itself
console.log('OpenAI API key exists:', !!process.env.OPENAI_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { message, transcript, currentTime, chatHistory } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'No message provided' },
        { status: 400 }
      );
    }

    if (!openai.apiKey) {
      console.error('OpenAI API key is missing');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // Format transcript data for context
    let transcriptContext = '';
    if (transcript && Array.isArray(transcript) && transcript.length > 0) {
      transcriptContext = "Video Transcript:\n";
      
      transcript.forEach((segment) => {
        const timestamp = formatTimestamp(segment.start_time);
        const isCurrentSegment = currentTime && 
          currentTime >= segment.start_time && 
          currentTime < segment.end_time;
        
        transcriptContext += `[${timestamp}]${isCurrentSegment ? ' (CURRENT POSITION)' : ''}: ${segment.text}\n`;
      });
    }

    // Format chat history for context
    const formattedChatHistory = chatHistory.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    // Prepare the system message with instructions and context
    const systemMessage = {
      role: "system",
      content: `You are an intelligent AI assistant helping a user analyze video content.
      
Your task is to provide thoughtful insights, summaries, and answers based on the video transcript provided.

${transcriptContext ? `Here is the transcript of the video:\n${transcriptContext}` : "No transcript is available yet."}

Current playback position: ${currentTime ? formatTimestamp(currentTime) : "unknown"}

Guidelines:
- Be concise and focus on providing valuable insights from the video content
- When referring to specific parts of the video, include the timestamp
- If asked to summarize, identify key points and main ideas
- If asked to highlight or tag content, identify important segments
- If the user asks about content at a specific timestamp, focus your response on that part
- If asked about something not in the transcript, acknowledge that limitation politely
- Format your responses in a clear, organized way using bullets or numbers when appropriate`
    };

    // Create the API request with system message, chat history, and user's new message
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        systemMessage,
        ...formattedChatHistory,
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Extract the AI's response
    const aiResponse = chatCompletion.choices[0].message.content;

    return NextResponse.json({ 
      response: aiResponse,
      message: 'Response generated successfully'
    });
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    return NextResponse.json(
      { error: `Failed to generate response: ${error.message}` },
      { status: 500 }
    );
  }
}

// Helper function to format timestamps
function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
} 