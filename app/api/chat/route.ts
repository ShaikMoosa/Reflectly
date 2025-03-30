import OpenAI from 'openai';

// For debugging - log the API key existence but not the key itself
console.log('OpenAI API key exists:', !!process.env.OPENAI_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const { messages, transcript } = await req.json();
    
    console.log('Received request with transcript length:', transcript?.length || 0);
    console.log('Number of messages:', messages?.length || 0);

    // Create a system message that includes the transcript context
    // Limit transcript size to avoid token limit issues
    const transcriptSummary = transcript && transcript.length > 8000 
      ? transcript.substring(0, 8000) + "... [truncated for token limit]" 
      : transcript || "No transcript provided";
    
    const systemMessage = {
      role: 'system',
      content: `You are an AI assistant helping with a video transcript. Here's the transcript content:
      ${transcriptSummary}

      Please use this transcript to answer questions about the video content. If the question is not related to the transcript, politely inform the user that you can only answer questions about the video content.`
    };

    // Combine system message with user messages
    const allMessages = [systemMessage, ...messages];
    
    console.log('Calling OpenAI with model: gpt-3.5-turbo');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Using 3.5 for better availability and cost
      messages: allMessages,  // Remove stream: true for simpler implementation
      temperature: 0.7,
      max_tokens: 500
    });

    console.log('OpenAI response received successfully');
    
    // Return the response directly instead of streaming
    return new Response(
      JSON.stringify({ 
        response: response.choices[0].message.content 
      }),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error: any) {
    console.error('Error in chat API:', error);
    // Log more detailed error information
    if (error.response) {
      console.error('OpenAI API response error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process chat request',
        details: error.stack
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 