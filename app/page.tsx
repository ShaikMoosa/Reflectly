'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileVideo } from 'lucide-react';

export default function Home() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [transcripts, setTranscripts] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'video/mp4') {
      setVideoFile(file);
      setVideoTitle(file.name.replace('.mp4', ''));
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  };

  const handleTranscribe = () => {
    // Use mock transcripts since we're just demonstrating the UI
    const mockTranscript = [
      { text: "Hi, how are you today?", start: 0, speaker: "Speaker 1" },
      { text: "I'm doing well, thank you for asking.", start: 2, speaker: "Speaker 2" },
      { text: "Can you tell me about your day?", start: 5, speaker: "Speaker 1" },
      { text: "I went to school and played with my friends.", start: 8, speaker: "Speaker 2" }
    ];
    setTranscripts(mockTranscript);
  };

  const handleTranscriptClick = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      videoRef.current.play().catch(err => console.error("Playback error:", err));
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-8">Video Transcription App</h1>
        
        {!videoUrl ? (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload MP4 Video
              </label>
              <input
                type="file"
                accept="video/mp4"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-6 mb-4">
              <h2 className="text-lg font-medium mb-4">{videoTitle}</h2>
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="w-full rounded mb-4"
              />
              
              {transcripts.length === 0 && (
                <button
                  onClick={handleTranscribe}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Generate Transcript
                </button>
              )}
            </div>
            
            {transcripts.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-blue-600 mb-4">Transcript</h2>
                <div className="space-y-4">
                  {transcripts.map((transcript, index) => (
                    <div key={index} className="border-b pb-3">
                      <div className="flex items-center mb-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 text-white ${transcript.speaker.includes('1') ? 'bg-blue-600' : 'bg-blue-400'}`}>
                          {transcript.speaker.charAt(transcript.speaker.length - 1)}
                        </div>
                        <span className="font-medium">{transcript.speaker}</span>
                        <button
                          onClick={() => handleTranscriptClick(transcript.start)}
                          className="ml-auto text-blue-600 hover:text-blue-700"
                        >
                          {Math.floor(transcript.start / 60)}:{(transcript.start % 60).toString().padStart(2, '0')}
                        </button>
                      </div>
                      <p className="ml-10 text-gray-700">{transcript.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
} 