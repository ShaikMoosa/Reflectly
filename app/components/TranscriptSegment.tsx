'use client';

import React, { useEffect } from 'react';
import { Clock } from 'lucide-react';

// Debug utility for consistent logging
const logDebug = (component: string, action: string, data?: any) => {
  console.log(`[${component}] ${action}`, data !== undefined ? data : '');
};

export interface TranscriptSegmentData {
  id: string;
  timestamp: number;
  text: string;
}

interface TranscriptSegmentProps {
  segment: TranscriptSegmentData;
  isActive: boolean;
  isHighlighted?: boolean;
  onSegmentClick: (timestamp: number) => void;
}

const TranscriptSegment: React.FC<TranscriptSegmentProps> = ({
  segment,
  isActive,
  isHighlighted = false,
  onSegmentClick
}) => {
  // Log when the component renders, especially active state changes
  logDebug('TranscriptSegment', `Rendering segment ${segment.id}`, { 
    timestamp: segment.timestamp, 
    isActive,
    isHighlighted,
    textLength: segment.text.length
  });

  // Monitor active state changes
  useEffect(() => {
    if (isActive) {
      logDebug('TranscriptSegment', `Segment ${segment.id} became active`);
    }
  }, [isActive, segment.id]);

  const formatTimestamp = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle click on the entire segment
  const handleSegmentClick = () => {
    logDebug('TranscriptSegment', `Segment clicked ${segment.id}`, {
      timestamp: segment.timestamp
    });
    onSegmentClick(segment.timestamp);
  };

  // Use a separate handler for timestamp clicks to prevent event bubbling
  const handleTimestampClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent bubbling to the parent div
    logDebug('TranscriptSegment', `Timestamp clicked on segment ${segment.id}`, {
      timestamp: segment.timestamp,
      formattedTime: formatTimestamp(segment.timestamp)
    });
    onSegmentClick(segment.timestamp);
  };

  return (
    <div 
      id={`segment-${segment.id}`}
      className={`transcript-segment p-3 rounded-md mb-2 transition-all cursor-pointer
                hover:bg-base-200 
                ${isActive ? 'transcript-segment-active bg-primary bg-opacity-10 border border-primary' : 'bg-base-100'}
                ${isHighlighted ? 'transcript-highlight' : ''}`}
      onClick={handleSegmentClick}
      role="button"
      tabIndex={0}
      aria-label={`Jump to ${formatTimestamp(segment.timestamp)}: ${segment.text.substring(0, 30)}...`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {segment.text}
        </div>
        <button 
          className="timestamp-btn text-primary font-medium ml-2 hover:text-primary-focus focus:outline-none
                    flex items-center px-2 py-1 rounded transition-all"
          onClick={handleTimestampClick}
          aria-label={`Jump to ${formatTimestamp(segment.timestamp)}`}
        >
          <Clock className="h-3 w-3 mr-1" />
          {formatTimestamp(segment.timestamp)}
        </button>
      </div>
    </div>
  );
};

export default TranscriptSegment; 