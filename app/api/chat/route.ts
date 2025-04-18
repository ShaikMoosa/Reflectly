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
- Format your responses in a clear, organized way using bullets or numbers when appropriate

Response Formatting Requirements:
1. Always use proper Markdown formatting for structure and readability
2. For summaries, use clear headings (## Main Points: or ## Summary:)
3. Use bullet points (- ) for lists of features, steps, or key points
4. Include bold text (**important terms**) for emphasis on key concepts
5. Add timestamps in parentheses when referencing specific points in the video
6. Use short paragraphs with adequate spacing between sections
7. For technical content, use code blocks where appropriate
8. When listing sequential steps, use numbered lists (1., 2., 3.)
9. Put important quotes or statements in blockquotes (> text)
10. Keep your overall structure consistent throughout the response`
    };

    // Create the API request with system message, chat history, and user's new message
    try {
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
      const aiResponse = chatCompletion.choices[0]?.message?.content || '';
      console.log('AI response received successfully:', aiResponse.substring(0, 50) + '...');
      
      return NextResponse.json({ 
        response: aiResponse,
        message: 'Response generated successfully'
      });
    } catch (modelError) {
      console.error('Error with GPT-4-turbo model, trying fallback model:', modelError);
      
      // Try with a fallback model
      try {
        const fallbackCompletion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            systemMessage,
            ...formattedChatHistory,
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        });
        
        const fallbackResponse = fallbackCompletion.choices[0]?.message?.content || '';
        console.log('Fallback model response:', fallbackResponse.substring(0, 50) + '...');
        
        return NextResponse.json({ 
          response: fallbackResponse,
          message: 'Response generated with fallback model'
        });
      } catch (fallbackError) {
        throw fallbackError; // Re-throw to be caught by the outer catch block
      }
    }
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    
    // Log more detailed error information
    if (error.response) {
      console.error('OpenAI API error details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    
    // Check if it's an OpenAI API key issue
    if (error.message && error.message.includes('API key')) {
      console.error('API key error detected:', error.message);
      return NextResponse.json(
        { error: 'Invalid API key. Please check your OpenAI API key configuration.' },
        { status: 401 }
      );
    }
    
    // Check if it's a rate limit issue
    if (error.message && error.message.includes('rate limit')) {
      console.error('Rate limit exceeded:', error.message);
      return NextResponse.json(
        { error: 'OpenAI API rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

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