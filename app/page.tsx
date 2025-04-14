'use client';

import React, { useState, useRef, useEffect, Suspense, lazy, useCallback } from 'react';
import { UploadCloud, FileVideo, Clock, Play, Download, Upload, FileText, MessageSquare, Send, Tag, Edit, Check, X, Home as HomeIcon, FolderOpen, Save, Trash2, Pencil, Kanban, ArrowLeft, ArrowRight, CheckCircle, PlayCircle, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useToast } from './components/ui/toast';
import { TranscriptSegmentData } from './components/TranscriptSegment';
import Planner from './components/Planner';
import VideoPlayer from './components/VideoPlayer';
import TranscriptPlayer from './components/TranscriptPlayer';
import { v4 as uuidv4 } from 'uuid';
import Whiteboard from './components/Whiteboard';
import MultiStepFlow from './components/MultiStepFlow';
import ProjectInfoForm, { ProjectInfo } from './components/ProjectInfoForm';
import FileUploadStep, { UploadedFile } from './components/FileUploadStep';
import SummaryStep from './components/SummaryStep';
import SideNavigation from './components/SideNavigation';

// Debug utility for consistent logging
const logDebug = (component: string, action: string, data?: any) => {
  console.log(`[${component}] ${action}`, data !== undefined ? data : '');
};

const LazyWhiteboard = lazy(() => import('./components/Whiteboard'));

// Define types
interface TranscriptSegment {
  id: string;
  text: string;
  timestamp: number;
  start_time: number;
  end_time: number;
  isActive?: boolean;
}

interface Note {
  id: string;
  text: string;
  timestamp: number;
  segmentId?: string;
  tags: string[];
  comments: string[];
  highlightColor?: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: number;
}

interface Project {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  videoUrl: string;
  transcripts: TranscriptSegment[];
  notes: Note[];
  chatMessages: ChatMessage[];
  createdAt: string;
}

// Define a type for the active page
type PageType = 'home' | 'projects' | 'whiteboard' | 'planner';

