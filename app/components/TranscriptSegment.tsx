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
  onSegmentClick: (timestamp: number) => void;
}

const TranscriptSegment: React.FC<TranscriptSegmentProps> = ({
  segment,
  isActive,
  onSegmentClick
}) => {
  // Log when the component renders, especially active state changes
  logDebug('TranscriptSegment', `Rendering segment ${segment.id}`, { 
    timestamp: segment.timestamp, 
    isActive,
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
      className={`p-3 rounded-md mb-2 transition-all hover:bg-base-200 
                ${isActive ? 'bg-primary bg-opacity-10 border border-primary' : 'bg-base-100'}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {segment.text}
        </div>
        <button 
          className="text-primary font-medium ml-2 hover:text-primary-focus focus:outline-none
                    flex items-center px-2 py-1 rounded hover:bg-base-200 transition-all"
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