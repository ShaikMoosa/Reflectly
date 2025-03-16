'use client';

import React, { useState, useEffect } from 'react';
import { PlayCircle, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown } from 'lucide-react';

interface TranscriptListProps {
  transcripts: Array<{ text: string; start: number; speaker?: string }>;
  onTranscriptClick: (timestamp: number) => void;
  currentVideoTime: number;
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const TranscriptList = ({ transcripts, onTranscriptClick, currentVideoTime }: TranscriptListProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Assign speaker names if not provided
  const processedTranscripts = transcripts.map((transcript, index) => ({
    ...transcript,
    speaker: transcript.speaker || `Speaker ${(index % 2) + 1}`
  }));
  
  useEffect(() => {
    // Find the current active transcript based on video time
    const currentIndex = processedTranscripts.findIndex((transcript, index) => {
      const nextStart = index < processedTranscripts.length - 1 ? processedTranscripts[index + 1].start : Infinity;
      return currentVideoTime >= transcript.start && currentVideoTime < nextStart;
    });
    
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    }
  }, [currentVideoTime, processedTranscripts]);
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover-scale transition-all">
      <div 
        className="flex items-center justify-between p-4 border-b cursor-pointer"
        onClick={toggleCollapse}
      >
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-gray-800 mr-2">Transcript</h2>
          <span className="text-sm text-gray-500">
            {processedTranscripts.length} segments, {formatTime(processedTranscripts[processedTranscripts.length - 1]?.start || 0)} total
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="text-gray-500 hover:text-gray-700"
            title="Was this transcript accurate?"
          >
            <ThumbsUp size={18} />
          </button>
          <button 
            className="text-gray-500 hover:text-gray-700"
            title="Was this transcript inaccurate?"
          >
            <ThumbsDown size={18} />
          </button>
          {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="max-h-[500px] overflow-y-auto p-4">
          {processedTranscripts.map((transcript, index) => {
            const isActive = activeIndex === index;
            const speakerNumber = transcript.speaker?.split(' ')[1] || '1';
            
            return (
              <div
                key={index}
                className={`mb-4 ${isActive ? 'bg-blue-50 rounded' : ''}`}
              >
                <div className="flex items-center mb-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 text-white bg-blue-${speakerNumber === '1' ? '600' : '400'}`}>
                    S{speakerNumber}
                  </div>
                  <span className="font-medium">{transcript.speaker}</span>
                  <div className="flex items-center ml-auto">
                    <button
                      onClick={() => onTranscriptClick(transcript.start)}
                      className="text-blue-600 hover:text-blue-700 transition-colors flex items-center"
                      title="Play from this timestamp"
                    >
                      <span className="text-sm font-mono text-gray-500 mr-1">{formatTime(transcript.start)}</span>
                      <PlayCircle size={16} />
                    </button>
                  </div>
                </div>
                <p className={`pl-10 text-gray-700 ${isActive ? 'font-medium' : ''}`}>
                  {transcript.text}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TranscriptList; 