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
  const [lastClickedId, setLastClickedId] = useState<string | null>(null);

  // Handle click with highlight effect
  const handleSegmentClick = (timestamp: number, segmentId: string) => {
    logDebug('TranscriptPlayer', 'Segment clicked', { timestamp, segmentId });
    setLastClickedId(segmentId);
    
    // Reset the highlight after a delay
    setTimeout(() => {
      setLastClickedId(null);
    }, 1000);
    
    // Call the parent's click handler
    onSegmentClick(timestamp);
  };

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

  // Add CSS for highlight animation
  useEffect(() => {
    // Add style for click highlight animation if not already present
    if (!document.getElementById('transcript-highlight-style')) {
      const style = document.createElement('style');
      style.id = 'transcript-highlight-style';
      style.innerHTML = `
        .transcript-highlight {
          animation: highlightPulse 1s ease-out;
        }
        
        @keyframes highlightPulse {
          0% { background-color: rgba(var(--primary-rgb), 0.3); }
          100% { background-color: rgba(var(--primary-rgb), 0); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (segments.length === 0) {
    return (
      <div className="card bg-white dark:bg-gray-800 shadow-md h-full">
        <div className="card-body">
          <h3 className="card-title text-lg text-gray-900 dark:text-white">Transcript</h3>
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">No transcript available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="transcript-player-container card bg-white dark:bg-gray-800 shadow-md h-full">
      <div className="card-body p-4 flex flex-col">
        <div className="transcript-header bg-white dark:bg-gray-800">
          <h3 className="card-title text-lg text-gray-900 dark:text-white">Transcript</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Click any segment to jump to that point</p>
        </div>
        <div 
          ref={transcriptContainerRef}
          className="transcript-scroll-container transcript-body overflow-y-auto pr-2 space-y-2 bg-white dark:bg-gray-800"
        >
          {segments.map(segment => (
            <TranscriptSegment
              key={segment.id}
              segment={segment}
              isActive={segment.id === activeSegmentId}
              isHighlighted={segment.id === lastClickedId}
              onSegmentClick={(timestamp) => handleSegmentClick(timestamp, segment.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TranscriptPlayer; 