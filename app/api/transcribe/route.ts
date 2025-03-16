import { NextRequest, NextResponse } from 'next/server';

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
    
    // For demo purposes, we'll just return some mock transcript data
    const mockTranscripts = [
      {
        start: 0,
        end: 5,
        text: "Here's a challenge for you.",
        speaker: "Speaker 1"
      },
      {
        start: 5,
        end: 10,
        text: "You have to create an animation like this using trim paths.",
        speaker: "Speaker 1"
      },
      {
        start: 10,
        end: 15,
        text: "You will find the starter file in the resources with this path.",
        speaker: "Speaker 1"
      },
      {
        start: 15,
        end: 20,
        text: "So go ahead and start animating the same.",
        speaker: "Speaker 1"
      },
      {
        start: 20,
        end: 25,
        text: "You can come back to this lesson for the solution.",
        speaker: "Speaker 1"
      },
      {
        start: 25,
        end: 30,
        text: "In the starter file, you will find a path like this, which has two strokes applied.",
        speaker: "Speaker 1"
      },
      {
        start: 30,
        end: 35,
        text: "That is the background and the foreground.",
        speaker: "Speaker 1"
      },
      {
        start: 35,
        end: 40,
        text: "We have to animate the white stroke, which has trim path enabled.",
        speaker: "Speaker 1"
      },
      {
        start: 40,
        end: 45,
        text: "And you can see the start is zero and the end is 1%.",
        speaker: "Speaker 1"
      },
      {
        start: 45,
        end: 50,
        text: "Now to achieve the animation shown in the video previously, we'll go ahead and animate the end like this.",
        speaker: "Speaker 1"
      }
    ];

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Returning mock transcript data');
    return NextResponse.json({ 
      transcripts: mockTranscripts,
      message: 'Transcript generated successfully'
    });
  } catch (error) {
    console.error('Error generating transcript:', error);
    return NextResponse.json(
      { error: 'Failed to generate transcript' },
      { status: 500 }
    );
  }
} 