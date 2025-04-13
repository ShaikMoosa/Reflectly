'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileVideo, Clock, Play, Download, Upload, Sun, Moon, FileText, MessageSquare, Send, Tag, Edit, Check, X, Home as HomeIcon, FolderOpen, Save, Trash2 } from 'lucide-react';
import { useToast } from './components/ui/toast';

export default function Home() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [transcripts, setTranscripts] = useState<any[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
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
  const [activePage, setActivePage] = useState<'home' | 'projects'>('home');
  const [projects, setProjects] = useState<{
    id: string,
    title: string,
    thumbnail: string,
    videoUrl: string,
    transcripts: any[],
    notes: any[],
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
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('light-mode');
  };

  // Apply theme class on mount and theme change
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light-mode');
    } else {
      document.documentElement.classList.add('light-mode');
    }
  }, [isDarkMode]);

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
      setChatMessages([
        ...newMessages,
        { role: 'assistant' as const, content: data.response }
      ]);
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
      
      // Reset other states
      setChatMessages([]);
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

  return (
    <main className={`${isDarkMode ? '' : 'light-mode'} app-layout`}>
      {/* Side Navigation */}
      <div className="side-navigation">
        <div className="logo-container">
          <h2 className="logo">Reflectly</h2>
        </div>
        <nav className="nav-links">
          <button 
            className={`nav-link ${activePage === 'home' ? 'active' : ''}`}
            onClick={() => setActivePage('home')}
          >
            <HomeIcon size={20} />
            <span>Home</span>
          </button>
          <button 
            className={`nav-link ${activePage === 'projects' ? 'active' : ''}`}
            onClick={() => setActivePage('projects')}
          >
            <FolderOpen size={20} />
            <span>Projects</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-area">
        <div className="top-controls">
          <button 
            className="theme-toggle" 
            onClick={toggleTheme} 
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {videoUrl && activePage === 'home' && (
            <div className="tab-menu">
              <button 
                className={`tab-button ${activeTab === 'transcript' ? 'active' : ''}`}
                onClick={() => setActiveTab('transcript')}
              >
                <FileText size={18} />
                Transcript
              </button>
              <button 
                className={`tab-button ${activeTab === 'notes' ? 'active' : ''}`}
                onClick={() => setActiveTab('notes')}
              >
                <FileText size={18} />
                Notes
              </button>
              <button 
                className={`tab-button ${activeTab === 'ai-chat' ? 'active' : ''}`}
                onClick={() => setActiveTab('ai-chat')}
              >
                <MessageSquare size={18} />
                AI Chat
              </button>
            </div>
          )}
        </div>

        {activePage === 'home' ? (
          <div className="app-container">
            <div className={`main-content ${activeTab !== 'notes' ? 'main-content-half' : ''}`}>
              <div className="modern-card content-card">
                {!videoUrl ? (
                  <div 
                    className="upload-container hover:border-accent-purple"
                    onClick={triggerFileInput}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{ 
                      minHeight: '240px',
                      borderStyle: 'dashed',
                      borderWidth: '2px',
                      borderColor: 'var(--upload-border)',
                      backgroundColor: 'var(--upload-bg)'
                    }}
                  >
                    <div className="text-center w-full">
                      <UploadCloud className="mx-auto mb-4 text-secondary" size={48} />
                      <h3 className="mb-2 font-semibold text-lg">Upload Video File</h3>
                      <p className="text-sm mb-4 text-secondary">
                        Click to upload or drag and drop<br />
                        MP4 file (max 100MB)
                      </p>
                      <button className="modern-button mt-2 mx-auto">
                        Choose File
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/mp4"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="content-wrapper">
                    <div className="video-title-container">
                      {videoTitle && <h1 className="video-title">{videoTitle}</h1>}
                      <button 
                        className="save-project-button"
                        onClick={saveProject}
                        title={currentProjectId ? "Update current project" : "Save as new project"}
                      >
                        <Save size={18} />
                        {currentProjectId ? 'Update Project' : 'Save Project'}
                      </button>
                    </div>
                    
                    <div className="video-wrapper">
                      <video
                        ref={videoRef}
                        src={videoUrl}
                        controls
                        className="w-full"
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                    
                    <div className="button-container">
                      {activeTab === 'transcript' && (
                        <>
                          <button
                            onClick={handleTranscribe}
                            disabled={isTranscribing || !videoFile}
                            className="modern-button"
                          >
                            {isTranscribing ? (
                              <>
                                <Clock className="animate-spin" size={16} />
                                Processing...
                              </>
                            ) : (
                              <>
                                <FileVideo size={16} />
                                Generate Transcript
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={triggerImportTranscript}
                            className="modern-button"
                          >
                            <Upload size={16} />
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
                            className="modern-button"
                          >
                            <Download size={16} />
                            Export
                          </button>
                        </>
                      )}

                      {activeTab === 'notes' && (
                        <button
                          onClick={addNote}
                          className="modern-button"
                        >
                          <FileText size={16} />
                          Add Note at {formatTime(currentTime)}
                        </button>
                      )}
                    </div>
                    
                    {activeTab === 'transcript' && transcripts.length > 0 && (
                      <div className="transcript-section">
                        <h2 id="transcript-heading">Transcript</h2>
                        
                        <div className="transcript-controls">
                          <label className="flex items-center">
                            <input 
                              type="checkbox"
                              checked={autoScroll}
                              onChange={(e) => setAutoScroll(e.target.checked)}
                              className="accessibility-checkbox"
                            />
                            Auto-scroll
                          </label>
                          
                          <span 
                            onClick={handleCopyTranscript}
                            className="text-accent-purple"
                          >
                            Copy all text
                          </span>
                        </div>
                        
                        <div className="transcript-container">
                          <div className="transcript-list" ref={transcriptListRef}>
                            {transcripts.map((transcript, index) => (
                              <div
                                key={index}
                                className={`transcript-item ${index === activeTranscriptIndex ? 'active' : ''}`}
                                onClick={() => handleTranscriptClick(transcript.start)}
                                ref={index === activeTranscriptIndex ? activeItemRef : null}
                                tabIndex={0}
                                role="button"
                                aria-pressed={index === activeTranscriptIndex}
                              >
                                <span className="timestamp">{formatTime(transcript.start)}</span>
                                <span className="text-transcript">
                                  {transcript.text}
                                  {transcript.speaker && (
                                    <span className="block text-xs mt-1 text-secondary">
                                      {transcript.speaker}
                                    </span>
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'notes' && (
                      <div className="notes-section">
                        <h2 id="transcript-heading">Transcript</h2>
                        
                        {transcripts.length > 0 ? (
                          <div className="transcript-container">
                            <div className="transcript-list" ref={transcriptListRef}>
                              {transcripts.map((transcript, index) => (
                                <div
                                  key={index}
                                  className={`transcript-item ${index === activeTranscriptIndex ? 'active' : ''}`}
                                >
                                  <div className="transcript-item-content">
                                    <span 
                                      className="timestamp" 
                                      onClick={() => handleTranscriptClick(transcript.start)}
                                      title="Jump to this timestamp"
                                    >
                                      {formatTime(transcript.start)}
                                    </span>
                                    <span className="text-transcript">
                                      {transcript.text}
                                      {transcript.speaker && (
                                        <span className="block text-xs mt-1 text-secondary">
                                          {transcript.speaker}
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                  
                                  <div className="transcript-actions">
                                    <button 
                                      className="note-action-btn"
                                      onClick={() => {
                                        // Check if this transcript is already in notes
                                        const existingNoteIndex = notes.findIndex(
                                          note => Math.abs(note.timestamp - transcript.start) < 0.5 && note.text === transcript.text
                                        );
                                        
                                        if (existingNoteIndex >= 0) {
                                          // Toggle highlight if already exists
                                          toggleHighlight(existingNoteIndex);
                                        } else {
                                          // Add as new highlighted note
                                          const newNote = {
                                            text: transcript.text,
                                            timestamp: transcript.start,
                                            tags: [],
                                            isHighlighted: true
                                          };
                                          setNotes([...notes, newNote]);
                                        }
                                      }}
                                      title="Highlight"
                                    >
                                      <span className="highlight-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <rect x="3" y="3" width="18" height="18" rx="2" />
                                        </svg>
                                      </span>
                                    </button>
                                    
                                    <button 
                                      className="note-action-btn"
                                      onClick={() => {
                                        // First, check if note exists or create one
                                        const existingNoteIndex = notes.findIndex(
                                          note => Math.abs(note.timestamp - transcript.start) < 0.5 && note.text === transcript.text
                                        );
                                        
                                        if (existingNoteIndex === -1) {
                                          // Create new note
                                          const newNote = {
                                            text: transcript.text,
                                            timestamp: transcript.start,
                                            tags: [],
                                            isHighlighted: false
                                          };
                                          setNotes([...notes, newNote]);
                                          // Set this as the editing note to add tag
                                          setEditingNoteIndex(notes.length);
                                          setIsAddingTag(true);
                                          setTimeout(() => tagInputRef.current?.focus(), 0);
                                        } else {
                                          // Set existing note as editing note
                                          setEditingNoteIndex(existingNoteIndex);
                                          setIsAddingTag(true);
                                          setTimeout(() => tagInputRef.current?.focus(), 0);
                                        }
                                      }}
                                      title="Add tag"
                                    >
                                      <Tag size={14} />
                                    </button>
                                    
                                    <button 
                                      className="note-action-btn"
                                      onClick={() => {
                                        // First, check if note exists or create one
                                        const existingNoteIndex = notes.findIndex(
                                          note => Math.abs(note.timestamp - transcript.start) < 0.5 && note.text === transcript.text
                                        );
                                        
                                        if (existingNoteIndex === -1) {
                                          // Create new note
                                          const newNote = {
                                            text: transcript.text,
                                            timestamp: transcript.start,
                                            tags: [],
                                            isHighlighted: false
                                          };
                                          setNotes([...notes, newNote]);
                                          // Set this as the editing note to add comment
                                          setEditingNoteIndex(notes.length);
                                          setIsAddingComment(true);
                                          setTimeout(() => commentInputRef.current?.focus(), 0);
                                        } else {
                                          // Set existing note as editing note
                                          setEditingNoteIndex(existingNoteIndex);
                                          setIsAddingComment(true);
                                          setTimeout(() => commentInputRef.current?.focus(), 0);
                                        }
                                      }}
                                      title="Add comment"
                                    >
                                      <MessageSquare size={14} />
                                    </button>
                                    
                                    <button 
                                      className="note-action-btn"
                                      onClick={() => {
                                        // Add to notes directly
                                        const segmentAlreadyAdded = notes.some(
                                          note => Math.abs(note.timestamp - transcript.start) < 0.5 && note.text === transcript.text
                                        );
                                        
                                        if (!segmentAlreadyAdded) {
                                          const newNote = {
                                            text: transcript.text,
                                            timestamp: transcript.start,
                                            tags: [],
                                            isHighlighted: false
                                          };
                                          setNotes([...notes, newNote]);
                                        }
                                      }}
                                      title="Add to notes"
                                    >
                                      <FileText size={14} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="empty-transcript">
                            <p>No transcript available. Generate a transcript in the Transcript tab.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'ai-chat' && (
                      <div className="chat-section">
                        <h2 id="chat-heading">AI Chat</h2>
                        
                        <div className="chat-container">
                          <div className="chat-messages">
                            {chatMessages.length === 0 ? (
                              <div className="chat-welcome">
                                <p>Chat with AI about this video. Ask questions about the content or request summaries.</p>
                                {transcripts.length === 0 && (
                                  <p className="text-accent-red mt-2">
                                    Note: Please generate or import a transcript first to enable AI chat functionality.
                                  </p>
                                )}
                              </div>
                            ) : (
                              chatMessages.map((message, index) => (
                                <div key={index} className={`chat-message ${message.role}`}>
                                  <div className="message-content">{message.content}</div>
                                </div>
                              ))
                            )}
                          </div>
                          
                          <form onSubmit={handleChatSubmit} className="chat-input-container">
                            <input
                              type="text"
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              placeholder="Type your message..."
                              className="chat-input"
                              ref={chatInputRef}
                              disabled={transcripts.length === 0}
                            />
                            <button 
                              type="submit" 
                              className="chat-send-button"
                              disabled={transcripts.length === 0}
                            >
                              <Send size={16} />
                            </button>
                          </form>
                        </div>
                      </div>
                    )}
                    
                    {error && (
                      <div className="error-message">
                        {error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Notes sidebar - right side */}
            {videoUrl && activeTab === 'notes' && (
              <div className="notes-sidebar">
                <div className="modern-card">
                  <div className="card-header">
                    <h3 className="notes-subheading">My Notes</h3>
                    <div className="notes-actions">
                      <button
                        onClick={addNote}
                        className="modern-button small"
                      >
                        <FileText size={14} />
                        Add at {formatTime(currentTime)}
                      </button>
                    </div>
                  </div>
                  
                  {notes.length > 0 ? (
                    <div className="user-notes">
                      {notes.map((note, index) => (
                        <div key={`note-${index}`} className="note-item">
                          <div className="note-header">
                            <span 
                              className="timestamp" 
                              onClick={() => handleTranscriptClick(note.timestamp)}
                            >
                              {formatTime(note.timestamp)}
                            </span>
                            <div className="note-actions">
                              <button 
                                className="note-action-btn"
                                onClick={() => toggleHighlight(index)}
                                aria-label={note.isHighlighted ? "Remove highlight" : "Highlight"}
                              >
                                <span className={`highlight-icon ${note.isHighlighted ? 'active' : ''}`}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                  </svg>
                                </span>
                              </button>
                              <button 
                                className="note-action-btn"
                                onClick={() => {
                                  setIsAddingTag(true);
                                  setEditingNoteIndex(index);
                                  setTimeout(() => tagInputRef.current?.focus(), 0);
                                }}
                                aria-label="Add tag"
                              >
                                <Tag size={14} />
                              </button>
                              <button 
                                className="note-action-btn"
                                onClick={() => startEditingNote(index)}
                                aria-label="Edit note"
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                className="note-action-btn delete"
                                onClick={() => {
                                  const updatedNotes = [...notes];
                                  updatedNotes.splice(index, 1);
                                  setNotes(updatedNotes);
                                }}
                                aria-label="Delete note"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="note-content">
                            {editingNoteIndex === index ? (
                              <div className="note-edit">
                                <textarea 
                                  defaultValue={note.text}
                                  className="note-edit-input"
                                  autoFocus
                                />
                                <div className="note-edit-actions">
                                  <button 
                                    className="note-edit-btn save"
                                    onClick={(e) => {
                                      const textarea = e.currentTarget.parentElement?.previousElementSibling as HTMLTextAreaElement;
                                      saveNoteEdit(index, textarea.value);
                                    }}
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button 
                                    className="note-edit-btn cancel"
                                    onClick={cancelNoteEdit}
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <span className={`note-text ${note.isHighlighted ? 'highlighted' : ''}`}>
                                {note.text}
                              </span>
                            )}

                            {/* Tags */}
                            {note.tags && note.tags.length > 0 && (
                              <div className="note-tags">
                                {note.tags.map((tag, tagIndex) => (
                                  <span key={tagIndex} className="note-tag">
                                    {tag}
                                    <button 
                                      className="remove-tag-btn"
                                      onClick={() => removeTagFromNote(index, tagIndex)}
                                      aria-label={`Remove ${tag} tag`}
                                    >
                                      <X size={12} />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Comment */}
                            {note.comment && (
                              <div className="note-comment">
                                <p>{note.comment}</p>
                              </div>
                            )}

                            {/* Add comment button if no comment exists */}
                            {!note.comment && !isAddingComment && (
                              <button 
                                className="add-comment-btn"
                                onClick={() => {
                                  setIsAddingComment(true);
                                  setEditingNoteIndex(index);
                                  setTimeout(() => commentInputRef.current?.focus(), 0);
                                }}
                              >
                                Add a comment...
                              </button>
                            )}

                            {/* Tag input form */}
                            {isAddingTag && editingNoteIndex === index && (
                              <div className="tag-input-container">
                                <input
                                  ref={tagInputRef}
                                  type="text"
                                  value={tagInput}
                                  onChange={(e) => setTagInput(e.target.value)}
                                  placeholder="Enter a tag..."
                                  className="tag-input"
                                />
                                <div className="tag-input-actions">
                                  <button 
                                    className="tag-input-btn save"
                                    onClick={() => addTagToNote(index)}
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button 
                                    className="tag-input-btn cancel"
                                    onClick={() => {
                                      setIsAddingTag(false);
                                      setTagInput('');
                                    }}
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                                {/* Suggested tags */}
                                {tagInput.length === 0 && (
                                  <div className="suggested-tags">
                                    <p className="suggested-tags-title">Get started with a tag</p>
                                    <div className="suggested-tags-list">
                                      {suggestedTags.map((tag, i) => (
                                        <button 
                                          key={i} 
                                          className="suggested-tag-btn"
                                          onClick={() => {
                                            setTagInput(tag);
                                            addTagToNote(index);
                                          }}
                                        >
                                          {tag}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Comment input form */}
                            {isAddingComment && editingNoteIndex === index && (
                              <div className="comment-input-container">
                                <textarea
                                  ref={commentInputRef}
                                  value={commentInput}
                                  onChange={(e) => setCommentInput(e.target.value)}
                                  placeholder="Add your comment..."
                                  className="comment-input"
                                  rows={3}
                                />
                                <div className="comment-input-actions">
                                  <button 
                                    className="comment-input-btn save"
                                    onClick={() => addCommentToNote(index)}
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button 
                                    className="comment-input-btn cancel"
                                    onClick={() => {
                                      setIsAddingComment(false);
                                      setCommentInput('');
                                    }}
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-notes">
                      <p>No notes yet. Add notes by clicking the button above or from the transcript.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Projects Page */
          <div className="projects-page">
            <h1 className="page-title">My Projects</h1>
            
            {projects.length > 0 ? (
              <div className="projects-grid">
                {projects.map(project => (
                  <div 
                    key={project.id} 
                    className={`project-card ${project.id === currentProjectId ? 'project-card-active' : ''}`}
                    onClick={() => loadProject(project)}
                  >
                    <div className="project-thumbnail">
                      {project.thumbnail ? (
                        <img src={project.thumbnail} alt={project.title} />
                      ) : (
                        <div className="placeholder-thumbnail">
                          <FileVideo size={48} />
                        </div>
                      )}
                      {project.id === currentProjectId && (
                        <div className="currently-editing-badge">
                          Current
                        </div>
                      )}
                    </div>
                    <div className="project-info">
                      <div className="project-header">
                        <h3 className="project-title">{project.title}</h3>
                        <button 
                          className="project-delete-btn"
                          onClick={(e) => deleteProject(e, project.id)}
                          aria-label="Delete project"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="project-date">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-projects">
                <p>No saved projects yet. Upload a video and save it as a project from the Home page.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
} 