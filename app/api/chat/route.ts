import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const { messages, transcript } = await req.json();

    // Create a system message that includes the transcript context
    const systemMessage = {
      role: 'system',
      content: `You are an AI assistant helping with a video transcript. Here's the transcript content:
      ${transcript}

      Please use this transcript to answer questions about the video content. If the question is not related to the transcript, politely inform the user that you can only answer questions about the video content.`
    };

    // Combine system message with user messages
    const allMessages = [systemMessage, ...messages];

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      stream: true,
      messages: allMessages,
      temperature: 0.7,
      max_tokens: 500
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error: any) {
    console.error('Error in chat API:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process chat request' }),
      { status: 500 }
    );
  }
} 