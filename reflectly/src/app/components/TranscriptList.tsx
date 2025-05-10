'use client';

import React, { useMemo } from 'react';
import { Play } from 'lucide-react';

/**
 * TranscriptItem interface - defines the structure for a transcript segment
 */
interface TranscriptItem {
  start: number;    // Start time in seconds
  end: number;      // End time in seconds
  text: string;     // Transcript text content
  speaker?: string; // Optional speaker identifier
}

/**
 * Props for the TranscriptList component
 */
interface TranscriptListProps {
  transcripts: TranscriptItem[];                  // Array of transcript items
  onTranscriptClick: (timestamp: number) => void; // Callback for when a transcript is clicked
  currentTime: number;                           // Current video playback time in seconds
}

/**
 * TranscriptList Component
 * 
 * Displays transcript items with speaker labels and timestamps.
 * Highlights the currently active transcript based on video playback time.
 * Provides clickable timestamps for navigating the video.
 */
const TranscriptList = ({ transcripts, onTranscriptClick, currentTime }: TranscriptListProps) => {
  /**
   * Format time in seconds to MM:SS format
   */
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  /**
   * Calculate the index of the active transcript based on current time
   */
  const activeTranscriptIndex = useMemo(() => {
    return transcripts.findIndex(
      (transcript) => currentTime >= transcript.start && currentTime <= transcript.end
    );
  }, [currentTime, transcripts]);

  if (transcripts.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-400 text-sm">No transcripts available</p>
      </div>
    );
  }

  return (
    <div className="space-y-[18px]">
      {transcripts.map((transcript, index) => {
        // Determine if this transcript is currently active
        const isActive = index === activeTranscriptIndex;
        // Extract speaker number for avatar
        const speakerNumber = transcript.speaker?.split(' ')[1] || '1';
        
        return (
          <div 
            key={index}
            onClick={() => onTranscriptClick(transcript.start)}
            className={`
              p-6 cursor-pointer transition-all duration-300 rounded-lg border border-gray-100 shadow-sm
              ${isActive ? 'bg-gray-50' : 'bg-white'}
              hover:bg-[#F1F1F1F1] hover:shadow-md hover:transform hover:scale-[1.01] hover:border-gray-200
            `}
          >
            <div className="flex items-start gap-4">
              {/* Speaker avatar */}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-sm font-medium">
                  S{speakerNumber}
                </div>
              </div>
              
              <div className="flex-1">
                {/* Speaker name */}
                <p className="text-black font-medium mb-1">
                  Speaker {speakerNumber}
                </p>
                
                {/* Transcript text */}
                <p className={`text-gray-700 text-base ${isActive ? 'font-medium' : ''}`}>
                  {transcript.text}
                </p>
              </div>
              
              {/* Timestamp with play button */}
              <div 
                className="transcript-play-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onTranscriptClick(transcript.start);
                }}
              >
                <Play className="h-4 w-4" fill="currentColor" strokeWidth={0} />
                <span className="text-sm">{formatTime(transcript.start)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TranscriptList; 