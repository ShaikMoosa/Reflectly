'use client';

import React from 'react';

// Debug utility for consistent logging
const logDebug = (component: string, action: string, data?: any) => {
  console.log(`[${component}] ${action}`, data !== undefined ? data : '');
};

export interface TranscriptSegmentData {
  id: string;
  text: string;
  start_time: number;
  end_time: number;
}

export interface TranscriptSegmentProps {
  segment: TranscriptSegmentData;
  isActive?: boolean;
  highlighted?: boolean;
  onClick?: (id: string) => void;
  onTimestampClick?: (timestamp: number) => void;
}

export default function TranscriptSegment({
  segment,
  isActive = false,
  highlighted = false,
  onClick,
  onTimestampClick
}: TranscriptSegmentProps) {
  const formatTimestamp = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return hours > 0
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const segmentClasses = [
    'transcript-segment',
    'p-3',
    'mb-2',
    'rounded',
    'cursor-pointer',
    isActive ? 'transcript-segment-active' : '',
    highlighted ? 'transcript-highlight' : ''
  ].filter(Boolean).join(' ');

  const timestampClasses = [
    'timestamp-btn',
    'text-xs',
    'font-mono',
    'py-1',
    'px-2',
    'rounded',
    'inline-block',
    'mr-2',
    'cursor-pointer'
  ].join(' ');

  const handleClick = () => {
    if (onClick) {
      onClick(segment.id);
    }
  };

  const handleTimestampClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTimestampClick) {
      onTimestampClick(segment.start_time);
    }
  };

  return (
    <div 
      className={segmentClasses}
      onClick={handleClick}
    >
      <span 
        className={timestampClasses}
        onClick={handleTimestampClick}
      >
        {formatTimestamp(segment.start_time)}
      </span>
      {segment.text}
    </div>
  );
} 