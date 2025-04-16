'use client';

import React, { useState } from 'react';
import { Tag, MessageSquare, Star, Plus, Check, X } from 'lucide-react';

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
  onAddToNotes
}: TranscriptSegmentProps) {
  const [showActions, setShowActions] = useState(false);
  
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
    'cursor-pointer',
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
      onClick={handleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      id={`segment-${segment.id}`}
    >
      <div className="flex items-start">
        <span 
          className={timestampClasses}
          onClick={handleTimestampClick}
        >
          {formatTimestamp(segment.start_time)}
        </span>
        <div className="flex-1">
          {segment.text}
        </div>
      </div>
      
      {showActions && (
        <div className="segment-actions absolute -right-2 top-2 flex flex-col bg-white shadow-md rounded-md border border-gray-200 overflow-hidden">
          <button 
            className="p-2 hover:bg-gray-100 transition-colors flex items-center text-xs font-medium text-gray-700"
            onClick={handleAddTag}
            title="Add Tag"
          >
            <Tag size={14} className="mr-1" />
            <span className="hidden sm:inline">Tag</span>
          </button>
          
          <button 
            className="p-2 hover:bg-gray-100 transition-colors flex items-center text-xs font-medium text-gray-700"
            onClick={handleAddComment}
            title="Add Comment"
          >
            <MessageSquare size={14} className="mr-1" />
            <span className="hidden sm:inline">Comment</span>
          </button>
          
          <button 
            className={`p-2 hover:bg-gray-100 transition-colors flex items-center text-xs font-medium ${highlighted ? 'text-yellow-600' : 'text-gray-700'}`}
            onClick={handleHighlight}
            title={highlighted ? "Remove Highlight" : "Highlight"}
          >
            <Star size={14} className="mr-1" fill={highlighted ? "currentColor" : "none"} />
            <span className="hidden sm:inline">
              {highlighted ? "Unhighlight" : "Highlight"}
            </span>
          </button>
          
          <button 
            className="p-2 hover:bg-gray-100 transition-colors flex items-center text-xs font-medium text-gray-700"
            onClick={handleAddToNotes}
            title="Add to Notes"
          >
            <Plus size={14} className="mr-1" />
            <span className="hidden sm:inline">Save</span>
          </button>
        </div>
      )}
    </div>
  );
} 