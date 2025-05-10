'use client';

import React, { useRef, useEffect } from 'react';
import { Tag, MessageSquare, FileText } from 'lucide-react';

interface Transcript {
  start: number;
  end?: number;
  text: string;
  speaker?: string;
}

interface Note {
  text: string;
  timestamp: number;
  tags?: string[];
  comment?: string;
  isHighlighted?: boolean;
}

interface TranscriptListProps {
  transcripts: Transcript[];
  currentTime: number;
  autoScroll: boolean;
  onTimestampClick: (time: number) => void;
  onHighlight: (index: number) => void;
  onAddTag: (index: number) => void;
  onAddComment: (index: number) => void;
  onAddToNotes: (index: number) => void;
  notes: Note[];
}

const TranscriptList: React.FC<TranscriptListProps> = ({
  transcripts,
  currentTime,
  autoScroll,
  onTimestampClick,
  onHighlight,
  onAddTag,
  onAddComment,
  onAddToNotes,
  notes
}) => {
  const transcriptListRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  // Format time in seconds to MM:SS format
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Find active transcript based on current time
  const activeTranscriptIndex = transcripts.findIndex(
    (transcript) => currentTime >= transcript.start && 
    (transcript.end ? currentTime <= transcript.end : true)
  );

  // Auto-scroll to active transcript
  useEffect(() => {
    if (autoScroll && activeItemRef.current && transcriptListRef.current) {
      // Calculate position of active item relative to transcript container
      const container = transcriptListRef.current;
      const activeItem = activeItemRef.current;
      
      // Get positions and dimensions
      const containerRect = container.getBoundingClientRect();
      const activeItemRect = activeItem.getBoundingClientRect();
      
      // Check if active item is not fully visible in the container
      const isAboveVisible = activeItemRect.top < containerRect.top;
      const isBelowVisible = activeItemRect.bottom > containerRect.bottom;
      
      if (isAboveVisible || isBelowVisible) {
        // Scroll the item into view within the container
        activeItem.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [currentTime, autoScroll]);

  return (
    <div className="transcript-container">
      <div className="transcript-list" ref={transcriptListRef}>
        {transcripts.map((transcript, index) => (
          <div
            key={index}
            ref={index === activeTranscriptIndex ? activeItemRef : null}
            className={`transcript-item ${index === activeTranscriptIndex ? 'active' : ''}`}
          >
            <div className="transcript-item-content">
              <span 
                className="timestamp" 
                onClick={() => onTimestampClick(transcript.start)}
                title="Jump to this timestamp"
              >
                {formatTime(transcript.start)}
              </span>
              <span className="text-transcript">
                {transcript.text}
                {transcript.speaker && (
                  <span className="block text-xs mt-1 text-secondary">
                    {transcript.speaker}
                  </span>
                )}
              </span>
            </div>
            
            <div className="transcript-actions">
              <button 
                className="note-action-btn"
                onClick={() => onHighlight(index)}
                title="Highlight"
              >
                <span className="highlight-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                  </svg>
                </span>
              </button>
              
              <button 
                className="note-action-btn"
                onClick={() => onAddTag(index)}
                title="Add tag"
              >
                <Tag size={14} />
              </button>
              
              <button 
                className="note-action-btn"
                onClick={() => onAddComment(index)}
                title="Add comment"
              >
                <MessageSquare size={14} />
              </button>
              
              <button 
                className="note-action-btn"
                onClick={() => onAddToNotes(index)}
                title="Add to notes"
              >
                <FileText size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TranscriptList; 