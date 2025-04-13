'use client';

import React from 'react';

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
  const formatTimestamp = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`transcript-segment ${isActive ? 'active' : ''}`}
      onClick={() => onSegmentClick(segment.timestamp)}
    >
      <div className="timestamp">{formatTimestamp(segment.timestamp)}</div>
      <div className="text">{segment.text}</div>
    </div>
  );
};

export default TranscriptSegment; 