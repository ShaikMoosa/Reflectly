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
      id={`segment-${segment.id}`}
      className={`flex p-3 rounded-md mb-2 cursor-pointer transition-all hover:bg-base-200 
                ${isActive ? 'bg-primary bg-opacity-10 border border-primary' : 'bg-base-100'}`}
      onClick={() => onSegmentClick(segment.timestamp)}
    >
      <div className="text-primary font-medium min-w-[50px] mr-3">
        {formatTimestamp(segment.timestamp)}
      </div>
      <div className="flex-1">
        {segment.text}
      </div>
    </div>
  );
};

export default TranscriptSegment; 