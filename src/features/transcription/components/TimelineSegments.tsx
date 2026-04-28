'use client';

import React, { useEffect, useRef } from 'react';
import { TranscriptSegmentData } from './TranscriptSegment';
import { Clock } from 'lucide-react';

interface TimelineSegmentsProps {
  segments: TranscriptSegmentData[];
  currentTime: number;
  onSegmentClick: (timestamp: number) => void;
  videoDuration: number;
}

const TimelineSegments: React.FC<TimelineSegmentsProps> = ({
  segments,
  currentTime,
  onSegmentClick,
  videoDuration
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Format time in MM:SS format
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Calculate position for segment markers and progress indicator
  useEffect(() => {
    if (timelineRef.current && progressRef.current && videoDuration > 0) {
      // Update progress indicator
      const progress = (currentTime / videoDuration) * 100;
      progressRef.current.style.width = `${progress}%`;
    }
  }, [currentTime, videoDuration]);

  // Create an array of time markers for the timeline
  const generateTimeMarkers = () => {
    if (!videoDuration) return [];
    
    const markers = [];
    const interval = Math.max(60, Math.floor(videoDuration / 6)); // Show markers every minute or divide into 6 sections
    
    for (let time = 0; time <= videoDuration; time += interval) {
      markers.push({
        time,
        position: (time / videoDuration) * 100
      });
    }
    
    return markers;
  };

  const timeMarkers = generateTimeMarkers();
  
  return (
    <div className="timeline-segments bg-white border rounded-md p-4 mt-4">
      <div className="flex items-center mb-2">
        <Clock className="h-4 w-4 mr-2 text-gray-500" />
        <h3 className="text-sm font-medium">Video Timeline</h3>
      </div>
      
      <div 
        ref={timelineRef}
        className="timeline-container relative h-8 bg-gray-100 rounded-md mb-2"
      >
        {/* Progress indicator */}
        <div 
          ref={progressRef}
          className="absolute top-0 left-0 h-full bg-blue-100 rounded-l-md"
          style={{ width: `${(currentTime / videoDuration) * 100}%` }}
        ></div>
        
        {/* Current position indicator */}
        <div 
          className="absolute top-0 h-full w-0.5 bg-blue-500 z-10"
          style={{ left: `${(currentTime / videoDuration) * 100}%` }}
        ></div>
        
        {/* Segment markers */}
        {segments.map((segment) => (
          <div 
            key={segment.id}
            className="absolute top-0 h-full cursor-pointer hover:bg-blue-200 transition-colors z-20 group"
            style={{ 
              left: `${(segment.start_time / videoDuration) * 100}%`,
              width: `${((segment.end_time - segment.start_time) / videoDuration) * 100}%`,
              opacity: currentTime >= segment.start_time && currentTime < segment.end_time ? 0.8 : 0.3
            }}
            onClick={() => onSegmentClick(segment.start_time)}
            title={segment.text}
          >
            <div className="absolute bottom-full mb-1 transform -translate-x-1/2 left-1/2 hidden group-hover:block">
              <div className="whitespace-nowrap text-xs bg-gray-800 text-white px-2 py-1 rounded">
                {formatTime(segment.start_time)}
              </div>
            </div>
            {/* Add thin colored bar at the top of each segment */}
            <div 
              className={`absolute top-0 w-full h-1.5 ${
                currentTime >= segment.start_time && currentTime < segment.end_time 
                  ? 'bg-blue-500' 
                  : 'bg-gray-300 group-hover:bg-blue-300'
              }`}
            ></div>
          </div>
        ))}
        
        {/* Time markers */}
        {timeMarkers.map((marker, index) => (
          <div 
            key={index}
            className="absolute top-0 h-full"
            style={{ left: `${marker.position}%` }}
          >
            <div className="absolute top-0 h-2 w-0.5 bg-gray-400"></div>
            <div className="absolute bottom-0 transform -translate-x-1/2 text-xs text-gray-500">
              {formatTime(marker.time)}
            </div>
          </div>
        ))}
      </div>
      
      {/* Segments list */}
      <div className="segments-list mt-4 space-y-2 max-h-24 overflow-y-auto">
        {segments.slice(0, 5).map((segment) => (
          <div 
            key={segment.id}
            className={`segment-item flex items-center p-2 rounded-md cursor-pointer transition-colors hover:bg-gray-100 ${
              currentTime >= segment.start_time && currentTime < segment.end_time ? 'bg-blue-50 border-l-2 border-blue-500' : ''
            }`}
            onClick={() => onSegmentClick(segment.start_time)}
          >
            <span className="timestamp text-xs font-mono bg-gray-100 px-1 py-0.5 rounded mr-2">
              {formatTime(segment.start_time)}
            </span>
            <span className="segment-text text-xs text-gray-700 truncate flex-1">
              {segment.text}
            </span>
            {currentTime >= segment.start_time && currentTime < segment.end_time && (
              <span className="flex items-center justify-center ml-2 w-2 h-2 rounded-full bg-blue-500"></span>
            )}
          </div>
        ))}
        {segments.length > 5 && (
          <div className="text-center text-xs text-gray-500 mt-2">
            Showing 5 of {segments.length} segments
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineSegments; 