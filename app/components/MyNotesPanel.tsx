'use client';

import React from 'react';
import { Pencil, Tag, MessageSquare, Star, Clock, X } from 'lucide-react';

export interface Annotation {
  id: string;
  type: 'tag' | 'comment' | 'highlight';
  timestamp: number;
  text: string;
  segmentText: string;
  tag?: string;
  comment?: string;
}

interface MyNotesPanelProps {
  annotations: Annotation[];
  onAnnotationClick: (timestamp: number) => void;
  onAnnotationEdit: (id: string) => void;
  onAnnotationDelete: (id: string) => void;
}

const MyNotesPanel: React.FC<MyNotesPanelProps> = ({
  annotations,
  onAnnotationClick,
  onAnnotationEdit,
  onAnnotationDelete
}) => {
  // Format time in seconds to MM:SS format
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const getAnnotationIcon = (type: string) => {
    switch (type) {
      case 'tag':
        return <Tag size={16} className="text-blue-500" />;
      case 'comment':
        return <MessageSquare size={16} className="text-green-500" />;
      case 'highlight':
        return <Star size={16} className="text-yellow-500" fill="currentColor" />;
      default:
        return null;
    }
  };

  const getAnnotationTitle = (annotation: Annotation) => {
    switch (annotation.type) {
      case 'tag':
        return `Tagged: ${annotation.tag}`;
      case 'comment':
        return `Comment: ${annotation.comment}`;
      case 'highlight':
        return 'Highlighted';
      default:
        return '';
    }
  };

  // Group annotations by their timestamps (rounded to the nearest minute)
  const groupedAnnotations = annotations.reduce((acc, annotation) => {
    const minute = Math.floor(annotation.timestamp / 60);
    if (!acc[minute]) acc[minute] = [];
    acc[minute].push(annotation);
    return acc;
  }, {} as Record<number, Annotation[]>);

  // Sort timestamps
  const sortedMinutes = Object.keys(groupedAnnotations)
    .map(key => parseInt(key))
    .sort((a, b) => a - b);

  return (
    <div className="my-notes-panel h-full flex flex-col bg-white border-l">
      <div className="panel-header p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">My Notes</h2>
        <span className="text-sm text-gray-500">{annotations.length} notes</span>
      </div>

      {annotations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center text-gray-500">
          <div className="mb-3">
            <MessageSquare size={24} className="mx-auto text-gray-300" />
          </div>
          <p className="text-sm">No notes yet. Click tag, comment, or highlight icons on transcript segments to add notes.</p>
        </div>
      ) : (
        <div className="annotations-list flex-1 overflow-y-auto p-4">
          {sortedMinutes.map(minute => (
            <div key={minute} className="minute-group mb-6">
              <div className="minute-header flex items-center mb-2">
                <Clock size={14} className="text-gray-400 mr-2" />
                <span className="text-xs text-gray-500 font-medium">
                  {Math.floor(minute / 60)}:{(minute % 60).toString().padStart(2, '0')}
                </span>
              </div>
              
              <div className="annotations">
                {groupedAnnotations[minute].map(annotation => (
                  <div 
                    key={annotation.id} 
                    className="annotation-item mb-3 border border-gray-100 rounded-lg p-3 hover:border-gray-300 transition-colors cursor-pointer group"
                    onClick={() => onAnnotationClick(annotation.timestamp)}
                  >
                    <div className="flex items-start">
                      <div className="annotation-icon mr-3 mt-1">
                        {getAnnotationIcon(annotation.type)}
                      </div>
                      
                      <div className="annotation-content flex-1">
                        <div className="annotation-header flex items-center mb-1">
                          <span className="annotation-timestamp text-xs font-mono text-gray-500 mr-2 bg-gray-100 px-1.5 py-0.5 rounded">
                            {formatTime(annotation.timestamp)}
                          </span>
                          <span className="annotation-title text-xs font-medium text-gray-700">
                            {getAnnotationTitle(annotation)}
                          </span>
                        </div>
                        
                        <div className="annotation-text text-sm text-gray-800 line-clamp-2 mb-1">
                          {annotation.segmentText}
                        </div>
                        
                        {annotation.type === 'comment' && annotation.comment && (
                          <div className="annotation-comment text-xs italic text-gray-600 bg-gray-50 p-2 rounded mt-1">
                            {annotation.comment}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="annotation-actions hidden group-hover:flex absolute top-2 right-2 space-x-1">
                      <button 
                        className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAnnotationEdit(annotation.id);
                        }}
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button 
                        className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAnnotationDelete(annotation.id);
                        }}
                        title="Delete"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyNotesPanel; 