'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileVideo, Clock, Play, Download, Upload, Sun, Moon, FileText, MessageSquare, Send, Tag, Edit, Check, X, Home as HomeIcon, FolderOpen, Save, Trash2, Pencil, Kanban } from 'lucide-react';
import { useToast } from './components/ui/toast';
import { useTheme } from 'next-themes';
import Whiteboard from './components/Whiteboard';
import Planner from './components/Planner';
import VideoPlayer from './components/VideoPlayer';
import TranscriptPlayer from './components/TranscriptPlayer';
import { TranscriptSegmentData } from './components/TranscriptSegment';

export default function Home() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [transcripts, setTranscripts] = useState<any[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [activeTab, setActiveTab] = useState<'transcript' | 'notes' | 'ai-chat'>('transcript');
  const [notes, setNotes] = useState<{
    text: string, 
    timestamp: number, 
    tags?: string[], 
    comment?: string, 
    isHighlighted?: boolean
  }[]>([]);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
  const [suggestedTags, setSuggestedTags] = useState(['Pain point', 'Goal', 'Role', 'Motivation', 'Behavior', 'User journey', 'Positive']);
  // New state for navigation and projects
  const [activePage, setActivePage] = useState<'home' | 'projects' | 'whiteboard' | 'planner'>('home');
  const [projects, setProjects] = useState<{
    id: string,
    title: string,
    thumbnail: string,
    videoUrl: string,
    transcripts: any[],
    notes: any[],
    chatMessages: {role: 'user' | 'assistant', content: string}[],
    createdAt: string
  }[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const importTranscriptRef = useRef<HTMLInputElement>(null);
  const transcriptListRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const toast = useToast();
  const { theme, setTheme } = useTheme();

  // Update current time when video is playing
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener('timeupdate', updateTime);
    return () => {
      video.removeEventListener('timeupdate', updateTime);
    };
  }, [videoUrl]);

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (videoUrl && videoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setIsDarkMode(newTheme === 'dark');
  };

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'video/mp4') {
      setIsUploading(true);
      setVideoFile(file);
      setError(null);
      setCurrentProjectId(null); // Reset current project ID when uploading a new file
      
      // Set video title from file name
      const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove file extension
      setVideoTitle(fileName);
      
      try {
        // Clean up previous URL object
        if (videoUrl && videoUrl.startsWith('blob:')) {
          URL.revokeObjectURL(videoUrl);
        }
        
        // Create new object URL
        const newUrl = URL.createObjectURL(file);
        
        // Simulate loading for better UX
        setTimeout(() => {
          setVideoUrl(newUrl);
          setTranscripts([]);
          setIsUploading(false);
        }, 500);
      } catch (error) {
        console.error('Error creating object URL:', error);
        setIsUploading(false);
        setError('Failed to process video file. Please try again.');
      }
    } else if (file) {
      setError('Please upload an MP4 file. Other formats are not supported at this time.');
    }
  };

  // Add drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('drag-active');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-active');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-active');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      if (file.type === 'video/mp4') {
        setIsUploading(true);
        setVideoFile(file);
        setError(null);
        setCurrentProjectId(null); // Reset current project ID when uploading a new file
        
        // Set video title from file name
        const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove file extension
        setVideoTitle(fileName);
        
        try {
          // Clean up previous URL object
          if (videoUrl && videoUrl.startsWith('blob:')) {
            URL.revokeObjectURL(videoUrl);
          }
          
          // Create new object URL
          const newUrl = URL.createObjectURL(file);
          
          // Simulate loading for better UX
          setTimeout(() => {
            setVideoUrl(newUrl);
            setTranscripts([]);
            setIsUploading(false);
          }, 500);
        } catch (error) {
          console.error('Error creating object URL:', error);
          setIsUploading(false);
          setError('Failed to process video file. Please try again.');
        }
      } else {
        setError('Please upload an MP4 file. Other formats are not supported at this time.');
      }
    }
  };

  // Manual trigger for file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleTranscribe = async () => {
    if (!videoFile) return;

    setIsTranscribing(true);
    setError(null);
    
    try {
      console.log('Starting transcription process...');
      
      // Create a FormData object to send the video file
      const formData = new FormData();
      formData.append('file', videoFile);
      
      // Call our API endpoint
      console.log('Calling API endpoint...');
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to transcribe video');
      }
      
      const data = await response.json();
      console.log('Received transcript data:', data);
      
      if (data.transcripts && data.transcripts.length > 0) {
        setTranscripts(data.transcripts);
      } else {
        // Fallback in case no transcripts were generated
        setError('No speech detected in the video or the transcription failed.');
      }
    } catch (error: any) {
      console.error('Error transcribing video:', error);
      setError(error.message || 'Failed to generate transcript. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleTranscriptClick = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      videoRef.current.play().catch(err => {
        console.error("Playback error:", err);
        setError('Failed to play video at the selected timestamp.');
      });
    }
  };

  // Format time in seconds to MM:SS format
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Find active transcript based on current time
  const activeTranscriptIndex = transcripts.findIndex(
    (transcript) => currentTime >= transcript.start && 
    (transcript.end ? currentTime <= transcript.end : true)
  );

  // Add import/export transcript functions
  const handleExportTranscript = () => {
    if (transcripts.length === 0) {
      setError('No transcript available to export');
      return;
    }

    try {
      // Create transcript data object with metadata
      const transcriptData = {
        title: videoTitle,
        exportedAt: new Date().toISOString(),
        transcripts: transcripts
      };
      
      // Convert to JSON string
      const jsonString = JSON.stringify(transcriptData, null, 2);
      
      // Create a blob and download link
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create temporary link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${videoTitle.replace(/\s+/g, '_')}_transcript.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('Transcript exported successfully');
    } catch (error) {
      console.error('Error exporting transcript:', error);
      setError('Failed to export transcript');
    }
  };

  const handleImportTranscript = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset the file input
    if (event.target) {
      event.target.value = '';
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Validate the imported data
        if (!data.transcripts || !Array.isArray(data.transcripts)) {
          throw new Error('Invalid transcript format');
        }
        
        // Set the imported transcripts
        setTranscripts(data.transcripts);
        
        // Update title if available
        if (data.title) {
          setVideoTitle(data.title);
        }
        
        console.log('Transcript imported successfully');
      } catch (error) {
        console.error('Error importing transcript:', error);
        setError('Failed to import transcript: Invalid format');
      }
    };
    
    reader.onerror = () => {
      setError('Failed to read the transcript file');
    };
    
    reader.readAsText(file);
  };

  const triggerImportTranscript = () => {
    importTranscriptRef.current?.click();
  };

  // Handle copying transcript text
  const handleCopyTranscript = () => {
    // Create a plain text version of the transcript
    const plainText = transcripts.map(t => `${formatTime(t.start)} - ${t.text}`).join('\n');
    navigator.clipboard.writeText(plainText)
      .then(() => {
        // Could add a toast notification here
        console.log('Transcript copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy transcript:', err);
        setError('Failed to copy text to clipboard');
      });
  };

  // Inside the component, add this function to format transcript for context
  const getTranscriptContext = () => {
    return transcripts.map(t => `${formatTime(t.start)} - ${t.text}`).join('\n');
  };

  // Replace the handleChatSubmit function with this version
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || transcripts.length === 0) return;

    // Add user message
    const newMessages = [
      ...chatMessages,
      { role: 'user' as const, content: chatInput }
    ];
    setChatMessages(newMessages);
    
    // Clear input
    setChatInput('');
    
    try {
      // Show loading state
      setChatMessages([
        ...newMessages,
        { role: 'assistant' as const, content: "Thinking..." }
      ]);
      
      // Call the chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
          transcript: getTranscriptContext()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      // Parse the JSON response
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Update messages with the AI response
      const updatedMessages = [
        ...newMessages,
        { role: 'assistant' as const, content: data.response }
      ];
      setChatMessages(updatedMessages);
      
      // Save project if we have a current project
      if (currentProjectId && videoUrl) {
        // Find the existing project
        const projectIndex = projects.findIndex(p => p.id === currentProjectId);
        
        if (projectIndex !== -1) {
          // Create updated project with new chat messages
          const updatedProject = {
            ...projects[projectIndex],
            chatMessages: updatedMessages
          };
          
          // Update the project in the array
          const updatedProjects = [...projects];
          updatedProjects[projectIndex] = updatedProject;
          
          // Update state and localStorage
          setProjects(updatedProjects);
          localStorage.setItem('reflectly-projects', JSON.stringify(updatedProjects));
        }
      }
    } catch (error: any) {
      console.error('Error in chat:', error);
      setError('Failed to get AI response. Please try again.');
      
      // Remove the loading message
      setChatMessages(newMessages);
    }
  };

  // Function to add a note at current timestamp
  const addNote = () => {
    if (videoRef.current) {
      const text = getTranscriptTextAtTime(currentTime) || `Note at ${formatTime(currentTime)}`;
      const newNote = {
        text: text,
        timestamp: currentTime,
        tags: [],
        isHighlighted: false
      };
      setNotes([...notes, newNote]);
    }
  };

  // Get transcript text at the current timestamp
  const getTranscriptTextAtTime = (time: number): string | null => {
    const transcript = transcripts.find(
      t => time >= t.start && (t.end ? time <= t.end : true)
    );
    return transcript ? transcript.text : null;
  };

  // Toggle highlight status for a note
  const toggleHighlight = (index: number) => {
    const updatedNotes = [...notes];
    updatedNotes[index].isHighlighted = !updatedNotes[index].isHighlighted;
    setNotes(updatedNotes);
  };

  // Add a tag to a note
  const addTagToNote = (index: number) => {
    if (!tagInput.trim()) return;
    
    const updatedNotes = [...notes];
    const tags = updatedNotes[index].tags || [];
    
    if (!tags.includes(tagInput)) {
      updatedNotes[index].tags = [...tags, tagInput];
      setNotes(updatedNotes);
      
      // Add to suggested tags if not already there
      if (!suggestedTags.includes(tagInput)) {
        setSuggestedTags([...suggestedTags, tagInput]);
      }
    }
    
    setTagInput('');
    setIsAddingTag(false);
  };

  // Remove a tag from a note
  const removeTagFromNote = (noteIndex: number, tagIndex: number) => {
    const updatedNotes = [...notes];
    const tags = updatedNotes[noteIndex].tags || [];
    updatedNotes[noteIndex].tags = tags.filter((_, i) => i !== tagIndex);
    setNotes(updatedNotes);
  };

  // Add a comment to a note
  const addCommentToNote = (index: number) => {
    if (!commentInput.trim()) return;
    
    const updatedNotes = [...notes];
    updatedNotes[index].comment = commentInput;
    setNotes(updatedNotes);
    
    setCommentInput('');
    setIsAddingComment(false);
  };

  // Handle editing note text
  const startEditingNote = (index: number) => {
    setEditingNoteIndex(index);
  };

  const saveNoteEdit = (index: number, newText: string) => {
    if (!newText.trim()) return;
    
    const updatedNotes = [...notes];
    updatedNotes[index].text = newText;
    setNotes(updatedNotes);
    setEditingNoteIndex(null);
  };

  const cancelNoteEdit = () => {
    setEditingNoteIndex(null);
  };

  // Function to save current project
  const saveProject = () => {
    if (!videoUrl || !videoTitle) {
      toast.addToast({
        title: "Error",
        description: "Cannot save project: No video loaded",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create thumbnail from current video frame
      const video = videoRef.current;
      let thumbnailUrl = '';
      
      if (video) {
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 180;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        thumbnailUrl = canvas.toDataURL('image/jpeg');
      }
      
      // Check if we're updating an existing project or creating a new one
      if (currentProjectId) {
        // Find the existing project
        const projectIndex = projects.findIndex(p => p.id === currentProjectId);
        
        if (projectIndex !== -1) {
          // Create updated project
          const updatedProject = {
            ...projects[projectIndex],
            title: videoTitle,
            thumbnail: thumbnailUrl || projects[projectIndex].thumbnail,
            videoUrl: videoUrl,
            transcripts: transcripts,
            notes: notes,
            chatMessages: chatMessages,
            // Keep the original creation date
            createdAt: projects[projectIndex].createdAt
          };
          
          // Update the project in the array
          const updatedProjects = [...projects];
          updatedProjects[projectIndex] = updatedProject;
          
          // Update state and localStorage
          setProjects(updatedProjects);
          localStorage.setItem('reflectly-projects', JSON.stringify(updatedProjects));
          
          // Show success toast
          toast.addToast({
            title: "Project Updated",
            description: `${videoTitle} has been updated successfully`,
            variant: "success",
          });
          return;
        }
      }
      
      // Create new project if not updating
      const newProject = {
        id: Date.now().toString(),
        title: videoTitle,
        thumbnail: thumbnailUrl,
        videoUrl: videoUrl,
        transcripts: transcripts,
        notes: notes,
        chatMessages: chatMessages,
        createdAt: new Date().toISOString()
      };
      
      // Add to projects array
      setProjects([...projects, newProject]);
      setCurrentProjectId(newProject.id);
      
      // Save to localStorage
      const allProjects = [...projects, newProject];
      localStorage.setItem('reflectly-projects', JSON.stringify(allProjects));
      
      // Show success toast
      toast.addToast({
        title: "Project Saved",
        description: `${videoTitle} has been saved as a new project`,
        variant: "success",
      });
    } catch (error) {
      console.error('Error saving project:', error);
      toast.addToast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive",
      });
    }
  };

  // Function to load a project
  const loadProject = (project: any) => {
    try {
      setVideoUrl(project.videoUrl);
      setVideoTitle(project.title);
      setTranscripts(project.transcripts);
      setNotes(project.notes);
      setActivePage('home');
      setActiveTab('transcript');
      setCurrentProjectId(project.id);
      
      // Load chat messages if available
      if (project.chatMessages && Array.isArray(project.chatMessages)) {
        setChatMessages(project.chatMessages);
      } else {
        setChatMessages([]);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error loading project:', error);
      setError('Failed to load project');
    }
  };

  // Function to delete a project
  const deleteProject = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation(); // Prevent triggering the card click event
    
    try {
      // Filter out the project to delete
      const updatedProjects = projects.filter(project => project.id !== projectId);
      
      // Update state
      setProjects(updatedProjects);
      
      // Save to localStorage
      localStorage.setItem('reflectly-projects', JSON.stringify(updatedProjects));
      
      // Show success toast
      toast.addToast({
        title: "Project Deleted",
        description: "Project has been deleted successfully",
        variant: "success",
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.addToast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  // Load projects from localStorage on mount
  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem('reflectly-projects');
      if (savedProjects) {
        setProjects(JSON.parse(savedProjects));
      }
    } catch (error) {
      console.error('Error loading saved projects:', error);
    }
  }, []);

  // Update video-related component rendering section
  const renderVideoContent = () => {
    if (!videoUrl) {
      // No video uploaded yet, show upload UI
      return (
        <div 
          className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300"
          onClick={triggerFileInput}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileUpload} 
            accept="video/mp4" 
            className="hidden"
          />
          <div className="card-body items-center text-center p-10">
            <UploadCloud size={48} className="text-primary mb-4" />
            <h3 className="card-title text-lg mb-2">Upload Video</h3>
            <p className="text-sm opacity-70">Click or drag and drop your MP4 video</p>
            <div className="card-actions mt-4">
              <button className="btn btn-primary">Choose File</button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="video-section w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">{videoTitle || 'Untitled Video'}</h2>
          <button className="btn btn-primary btn-sm" onClick={saveProject}>
            <Save size={16} className="mr-2" />
            {currentProjectId ? 'Update Project' : 'Save Project'}
          </button>
        </div>
        <div className="video-container rounded-lg overflow-hidden mb-4">
          <VideoPlayer 
            videoUrl={videoUrl}
            currentTime={currentTime}
            onTimeUpdate={setCurrentTime}
            isPlaying={false}
            onPlayPause={() => {
              if (videoRef.current) {
                if (videoRef.current.paused) {
                  videoRef.current.play();
                } else {
                  videoRef.current.pause();
                }
              }
            }}
          />
        </div>
        <div className="my-4 flex gap-2">
          <button
            onClick={handleTranscribe}
            disabled={isTranscribing || !videoFile}
            className="btn btn-primary"
          >
            {isTranscribing ? (
              <>
                <Clock className="animate-spin mr-2" size={16} />
                Processing...
              </>
            ) : (
              <>
                <FileVideo size={16} className="mr-2" />
                Generate Transcript
              </>
            )}
          </button>
          
          <button
            onClick={triggerImportTranscript}
            className="btn btn-outline"
          >
            <Upload size={16} className="mr-2" />
            Import
          </button>
          <input
            ref={importTranscriptRef}
            type="file"
            accept="application/json"
            onChange={handleImportTranscript}
            className="hidden"
          />
          
          <button
            onClick={handleExportTranscript}
            disabled={transcripts.length === 0}
            className="btn btn-outline"
          >
            <Download size={16} className="mr-2" />
            Export
          </button>
        </div>
        {transcripts.length > 0 && (
          <TranscriptPlayer 
            segments={transcripts.map(transcript => ({
              id: transcript.id || `transcript-${transcript.start}`,
              timestamp: transcript.start,
              text: transcript.text
            }))}
            currentTime={currentTime}
            onSegmentClick={handleTranscriptClick}
          />
        )}
      </div>
    );
  };

  // Fix Whiteboard component reference
  const renderWhiteboardContent = () => {
    return (
      <div className="whiteboard-container">
        <Whiteboard />
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-base-100 text-base-content">
      {/* Side Navigation */}
      <div className="drawer lg:drawer-open fixed">
        <input id="drawer-toggle" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          {/* Page content here */}
        </div> 
        <div className="drawer-side">
          <label htmlFor="drawer-toggle" aria-label="close sidebar" className="drawer-overlay"></label>
          <ul className="menu p-4 w-64 h-full bg-base-200 text-base-content">
            <li className="menu-title mb-4">
              <h2 className="text-xl font-bold">Reflectly</h2>
            </li>
            <li>
              <a 
                className={activePage === 'home' ? 'active' : ''}
                onClick={() => setActivePage('home')}
              >
                <HomeIcon size={20} />
                Home
              </a>
            </li>
            <li>
              <a 
                className={activePage === 'projects' ? 'active' : ''}
                onClick={() => setActivePage('projects')}
              >
                <FolderOpen size={20} />
                Projects
              </a>
            </li>
            <li>
              <a 
                className={activePage === 'whiteboard' ? 'active' : ''}
                onClick={() => setActivePage('whiteboard')}
              >
                <Pencil size={20} />
                Whiteboard
              </a>
            </li>
            <li>
              <a 
                className={activePage === 'planner' ? 'active' : ''}
                onClick={() => setActivePage('planner')}
              >
                <Kanban size={20} />
                Planner
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 lg:ml-64">
        <div className="top-controls">
          <button 
            className="btn btn-circle btn-sm swap swap-rotate" 
            onClick={toggleTheme} 
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {/* Sun icon */}
            <Sun className={theme === 'dark' ? 'block' : 'hidden'} size={20} />
            {/* Moon icon */}
            <Moon className={theme === 'light' ? 'block' : 'hidden'} size={20} />
          </button>

          {videoUrl && activePage === 'home' && (
            <div className="tabs tabs-boxed">
              <button 
                className={`tab ${activeTab === 'transcript' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('transcript')}
              >
                <FileText size={18} className="mr-2" />
                Transcript
              </button>
              <button 
                className={`tab ${activeTab === 'notes' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('notes')}
              >
                <FileText size={18} className="mr-2" />
                Notes
              </button>
              <button 
                className={`tab ${activeTab === 'ai-chat' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('ai-chat')}
              >
                <MessageSquare size={18} className="mr-2" />
                AI Chat
              </button>
            </div>
          )}
        </div>

        {activePage === 'home' ? (
          <div className="container mx-auto p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className={`w-full ${activeTab === 'notes' ? 'md:w-2/3' : 'md:w-full'}`}>
                <div className="card bg-base-100 shadow-lg">
                  <div className="card-body">
                    {renderVideoContent()}
                  </div>
                </div>
              </div>

              {videoUrl && activeTab === 'notes' && (
                <div className="w-full md:w-1/3">
                  <div className="card bg-base-100 shadow-lg h-full">
                    <div className="card-body">
                      <h3 className="card-title">My Notes</h3>
                      <div className="mt-2">
                        <button
                          onClick={addNote}
                          className="btn btn-primary btn-sm"
                        >
                          <FileText size={14} className="mr-2" />
                          Add at {formatTime(currentTime)}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : activePage === 'projects' ? (
          /* Projects Page */
          <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold mb-6">My Projects</h1>
            
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                  <div 
                    key={project.id} 
                    className={`card bg-base-100 shadow-xl cursor-pointer transition-all hover:shadow-2xl 
                              ${project.id === currentProjectId ? 'border-2 border-primary' : ''}`}
                    onClick={() => loadProject(project)}
                  >
                    <figure className="relative h-40">
                      {project.thumbnail ? (
                        <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-base-200">
                          <FileVideo size={48} className="opacity-50" />
                        </div>
                      )}
                      {project.id === currentProjectId && (
                        <div className="badge badge-primary absolute top-2 right-2">
                          Current
                        </div>
                      )}
                    </figure>
                    <div className="card-body">
                      <div className="flex justify-between items-start">
                        <h2 className="card-title">{project.title}</h2>
                        <button 
                          className="btn btn-sm btn-circle btn-ghost"
                          onClick={(e) => deleteProject(e, project.id)}
                          aria-label="Delete project"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-sm opacity-70">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                      <div className="card-actions justify-end mt-2">
                        <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); loadProject(project); }}>
                          Open
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info flex-shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span>No saved projects yet. Upload a video and save it as a project from the Home page.</span>
                </div>
              </div>
            )}
          </div>
        ) : activePage === 'whiteboard' ? (
          renderWhiteboardContent()
        ) : (
          <div className="planner-page">
            <Planner />
          </div>
        )}
      </div>
    </main>
  );
} 