export default function Home() {
  console.log('[Home] Component rendering');

  // Project workflow data
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    name: '',
    description: '',
    category: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isWorkflowComplete, setIsWorkflowComplete] = useState(false);

  // Step management for the workflow
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 3;

  const steps = [
    { id: '1', title: 'Information' },
    { id: '2', title: 'Upload Video' },
    { id: '3', title: 'Transcript Options' }
  ];

  const [uploadedVideos, setUploadedVideos] = useState<{ file: File, url: string, title: string }[]>([]);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [transcripts, setTranscripts] = useState<TranscriptSegment[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [activeTab, setActiveTab] = useState<'transcript' | 'chat' | 'planner'>('transcript');
  const [notes, setNotes] = useState<Note[]>([]);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
  const [suggestedTags, setSuggestedTags] = useState(['Pain point', 'Goal', 'Role', 'Motivation', 'Behavior', 'User journey', 'Positive']);
  // Navigation state
  const [activePage, setActivePage] = useState<PageType>('home');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const importTranscriptRef = useRef<HTMLInputElement>(null);
  const transcriptListRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const toast = useToast();

  // Handle page navigation
  const handlePageNavigation = (page: PageType) => {
    setActivePage(page);
    
    // If navigating to projects and we just completed workflow
    if (page === 'projects' && isWorkflowComplete) {
      setIsWorkflowComplete(false);
    }
  };

  // Handle project info updates
  const handleProjectInfoChange = (data: ProjectInfo) => {
    setProjectInfo(data);
  };

  // Handle file uploads
  const handleFilesChange = (files: UploadedFile[]) => {
    setUploadedFiles(files);
    
    // Process the first video file to get URL
    if (files.length > 0) {
      const videoFile = files[0].file;
      setVideoFile(videoFile);
      const url = URL.createObjectURL(videoFile);
      setVideoUrl(url);
      setVideoTitle(videoFile.name);
    }
  };

  // Handle workflow completion
  const handleWorkflowComplete = () => {
    setIsWorkflowComplete(true);
    // Process the collected data
    processWorkflowData();
    
    // Navigate to projects page
    setActivePage('projects');
    
    toast.addToast({
      title: "Project Created",
      description: "Your project has been successfully created",
      variant: "success"
    });
  };

  // Handle workflow cancellation
  const handleWorkflowCancel = () => {
    // Reset workflow state
    setProjectInfo({
      name: '',
      description: '',
      category: ''
    });
    setUploadedFiles([]);
    setIsWorkflowComplete(false);
  };

  // Process the collected workflow data
  const processWorkflowData = () => {
    // This is where you would actually process the data
    console.log('Processing project data:', {
      projectInfo,
      uploadedFiles
    });
    
    // Create a proper URL for the video if available
    let videoFileUrl = '';
    if (uploadedFiles.length > 0 && uploadedFiles[0].file) {
      videoFileUrl = URL.createObjectURL(uploadedFiles[0].file);
    }
    
    // Create a new project
    const newProject: Project = {
      id: uuidv4(),
      title: projectInfo.name,
      description: projectInfo.description,
      thumbnail: '',  // You would generate this
      videoUrl: videoFileUrl,
      transcripts: [],
      notes: [],
      chatMessages: [],
      createdAt: new Date().toISOString()
    };
    
    // Add to projects
    setProjects([...projects, newProject]);
    
    // Set as current project
    setCurrentProjectId(newProject.id);
  };

  // Handle transcript generation
  const handleGenerateTranscript = () => {
    if (!currentProjectId) return;
    
    // Find the current project
    const project = projects.find(p => p.id === currentProjectId);
    if (!project) return;
    
    setIsTranscribing(true);
    
    // Mock transcript generation - would be replaced with actual API call
    setTimeout(() => {
      // Generate some sample transcript segments
      const mockTranscripts: TranscriptSegment[] = Array.from({ length: 10 }, (_, i) => ({
        id: uuidv4(),
        text: `This is transcript segment ${i+1}. It contains sample text that would normally be generated by a transcription service.`,
        timestamp: i * 30,
        start_time: i * 30,
        end_time: (i + 1) * 30 - 1
      }));
      
      // Update the project with transcripts
      const updatedProjects = projects.map(p => {
        if (p.id === currentProjectId) {
          return {...p, transcripts: mockTranscripts};
        }
        return p;
      });
      
      setProjects(updatedProjects);
      setTranscripts(mockTranscripts);
      setIsTranscribing(false);
      
      toast.addToast({
        title: "Transcript Generated",
        description: "The transcript has been successfully generated",
        variant: "success"
      });
      
      // Navigate to projects page
      setActivePage('projects');
    }, 3000);
  };
  
  // Handle transcript import
  const handleImportTranscript = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentProjectId) return;
    
    // Read the file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        
        // Validate and process the imported data
        if (Array.isArray(importedData)) {
          const processedTranscripts: TranscriptSegment[] = importedData.map((item, index) => ({
            id: uuidv4(),
            text: item.text || '',
            timestamp: item.timestamp || index * 30,
            start_time: item.start_time || index * 30,
            end_time: item.end_time || (index + 1) * 30 - 1
          }));
          
          // Update the project with transcripts
          const updatedProjects = projects.map(p => {
            if (p.id === currentProjectId) {
              return {...p, transcripts: processedTranscripts};
            }
            return p;
          });
          
          setProjects(updatedProjects);
          setTranscripts(processedTranscripts);
          
          toast.addToast({
            title: "Transcript Imported",
            description: "The transcript has been successfully imported",
            variant: "success"
          });
          
          // Navigate to projects page
          setActivePage('projects');
        }
      } catch (error) {
        console.error('Error parsing imported transcript:', error);
        toast.addToast({
          title: "Import Failed",
          description: "Failed to parse the imported transcript file",
          variant: "destructive"
        });
      }
    };
    
    reader.readAsText(file);
  };
  
  // Handle export transcript
  const handleExportTranscript = () => {
    if (!currentProjectId) return;
    
    // Find the current project
    const project = projects.find(p => p.id === currentProjectId);
    if (!project || !project.transcripts.length) {
      toast.addToast({
        title: "Export Failed",
        description: "No transcript available to export",
        variant: "destructive"
      });
      return;
    }
    
    // Prepare the transcript data for export
    const exportData = project.transcripts.map(segment => ({
      id: segment.id,
      text: segment.text,
      start_time: segment.start_time,
      end_time: segment.end_time
    }));
    
    // Create a blob and download link
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title}-transcript.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.addToast({
      title: "Transcript Exported",
      description: "The transcript has been successfully exported",
      variant: "success"
    });
  };

  // Define the workflow steps with components
  const workflowSteps = [
    {
      id: '1',
      title: 'Information',
      component: <ProjectInfoForm onDataChange={handleProjectInfoChange} initialData={projectInfo} />
    },
    {
      id: '2',
      title: 'Upload Video',
      component: <FileUploadStep onFilesChange={handleFilesChange} initialFiles={uploadedFiles} />
    },
    {
      id: '3',
      title: 'Transcript Options',
      component: (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold mb-6">Transcript Options</h2>
          
          {/* Video preview if available */}
          {videoUrl && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Video Preview</h3>
              <video 
                className="w-full max-h-[300px] object-contain bg-black rounded-lg"
                src={videoUrl} 
                controls
              />
            </div>
          )}
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Transcript Generation</h3>
            <p className="text-gray-600">Select how you would like to proceed with the transcript:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <button
                onClick={handleGenerateTranscript}
                className="p-6 border rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors flex flex-col items-center gap-3"
              >
                <FileText size={32} />
                <span className="font-medium">Generate Transcript</span>
                <span className="text-sm text-center">
                  Automatically generate transcript from your video
                </span>
              </button>
              
              <div 
                onClick={() => importTranscriptRef.current?.click()}
                className="p-6 border rounded-lg bg-secondary hover:bg-secondary-hover transition-colors flex flex-col items-center gap-3 cursor-pointer"
              >
                <Upload size={32} />
                <span className="font-medium">Import JSON</span>
                <span className="text-sm text-center">
                  Import existing transcript in JSON format
                </span>
                <input 
                  type="file" 
                  ref={importTranscriptRef}
                  onChange={handleImportTranscript}
                  accept=".json"
                  className="hidden"
                />
              </div>
              
              <button
                onClick={handleExportTranscript}
                disabled={!transcripts.length}
                className="p-6 border rounded-lg bg-accent hover:bg-accent-hover transition-colors flex flex-col items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={32} />
                <span className="font-medium">Export Transcript</span>
                <span className="text-sm text-center">
                  Export the generated transcript as JSON
                </span>
              </button>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Handle time update from video
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  // Handle play/pause from video
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Handle seeking to a specific timestamp
  const handleSeekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Render project details page 
  const renderProjectDetails = () => {
    if (!currentProjectId) return null;
    
    const project = projects.find(p => p.id === currentProjectId);
    if (!project) return null;
    
    return (
      <div className="app-container">
        <div className="main-content">
          <div className="modern-card mb-6">
            <div className="card-header">
              <h2 className="card-title">{project.title}</h2>
            </div>
            <div className="card-content">
              <div className="mb-6">
                <VideoPlayer 
                  videoUrl={project.videoUrl}
                  currentTime={currentTime}
                  onTimeUpdate={handleTimeUpdate}
                  isPlaying={isPlaying}
                  onPlayPause={handlePlayPause}
                />
              </div>
              
              <div className="mt-6">
                <TranscriptPlayer 
                  segments={project.transcripts.map(t => ({
                    id: t.id,
                    text: t.text,
                    start_time: t.start_time,
                    end_time: t.end_time
                  }))}
                  currentTime={currentTime}
                  onSegmentClick={handleSeekTo}
                  loading={isTranscribing}
                  hasTranscript={project.transcripts.length > 0}
                  showTimestamps={showTimestamps}
                  playbackSpeed={playbackSpeed}
                  isExpanded={true}
                  highlightedSegments={[]}
                  onToggleTimestamps={() => setShowTimestamps(!showTimestamps)}
                  onChangePlaybackSpeed={(speed) => setPlaybackSpeed(speed)}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="notes-sidebar">
          <div className="modern-card h-full">
            <div className="card-header">
              <h2 className="card-title">My Notes</h2>
              <button className="btn btn-primary btn-sm">
                <Plus size={16} className="mr-1" /> Add Note
              </button>
            </div>
            <div className="card-content h-[calc(100%-60px)] overflow-y-auto">
              {project.notes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText size={40} className="mx-auto mb-3 opacity-50" />
                  <p>No notes yet</p>
                  <p className="text-sm mt-2">Click on the "Add Note" button to create your first note</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {project.notes.map(note => (
                    <div key={note.id} className="p-3 border rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{note.text}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(note.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button className="p-1 text-gray-500 hover:text-gray-700">
                            <Pencil size={14} />
                          </button>
                          <button className="p-1 text-gray-500 hover:text-red-500">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {note.tags.map((tag, idx) => (
                            <span key={idx} className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main render based on active page
  const renderPageContent = () => {
    if (activePage === 'home') {
      return (
        <div className="container mx-auto py-8 px-4">
          {/* Multi-step flow container */}
          <div className="max-w-5xl mx-auto mb-8">
            <MultiStepFlow 
              steps={workflowSteps} 
              onComplete={handleWorkflowComplete} 
            />
          </div>
        </div>
      );
    } else if (activePage === 'projects') {
      // If we have a selected project
      if (currentProjectId) {
        return renderProjectDetails();
      }
      
      // Project listing
      return (
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-6">My Projects</h1>
          
          {projects.length === 0 ? (
            <div className="text-center py-16">
              <FolderOpen size={48} className="mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-medium mb-2">No projects yet</h2>
              <p className="text-gray-500 mb-6">Create your first project to get started</p>
              <button 
                onClick={() => setActivePage('home')}
                className="btn btn-primary"
              >
                <Plus size={16} className="mr-2" /> Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <div 
                  key={project.id} 
                  className="modern-card hover:shadow-lg transition-shadow cursor-pointer hover-scale"
                  onClick={() => setCurrentProjectId(project.id)}
                >
                  <div className="h-40 bg-gray-200 rounded-t-lg overflow-hidden">
                    {project.videoUrl ? (
                      <video 
                        src={project.videoUrl} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <FileVideo size={40} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="text-lg font-medium">{project.title}</h2>
                    {project.description && (
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">{project.description}</p>
                    )}
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-xs text-gray-500">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                          {project.transcripts.length} segments
                        </span>
                        <span className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-0.5">
                          {project.notes.length} notes
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else if (activePage === 'whiteboard') {
      return (
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-6">Whiteboard</h1>
          <Suspense fallback={<div>Loading whiteboard...</div>}>
            <LazyWhiteboard />
          </Suspense>
        </div>
      );
    } else if (activePage === 'planner') {
      return (
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-6">Planner</h1>
          <Planner />
        </div>
      );
    }
    
    return null;
  };

  // Main layout with sidebar and content
  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <SideNavigation 
        activePage={activePage}
        onNavigate={handlePageNavigation}
      />
      
      <div className="p-4 lg:ml-64">
        {renderPageContent()}
      </div>
    </div>
  );
} 