'use client';

import React, { useState, useEffect, useRef } from 'react';
import TranscriptSegment, { TranscriptSegmentData } from './TranscriptSegment';

// Debug utility for consistent logging
const logDebug = (component: string, action: string, data?: any) => {
  console.log(`[${component}] ${action}`, data !== undefined ? data : '');
};

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
  console.log('[TranscriptPlayer] Rendering', { 
    segmentsCount: segments.length, 
    currentTime 
  });

  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userScrolledRef = useRef<boolean>(false);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const prevActiveIdRef = useRef<string | null>(null);

  // Detect manual scrolling by user
  useEffect(() => {
    const container = transcriptContainerRef.current;
    if (!container) {
      logDebug('TranscriptPlayer', 'Container ref not available for scroll handler');
      return;
    }

    logDebug('TranscriptPlayer', 'Setting up scroll detection');
    
    const handleScroll = () => {
      if (!userScrolledRef.current) {
        logDebug('TranscriptPlayer', 'User started manual scrolling');
      }
      userScrolledRef.current = true;
      
      // Reset after 5 seconds of no scrolling
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        logDebug('TranscriptPlayer', 'Manual scroll timeout expired, enabling auto-scroll');
        userScrolledRef.current = false;
      }, 5000);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      logDebug('TranscriptPlayer', 'Cleaning up scroll handler');
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Find the active segment based on current time
    logDebug('TranscriptPlayer', 'Checking for active segment', { currentTime });
    
    const activeSegment = segments.find(
      segment => currentTime >= segment.timestamp && currentTime <= segment.timestamp + 5
    );
    
    if (activeSegment) {
      if (activeSegment.id !== activeSegmentId) {
        logDebug('TranscriptPlayer', 'Active segment changed', { 
          from: activeSegmentId, 
          to: activeSegment.id, 
          text: activeSegment.text.substring(0, 30) + (activeSegment.text.length > 30 ? '...' : '')
        });
        
        setActiveSegmentId(activeSegment.id);
        prevActiveIdRef.current = activeSegment.id;
        
        // Only auto-scroll if user hasn't manually scrolled recently
        if (!userScrolledRef.current) {
          const element = document.getElementById(`segment-${activeSegment.id}`);
          if (element && transcriptContainerRef.current) {
            logDebug('TranscriptPlayer', 'Auto-scrolling to active segment');
            // Use smooth scrolling for better UX
            element.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'nearest'
            });
          } else {
            logDebug('TranscriptPlayer', 'Could not find element to scroll to', {
              segmentId: activeSegment.id,
              elementExists: !!element,
              containerExists: !!transcriptContainerRef.current
            });
          }
        } else {
          logDebug('TranscriptPlayer', 'Skipping auto-scroll due to recent user scroll');
        }
      }
    } else {
      if (activeSegmentId !== null) {
        logDebug('TranscriptPlayer', 'No active segment found, clearing active segment');
        setActiveSegmentId(null);
      }
    }
  }, [segments, currentTime, activeSegmentId]);

  // Log segments changes
  useEffect(() => {
    logDebug('TranscriptPlayer', 'Segments changed', {
      count: segments.length,
      firstSegmentTime: segments.length > 0 ? segments[0].timestamp : null,
      lastSegmentTime: segments.length > 0 ? segments[segments.length - 1].timestamp : null
    });
  }, [segments]);

  // Component mount logging
  useEffect(() => {
    logDebug('TranscriptPlayer', 'Component mounted');
    return () => {
      logDebug('TranscriptPlayer', 'Component unmounting');
    };
  }, []);

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