'use client';

import React, { useState, useRef, useEffect, Suspense, lazy, useCallback } from 'react';
import { UploadCloud, FileVideo, Clock, Play, Download, Upload, FileText, MessageSquare, Send, Tag, Edit, Check, X, Home as HomeIcon, FolderOpen, Save, Trash2, Pencil, Kanban, ArrowLeft, ArrowRight, CheckCircle, PlayCircle, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useToast } from './components/ui/toast';
import { TranscriptSegmentData } from './components/TranscriptSegment';
import Planner from './components/Planner';
import VideoPlayer from './components/VideoPlayer';
import TranscriptPlayer from './components/TranscriptPlayer';
import { v4 as uuidv4 } from 'uuid';
import MultiStepFlow from './components/MultiStepFlow';
import ProjectInfoForm, { ProjectInfo } from './components/ProjectInfoForm';
import FileUploadStep, { UploadedFile } from './components/FileUploadStep';
import SummaryStep from './components/SummaryStep';
import SideNavigation from './components/SideNavigation';

// Debug utility for consistent logging
const logDebug = (component: string, action: string, data?: any) => {
  console.log(`[${component}] ${action}`, data !== undefined ? data : '');
};

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
type PageType = 'home' | 'projects' | 'planner';

export default function Home() {
  console.log('[Home] Component rendering');

  // --- Step 1: Project Info (name, description only) ---
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({ name: '', description: '' });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [transcripts, setTranscripts] = useState<TranscriptSegment[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<PageType>('home');
  const [isWorkflowComplete, setIsWorkflowComplete] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const importTranscriptRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // --- Step 1: Project Info ---
  const handleProjectInfoChange = (data: ProjectInfo) => {
    setProjectInfo(data);
  };

  // --- Step 2: Video Upload ---
  const handleFilesChange = (files: UploadedFile[]) => {
    setUploadedFiles(files);
    if (files.length > 0) {
      const file = files[0].file;
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
    } else {
      setVideoFile(null);
      setVideoUrl('');
    }
  };

  // --- Step 3: Transcript Actions ---
  const handleGenerateTranscript = async () => {
    if (!videoFile) return;
    setIsTranscribing(true);

    try {
      // Create form data for the API request
      const formData = new FormData();
      formData.append('file', videoFile);
      
      // Call the transcribe API endpoint
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to transcribe video');
      }
      
      const data = await response.json();
      
      // Transform the API response to match our expected format
      if (data.transcripts && data.transcripts.length > 0) {
        const processedTranscripts: TranscriptSegment[] = data.transcripts.map((item: any) => ({
          id: uuidv4(),
          text: item.text,
          timestamp: item.start,
          start_time: item.start,
          end_time: item.end
        }));
        
        setTranscripts(processedTranscripts);
        createProject(processedTranscripts);
      } else {
        toast.addToast({ 
          title: 'Transcription Failed', 
          description: 'No speech detected or transcription failed', 
          variant: 'destructive' 
        });
      }
    } catch (error: any) {
      console.error('Error transcribing video:', error);
      toast.addToast({ 
        title: 'Transcription Error', 
        description: error.message || 'Failed to generate transcript', 
        variant: 'destructive' 
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleImportTranscript = (event?: React.ChangeEvent<HTMLInputElement>) => {
    if (event) {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          let processedTranscripts: TranscriptSegment[] = [];
          
          // Handle different JSON formats
          if (Array.isArray(importedData)) {
            // Direct array of transcript segments
            processedTranscripts = importedData.map((item, index) => ({
              id: uuidv4(),
              text: item.text || '',
              timestamp: item.timestamp || item.start_time || index * 30,
              start_time: item.start_time || index * 30,
              end_time: item.end_time || (index + 1) * 30 - 1
            }));
          } else if (importedData.transcripts && Array.isArray(importedData.transcripts)) {
            // Object with transcripts array property
            processedTranscripts = importedData.transcripts.map((item: any, index: number) => ({
              id: uuidv4(),
              text: item.text || '',
              timestamp: item.timestamp || item.start_time || index * 30,
              start_time: item.start_time || index * 30,
              end_time: item.end_time || (index + 1) * 30 - 1
            }));
          } else {
            throw new Error("Invalid transcript format");
          }
          
          if (processedTranscripts.length > 0) {
            setTranscripts(processedTranscripts);
            createProject(processedTranscripts);
          } else {
            toast.addToast({ title: 'Import Failed', description: 'No valid transcript segments found in the file', variant: 'destructive' });
          }
        } catch (error) {
          console.error('Transcript import error:', error);
          toast.addToast({ title: 'Import Failed', description: 'Failed to parse the imported transcript file', variant: 'destructive' });
        }
      };
      reader.readAsText(file);
    } else {
      importTranscriptRef.current?.click();
    }
  };

  const handleExportTranscript = () => {
    if (!transcripts.length) return;
    const exportData = transcripts.map(segment => ({
      id: segment.id,
      text: segment.text,
      start_time: segment.start_time,
      end_time: segment.end_time
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectInfo.name}-transcript.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- Create Project and Redirect ---
  const createProject = (transcriptSegments: TranscriptSegment[]) => {
    const newProject: Project = {
      id: uuidv4(),
      title: projectInfo.name,
      description: projectInfo.description,
      thumbnail: '',
      videoUrl: videoUrl,
      transcripts: transcriptSegments,
      notes: [],
      chatMessages: [],
      createdAt: new Date().toISOString()
    };
    setProjects([...projects, newProject]);
    setCurrentProjectId(newProject.id);
    setActivePage('projects');
    setIsWorkflowComplete(true);
    toast.addToast({ title: 'Project Created', description: 'Your project has been successfully created', variant: 'success' });
  };

  // --- Step Definitions ---
  const workflowSteps = [
    {
      id: '1',
      title: 'Information',
      component: (
        <ProjectInfoForm value={projectInfo} onChange={setProjectInfo} />
      ),
      validate: () => !!projectInfo.name.trim()
    },
    {
      id: '2',
      title: 'Upload Video',
      component: <FileUploadStep onFilesChange={handleFilesChange} initialFiles={uploadedFiles} />,
      validate: () => uploadedFiles.length > 0
    },
    {
      id: '3',
      title: 'Transcript Options',
      component: (
        <div>
          {videoUrl && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Video Preview</h3>
              <video ref={videoRef} className="w-full max-h-[300px] object-contain bg-black rounded-lg" src={videoUrl} controls />
            </div>
          )}
          <div className="flex gap-4 mb-4">
            <button onClick={handleGenerateTranscript} className="btn btn-primary" disabled={isTranscribing}>
              Generate Transcript
            </button>
            <button onClick={() => handleImportTranscript()} className="btn btn-secondary">
              Import Transcript (JSON)
              <input type="file" ref={importTranscriptRef} onChange={handleImportTranscript} accept=".json" className="hidden" />
            </button>
            <button onClick={handleExportTranscript} className="btn btn-accent" disabled={!transcripts.length}>
              Export Transcript (JSON)
            </button>
          </div>
          {isTranscribing && <div className="text-blue-600">Generating transcript...</div>}
        </div>
      ),
      validate: () => true // Always allow next, as project is created on transcript action
    }
  ];

  // Handle time update from video
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  // Handle play/pause from video
  const handlePlayPause = () => {
    if (videoRef.current) {
      videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
    }
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
                  isPlaying={videoRef.current?.paused === false}
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
              onComplete={() => {}}
              onCancel={() => {}}
            />
            {/* Add help text for users */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
              <p><strong>Tip:</strong> Fill in all required fields marked with * to proceed to the next step.</p>
            </div>
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
        onNavigate={setActivePage}
      />
      
      <div className="p-4 lg:ml-64">
        {renderPageContent()}
      </div>
    </div>
  );
} 