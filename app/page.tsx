'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileVideo, Clock, Play, Download, Upload, Sun, Moon, FileText, MessageSquare, Send } from 'lucide-react';

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
  const [notes, setNotes] = useState<{text: string, timestamp: number}[]>([]);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const importTranscriptRef = useRef<HTMLInputElement>(null);
  const transcriptListRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

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

  // Handle chat submission
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Add user message
    const newMessages = [
      ...chatMessages,
      { role: 'user' as const, content: chatInput }
    ];
    setChatMessages(newMessages);
    
    // Clear input
    setChatInput('');
    
    // Simulate AI response
    setTimeout(() => {
      setChatMessages([
        ...newMessages,
        { 
          role: 'assistant' as const, 
          content: `I'm an AI assistant that can help you with your video "${videoTitle || 'your video'}". What would you like to know about it?` 
        }
      ]);
    }, 1000);
  };

  // Function to add a note at current timestamp
  const addNote = () => {
    const newNote = {
      text: `Note at ${formatTime(currentTime)}`,
      timestamp: currentTime
    };
    setNotes([...notes, newNote]);
  };

  return (
    <main className={`${isDarkMode ? '' : 'light-mode'}`}>
      <div className="top-controls">
        <button 
          className="theme-toggle" 
          onClick={toggleTheme} 
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {videoUrl && (
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

      <div className="thread-container">
        <div className="app-header">
          <h1 className="app-title">Reflectly</h1>
        </div>

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
              {videoTitle && <h1 className="video-title">{videoTitle}</h1>}
              
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
                  <h2 id="notes-heading">Notes</h2>
                  
                  {notes.length === 0 ? (
                    <div className="empty-notes">
                      <p>No notes yet. Add a note at the current timestamp.</p>
                    </div>
                  ) : (
                    <div className="notes-container">
                      {notes.map((note, index) => (
                        <div key={index} className="note-item">
                          <span className="timestamp" onClick={() => handleTranscriptClick(note.timestamp)}>
                            {formatTime(note.timestamp)}
                          </span>
                          <span className="note-text">{note.text}</span>
                        </div>
                      ))}
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
                      />
                      <button type="submit" className="chat-send-button">
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
    </main>
  );
} 