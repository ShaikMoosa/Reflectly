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
import MultiStepFlow, { Step } from './components/MultiStepFlow';
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
  start: number;
  end: number;
  isActive?: boolean;
}

interface Note {
  text: string;
  timestamp: number;
  tags?: string[];
  comment?: string;
  isHighlighted?: boolean;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Project {
  id: string;
  title: string;
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
    { id: 1, name: 'Informations' },
    { id: 2, name: 'Upload file' },
    { id: 3, name: 'Summary' }
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
  };

  // Handle project info updates
  const handleProjectInfoChange = (data: ProjectInfo) => {
    setProjectInfo(data);
  };

  // Handle file uploads
  const handleFilesChange = (files: UploadedFile[]) => {
    setUploadedFiles(files);
  };

  // Handle workflow completion
  const handleWorkflowComplete = () => {
    setIsWorkflowComplete(true);
    // Process the collected data
    processWorkflowData();
    
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
    
    // Create a new project
    const newProject: Project = {
      id: uuidv4(),
      title: projectInfo.name,
      thumbnail: '',  // You would generate this
      videoUrl: '',   // You would set this based on upload or other sources
      transcripts: [],
      notes: [],
      chatMessages: [],
      createdAt: new Date().toISOString()
    };
    
    // Add to projects
    setProjects([...projects, newProject]);
  };

  // Define the workflow steps with components
  const workflowSteps: Step[] = [
    {
      id: 1,
      name: 'Information',
      component: <ProjectInfoForm onDataChange={handleProjectInfoChange} initialData={projectInfo} />
    },
    {
      id: 2,
      name: 'Upload',
      component: <FileUploadStep onFilesChange={handleFilesChange} initialFiles={uploadedFiles} />
    },
    {
      id: 3,
      name: 'Summary',
      component: <SummaryStep projectInfo={projectInfo} uploadedFiles={uploadedFiles} />
    }
  ];

  // Function to navigate to the next step
  const goToNextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, totalSteps]);

  // Function to navigate to the previous step
  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // Function to reset the workflow
  const resetWorkflow = useCallback(() => {
    setCurrentStep(1);
    // Reset any other state as needed
    setUploadedFiles([]);
    setSelectedVideoIndex(null);
    setTranscripts([]);
    setCurrentProjectId(null);
  }, []);

  // Update current time when video is playing
  useEffect(() => {
    console.log('[Home] Video URL changed:', videoUrl);
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
    };

    logDebug('Home', 'Adding timeupdate event listener');
    video.addEventListener('timeupdate', updateTime);
    return () => {
      logDebug('Home', 'Removing timeupdate event listener');
      video.removeEventListener('timeupdate', updateTime);
    };
  }, [videoUrl]);

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up main video URL
      if (videoUrl && videoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(videoUrl);
      }
      
      // Clean up any uploaded video URLs
      uploadedVideos.forEach(video => {
        if (video.url.startsWith('blob:')) {
          URL.revokeObjectURL(video.url);
        }
      });
    };
  }, [videoUrl, uploadedVideos]);

  // Auto-scroll to active transcript
  useEffect(() => {
    if (autoScroll && activeItemRef.current && transcriptListRef.current) {
      // Calculate position of active item relative to transcript container
      const container = transcriptListRef.current;
      const activeItem = activeItemRef.current;
      
      // Get positions and dimensions
      const containerRect = container.getBoundingClientRect();
      const activeItemRect = activeItem.getBoundingClientRect();
      
      // Check if active item is not fully visible in the container
      const isAboveVisible = activeItemRect.top < containerRect.top;
      const isBelowVisible = activeItemRect.bottom > containerRect.bottom;
      
      if (isAboveVisible || isBelowVisible) {
        // Scroll the item into view within the container
        activeItem.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [currentTime, autoScroll]);

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
              onCancel={handleWorkflowCancel} 
            />
          </div>
  
          {/* Rest of the content can be conditionally shown here */}
          {isWorkflowComplete && (
            <div>
              {/* Original content here */}
            </div>
          )}
        </div>
      );
    } else if (activePage === 'projects') {
      return (
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-6">My Projects</h1>
          {/* Projects content here */}
        </div>
      );
    } else if (activePage === 'whiteboard') {
      return (
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-6">Whiteboard</h1>
          {/* Whiteboard content here */}
        </div>
      );
    } else if (activePage === 'planner') {
      return (
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-6">Planner</h1>
          {/* Planner content here */}
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