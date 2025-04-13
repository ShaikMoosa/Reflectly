'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userScrolledRef = useRef<boolean>(false);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  // Detect manual scrolling by user
  useEffect(() => {
    const container = transcriptContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      userScrolledRef.current = true;
      
      // Reset after 5 seconds of no scrolling
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        userScrolledRef.current = false;
      }, 5000);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Find the active segment based on current time
    const activeSegment = segments.find(
      segment => currentTime >= segment.timestamp && currentTime <= segment.timestamp + 5
    );
    
    if (activeSegment && activeSegment.id !== activeSegmentId) {
      setActiveSegmentId(activeSegment.id);
      
      // Only auto-scroll if user hasn't manually scrolled recently
      if (!userScrolledRef.current) {
        const element = document.getElementById(`segment-${activeSegment.id}`);
        if (element && transcriptContainerRef.current) {
          // Use smooth scrolling for better UX
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }
      }
    }
  }, [segments, currentTime, activeSegmentId]);

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <h3 className="card-title text-lg">Transcript</h3>
        <div 
          ref={transcriptContainerRef}
          className="h-[400px] overflow-y-auto pr-2 space-y-2"
        >
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