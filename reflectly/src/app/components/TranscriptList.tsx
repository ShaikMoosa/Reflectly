'use client';

import React, { useMemo } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Play } from 'lucide-react';

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

  /**
   * Get the color for the speaker avatar
   */
  const getSpeakerColor = (speaker: string | undefined): string => {
    if (!speaker) return 'bg-slate-400';
    
    // Extract speaker number if available
    const speakerNumber = speaker.match(/\d+/);
    if (!speakerNumber) return 'bg-slate-400';
    
    // Rotate between colors based on speaker number
    const colors = [
      'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 
      'bg-amber-500', 'bg-rose-500', 'bg-indigo-500'
    ];
    
    return colors[(parseInt(speakerNumber[0]) - 1) % colors.length];
  };

  /**
   * Get the speaker initials for the avatar
   */
  const getSpeakerInitials = (speaker: string | undefined): string => {
    if (!speaker) return '?';
    
    // Extract speaker number if available
    const speakerNumber = speaker.match(/\d+/);
    if (speakerNumber) return speakerNumber[0];
    
    return speaker.charAt(0).toUpperCase();
  };

  if (transcripts.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500">
        <p className="text-sm">No transcripts available</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {transcripts.map((transcript, index) => {
        // Determine if this transcript is currently active
        const isActive = index === activeTranscriptIndex;
        
        return (
          <div 
            key={index}
            onClick={() => onTranscriptClick(transcript.start)}
            className={`
              py-4 px-5 cursor-pointer transition-all duration-200 relative group
              ${isActive ? 'bg-blue-50/50' : 'hover:bg-slate-50'}
            `}
          >
            {/* Active indicator */}
            {isActive && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
            )}
            
            <div className="flex items-start gap-3 max-w-3xl mx-auto">
              {/* Speaker avatar */}
              <Avatar className={`h-9 w-9 ${getSpeakerColor(transcript.speaker)}`}>
                <AvatarFallback className="text-white font-medium">
                  {getSpeakerInitials(transcript.speaker)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                {/* Speaker name and timestamp */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-medium text-slate-900">
                    {transcript.speaker || 'Speaker'}
                  </div>
                  
                  <Badge 
                    variant="outline" 
                    className="text-xs font-normal px-2 text-slate-500 group-hover:text-blue-600 transition-colors bg-transparent border-slate-200"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{formatTime(transcript.start)}</span>
                  </Badge>
                </div>
                
                {/* Transcript text */}
                <p className={`text-slate-700 text-sm ${isActive ? 'font-medium' : ''}`}>
                  {transcript.text}
                </p>
              </div>
            </div>
            
            {/* Hover action for clicking */}
            <div className={`
              absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 
              transition-opacity
            `}>
              <Badge variant="secondary" className="text-xs font-normal">
                <Play className="h-3 w-3 mr-1 fill-current" strokeWidth={1} /> 
                Jump to this part
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TranscriptList; 