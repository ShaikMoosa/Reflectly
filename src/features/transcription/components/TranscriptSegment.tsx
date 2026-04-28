'use client';

import React, { useState } from 'react';
import { Tag, MessageSquare, Star, Plus, Play } from 'lucide-react';

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
  onAddTag?: (id: string) => void;
  onAddComment?: (id: string) => void;
  onHighlight?: (id: string) => void;
  onAddToNotes?: (id: string) => void;
  onPlaySegment?: (timestamp: number) => void;
}

export default function TranscriptSegment({
  segment,
  isActive = false,
  highlighted = false,
  onClick,
  onTimestampClick,
  onAddTag,
  onAddComment,
  onHighlight,
  onAddToNotes,
  onPlaySegment
}: TranscriptSegmentProps) {
  const [hover, setHover] = useState(false);
  
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
    'rounded-md',
    'relative',
    'transition-all',
    'hover:bg-gray-50',
    'border border-gray-100',
    isActive ? 'border-l-4 border-l-blue-500 bg-blue-50' : '',
    highlighted ? 'bg-yellow-50' : ''
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
    'text-gray-500',
    'bg-gray-100',
    'hover:bg-gray-200',
    'transition-colors',
    'cursor-pointer'
  ].join(' ');

  const handleTimestampClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTimestampClick) {
      onTimestampClick(segment.start_time);
    }
  };
  
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlaySegment) {
      onPlaySegment(segment.start_time);
    }
  };
  
  const handleAddTag = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddTag) {
      onAddTag(segment.id);
    }
  };
  
  const handleAddComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddComment) {
      onAddComment(segment.id);
    }
  };
  
  const handleHighlight = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onHighlight) {
      onHighlight(segment.id);
    }
  };
  
  const handleAddToNotes = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToNotes) {
      onAddToNotes(segment.id);
    }
  };

  return (
    <div 
      className={segmentClasses}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      id={`segment-${segment.id}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <span 
            className={timestampClasses}
            onClick={handleTimestampClick}
          >
            {formatTimestamp(segment.start_time)}
          </span>
          <span className="segment-text">
            {segment.text}
          </span>
        </div>
        
        <div className="segment-actions flex space-x-1 ml-2">
          <button 
            className="action-btn p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
            onClick={handlePlayClick}
            title="Play from here"
          >
            <Play size={16} />
          </button>
          
          <button 
            className="action-btn p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
            onClick={handleAddTag}
            title="Add Tag"
          >
            <Tag size={16} />
          </button>
          
          <button 
            className="action-btn p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
            onClick={handleAddComment}
            title="Add Comment"
          >
            <MessageSquare size={16} />
          </button>
          
          <button 
            className={`action-btn p-1 rounded-full ${highlighted ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500 hover:bg-yellow-50'}`}
            onClick={handleHighlight}
            title={highlighted ? "Remove Highlight" : "Highlight"}
          >
            <Star size={16} fill={highlighted ? "currentColor" : "none"} />
          </button>
          
          <button 
            className="action-btn p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
            onClick={handleAddToNotes}
            title="Add to Notes"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
} 