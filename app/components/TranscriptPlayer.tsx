'use client';

import React, { useState, useEffect } from 'react';
import TranscriptSegment, { TranscriptSegmentData } from './TranscriptSegment';

interface TranscriptPlayerProps {
  segments: TranscriptSegmentData[];
  currentTime: number;
  onSegmentClick: (timestamp: number) => void;
}

const TranscriptPlayer: React.FC<TranscriptPlayerProps> = ({
  segments,
  currentTime,
  onSegmentClick
}) => {
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);

  useEffect(() => {
    // Find the active segment based on current time
    const activeSegment = segments.find(
      segment => currentTime >= segment.timestamp && currentTime <= segment.timestamp + 5
    );
    
    if (activeSegment && activeSegment.id !== activeSegmentId) {
      setActiveSegmentId(activeSegment.id);
      
      // Auto-scroll to active segment
      const element = document.getElementById(`segment-${activeSegment.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [segments, currentTime, activeSegmentId]);

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <h3 className="card-title text-lg">Transcript</h3>
        <div className="h-[400px] overflow-y-auto pr-2 space-y-2">
          {segments.map(segment => (
            <TranscriptSegment
              key={segment.id}
              segment={segment}
              isActive={segment.id === activeSegmentId}
              onSegmentClick={onSegmentClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TranscriptPlayer; 