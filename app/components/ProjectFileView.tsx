'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, X } from 'lucide-react';
import TabMenu from './TabMenu';
import VideoPlayer from './VideoPlayer';
import TranscriptPlayer from './TranscriptPlayer';
import { TranscriptSegmentData } from './TranscriptSegment';
import NotesPanel from './NotesPanel';
import ChatPanel from './ChatPanel';
import FileUploadStep, { UploadedFile } from './FileUploadStep';
import { Project } from './ProjectPage';
import { v4 as uuidv4 } from 'uuid';

export interface ProjectFileViewProps {
  project: Project;
  onBackToProjects: () => void;
  onSaveProject: (updatedProject: Project) => void;
}

interface TranscriptData {
  segments: TranscriptSegmentData[];
  loading: boolean;
  hasTranscript: boolean;
}

const ProjectFileView: React.FC<ProjectFileViewProps> = ({
  project,
  onBackToProjects,
  onSaveProject
}) => {
  // State for active tab
  const [activeTab, setActiveTab] = useState<'transcript' | 'notes' | 'ai-chat'>('transcript');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Video state
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Transcript state
  const [transcriptData, setTranscriptData] = useState<TranscriptData>({
    segments: [],
    loading: false,
    hasTranscript: false
  });
  
  // Video upload state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Playback preferences
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(true);

  // Notes state
  const [notes, setNotes] = useState<{
    text: string;
    timestamp: number;
    tags?: string[];
    comment?: string;
    isHighlighted?: boolean;
  }[]>([]);
  
  const [chatMessages, setChatMessages] = useState<{
    role: 'user' | 'assistant';
    content: string;
  }[]>([]);

  // Initialize video and transcript data if available
  useEffect(() => {
    // This would be replaced with real data loaded from the project
    // For now, we're just setting up a demo UI
    setTranscriptData({
      segments: [],
      loading: false,
      hasTranscript: false
    });
  }, [project]);

  const handleTabChange = (tab: 'transcript' | 'notes' | 'ai-chat') => {
    setActiveTab(tab);
  };

  const handleToggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSegmentClick = (timestamp: number) => {
    setCurrentTime(timestamp);
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  const handleFilesChange = (files: UploadedFile[]) => {
    setUploadedFiles(files);
    if (files.length > 0) {
      const file = files[0].file;
      setVideoUrl(URL.createObjectURL(file));
    }
  };

  const handleGenerateTranscript = async () => {
    if (uploadedFiles.length === 0) return;
    
    setTranscriptData({
      ...transcriptData,
      loading: true
    });
    
    try {
      // In a real implementation, this would make an API call to OpenAI Whisper
      // For now, we'll simulate a transcript generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock transcript data
      const mockSegments: TranscriptSegmentData[] = [
        {
          id: uuidv4(),
          text: "Welcome to our project demo video.",
          start_time: 0,
          end_time: 3.5
        },
        {
          id: uuidv4(),
          text: "In this video, we'll showcase the main features of our application.",
          start_time: 3.5,
          end_time: 7.2
        },
        {
          id: uuidv4(),
          text: "Let's get started with a quick overview of the interface.",
          start_time: 7.2,
          end_time: 10.5
        }
      ];
      
      setTranscriptData({
        segments: mockSegments,
        loading: false,
        hasTranscript: true
      });
    } catch (error) {
      console.error("Error generating transcript:", error);
      setTranscriptData({
        ...transcriptData,
        loading: false
      });
    }
  };

  const handleImportTranscript = () => {
    // Implementation for importing existing transcript
  };

  const handleExportTranscript = () => {
    if (!transcriptData.hasTranscript) return;
    
    const exportData = {
      projectName: project.name,
      transcripts: transcriptData.segments
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_')}_transcript.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleTimestamps = () => {
    setShowTimestamps(!showTimestamps);
  };

  const handleChangePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  const handleToggleExpand = () => {
    setIsTranscriptExpanded(!isTranscriptExpanded);
  };

  const handleNoteClick = (timestamp: number) => {
    setCurrentTime(timestamp);
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };
  
  const handleNoteEdit = (index: number, newText: string) => {
    const updatedNotes = [...notes];
    updatedNotes[index].text = newText;
    setNotes(updatedNotes);
  };
  
  const handleNoteDelete = (index: number) => {
    const updatedNotes = [...notes];
    updatedNotes.splice(index, 1);
    setNotes(updatedNotes);
  };
  
  const handleToggleHighlight = (index: number) => {
    const updatedNotes = [...notes];
    updatedNotes[index].isHighlighted = !updatedNotes[index].isHighlighted;
    setNotes(updatedNotes);
  };
  
  const handleAddTag = (noteIndex: number, tag: string) => {
    const updatedNotes = [...notes];
    if (!updatedNotes[noteIndex].tags) {
      updatedNotes[noteIndex].tags = [];
    }
    updatedNotes[noteIndex].tags?.push(tag);
    setNotes(updatedNotes);
  };
  
  const handleRemoveTag = (noteIndex: number, tagIndex: number) => {
    const updatedNotes = [...notes];
    updatedNotes[noteIndex].tags?.splice(tagIndex, 1);
    setNotes(updatedNotes);
  };
  
  const handleAddComment = (noteIndex: number, comment: string) => {
    const updatedNotes = [...notes];
    updatedNotes[noteIndex].comment = comment;
    setNotes(updatedNotes);
  };
  
  const handleSendMessage = async (message: string) => {
    // Add user message
    setChatMessages([...chatMessages, { role: 'user', content: message }]);
    
    // Simulate AI response
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: `This is a simulated response to: "${message}"` 
        }
      ]);
    }, 1000);
  };

  const renderVideoSection = () => (
    <div className="video-section w-full">
      {videoUrl ? (
        <VideoPlayer
          videoUrl={videoUrl}
          currentTime={currentTime}
          onTimeUpdate={handleTimeUpdate}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
        />
      ) : (
        <div className="border rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 text-center">
          <p className="text-gray-600 mb-4">No video uploaded yet</p>
          <button
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-all"
            onClick={() => setShowUploadModal(true)}
          >
            Upload Video
          </button>
        </div>
      )}
    </div>
  );

  const renderTranscriptTab = () => (
    <div className="transcript-tab">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/2">
          {renderVideoSection()}
        </div>
        
        <div className="md:w-1/2 flex flex-col">
          {videoUrl && !transcriptData.hasTranscript && !transcriptData.loading && (
            <div className="transcript-actions flex gap-4 mb-6">
              <button
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-all"
                onClick={handleGenerateTranscript}
              >
                <Play size={16} />
                Generate Transcript
              </button>
              <button
                className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-all"
                onClick={handleImportTranscript}
              >
                Import
              </button>
            </div>
          )}
          
          {videoUrl && transcriptData.hasTranscript && (
            <div className="transcript-actions flex gap-4 mb-6">
              <button
                className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-all"
                onClick={handleExportTranscript}
              >
                Export
              </button>
            </div>
          )}
          
          <TranscriptPlayer
            segments={transcriptData.segments}
            currentTime={currentTime}
            onSegmentClick={handleSegmentClick}
            loading={transcriptData.loading}
            hasTranscript={transcriptData.hasTranscript}
            showTimestamps={showTimestamps}
            playbackSpeed={playbackSpeed}
            isExpanded={isTranscriptExpanded}
            onToggleTimestamps={handleToggleTimestamps}
            onChangePlaybackSpeed={handleChangePlaybackSpeed}
            onToggleExpand={handleToggleExpand}
          />
        </div>
      </div>
    </div>
  );

  const renderNotesTab = () => (
    <div className="notes-tab">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/2">
          {renderVideoSection()}
        </div>
        
        <div className="md:w-1/2 flex flex-col">
          <NotesPanel 
            notes={notes}
            onNoteClick={handleNoteClick}
            onNoteEdit={handleNoteEdit}
            onNoteDelete={handleNoteDelete}
            onToggleHighlight={handleToggleHighlight}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            onAddComment={handleAddComment}
            suggestedTags={['important', 'question', 'insight', 'follow-up']}
          />
        </div>
      </div>
    </div>
  );

  const renderAIChatTab = () => (
    <div className="ai-chat-tab">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/2">
          {renderVideoSection()}
        </div>
        
        <div className="md:w-1/2 flex flex-col">
          <ChatPanel
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            transcriptAvailable={transcriptData.hasTranscript}
          />
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'transcript':
        return renderTranscriptTab();
      case 'notes':
        return renderNotesTab();
      case 'ai-chat':
        return renderAIChatTab();
      default:
        return renderTranscriptTab();
    }
  };

  return (
    <div className={`project-file-view h-full flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <div className="mb-6 flex items-center">
        <button
          className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 mr-3"
          onClick={onBackToProjects}
          aria-label="Back to projects"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
          {project.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{project.description}</p>
          )}
        </div>
      </div>
      
      {/* Tabs menu */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <TabMenu
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
        />
      </div>
      
      {/* Content area */}
      <div className="flex-1 overflow-auto">
        {renderActiveTab()}
      </div>
      
      {/* Upload modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all">
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
            {/* Modal header */}
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Upload Video</h2>
              <button
                className="p-1.5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setShowUploadModal(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Modal body */}
            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Upload an MP4 video file to transcribe and analyze. You can either drag and drop your file or browse to select.
              </p>
              
              <FileUploadStep onFilesChange={handleFilesChange} initialFiles={uploadedFiles} />
            </div>
            
            {/* Modal footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50">
              <button
                className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors ${
                  uploadedFiles.length > 0 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-blue-400/70 cursor-not-allowed'
                }`}
                onClick={() => {
                  if (uploadedFiles.length > 0) {
                    setShowUploadModal(false);
                  }
                }}
                disabled={uploadedFiles.length === 0}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectFileView; 