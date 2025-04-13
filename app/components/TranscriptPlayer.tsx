'use client';

import React, { useState, useEffect, useRef } from 'react';
import TranscriptSegment, { TranscriptSegmentData } from './TranscriptSegment';
import { Clock, ChevronsDown, ChevronsUp, FileText } from 'lucide-react';
import LoadingIndicator from './LoadingIndicator';

export interface TranscriptPlayerProps {
  segments: TranscriptSegmentData[];
  currentTime: number;
  onSegmentClick: (timestamp: number) => void;
  className?: string;
  loading?: boolean;
  hasTranscript?: boolean;
  showTimestamps?: boolean;
  playbackSpeed?: number;
  isExpanded?: boolean;
  highlightedSegments?: string[];
  onAddToNotes?: (segment: TranscriptSegmentData) => void;
  onToggleTimestamps?: () => void;
  onChangePlaybackSpeed?: (speed: number) => void;
  onToggleExpand?: () => void;
}

const TranscriptPlayer: React.FC<TranscriptPlayerProps> = ({
  segments,
  currentTime,
  onSegmentClick,
  className = '',
  loading = false,
  hasTranscript = true,
  showTimestamps = true,
  playbackSpeed = 1,
  isExpanded = true,
  highlightedSegments = [],
  onAddToNotes,
  onToggleTimestamps,
  onChangePlaybackSpeed,
  onToggleExpand
}) => {
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [lastClickedId, setLastClickedId] = useState<string | null>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  // Handle segment click and highlight
  const handleSegmentClick = (segmentId: string) => {
    const segment = segments.find(s => s.id === segmentId);
    if (segment) {
      setLastClickedId(segmentId);
      onSegmentClick(segment.start_time);
      
      // Reset highlight after 1 second
      setTimeout(() => {
        setLastClickedId(null);
      }, 1000);
    }
  };

  // Handle direct timestamp click
  const handleTimestampClick = (timestamp: number) => {
    onSegmentClick(timestamp);
  };

  // Handle adding a segment to notes
  const handleAddToNotes = (segmentId: string) => {
    if (onAddToNotes) {
      const segment = segments.find(s => s.id === segmentId);
      if (segment) {
        onAddToNotes(segment);
      }
    }
  };

  // Find and set active segment based on current time
  useEffect(() => {
    if (segments.length === 0) return;

    const activeSegment = segments.find(segment => 
      currentTime >= segment.start_time && 
      currentTime < segment.end_time
    );
    
    if (activeSegment) {
      setActiveSegmentId(activeSegment.id);
      
      // Auto-scroll to active segment if not manually clicked
      if (activeSegment.id !== lastClickedId && transcriptContainerRef.current) {
        const activeElement = document.getElementById(`segment-${activeSegment.id}`);
        if (activeElement) {
          activeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }
    } else {
      setActiveSegmentId(null);
    }
  }, [segments, currentTime, lastClickedId]);

  // Handle UI control events
  const handleToggleTimestamps = () => {
    if (onToggleTimestamps) onToggleTimestamps();
  };
  
  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChangePlaybackSpeed) onChangePlaybackSpeed(parseFloat(e.target.value));
  };
  
  const handleExpandCollapse = () => {
    if (onToggleExpand) onToggleExpand();
  };

  // Loading state
  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <LoadingIndicator />
      </div>
    );
  }

  // No transcript state 
  if (!hasTranscript) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 text-center rounded-md h-full ${className}`}>
        <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-medium">No transcript available</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Upload a video to generate a transcript or check back later if processing.
        </p>
      </div>
    );
  }

  // With transcript
  return (
    <div className={`transcript-player flex flex-col h-full ${className}`}>
      {/* Transcript controls */}
      <div className="transcript-controls flex items-center justify-between p-3 border-b">
        <div className="flex items-center">
          <button 
            className="p-2 rounded-md focus:outline-none"
            onClick={handleToggleTimestamps}
            aria-label={showTimestamps ? "Hide timestamps" : "Show timestamps"}
          >
            <Clock className="h-4 w-4" />
          </button>
          
          <div className="ml-4 flex items-center">
            <span className="text-sm mr-2">Speed:</span>
            <select 
              value={playbackSpeed} 
              onChange={handleSpeedChange}
              className="text-sm rounded p-1 focus:outline-none"
            >
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1">1x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="1.75">1.75x</option>
              <option value="2">2x</option>
            </select>
          </div>
        </div>
        
        <button
          className="p-2 rounded-md focus:outline-none"
          onClick={handleExpandCollapse}
          aria-label={isExpanded ? "Collapse transcript" : "Expand transcript"}
        >
          {isExpanded ? <ChevronsDown className="h-4 w-4" /> : <ChevronsUp className="h-4 w-4" />}
        </button>
      </div>
      
      {/* Transcript segments */}
      <div 
        ref={transcriptContainerRef}
        className="transcript-segments flex-1 overflow-y-auto p-4"
      >
        {segments.map(segment => (
          <TranscriptSegment
            key={segment.id}
            segment={segment}
            isActive={activeSegmentId === segment.id}
            highlighted={highlightedSegments.includes(segment.id) || lastClickedId === segment.id}
            onClick={handleSegmentClick}
            onTimestampClick={handleTimestampClick}
          />
        ))}
      </div>
    </div>
  );
};

export default TranscriptPlayer; 