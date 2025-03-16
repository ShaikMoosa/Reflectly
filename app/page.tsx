'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileVideo, Clock, Play, Download, Upload } from 'lucide-react';

export default function Home() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [transcripts, setTranscripts] = useState<any[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const importTranscriptRef = useRef<HTMLInputElement>(null);

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

  return (
    <main className="min-h-screen p-0 md:p-0">
      <div className="thread-container">
        {/* Thread-like header */}
        <div className="thread-header">
          <button className="back-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="title">Thread</div>
          <div className="actions">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <div className="px-4">
          <h1 className="text-xl font-bold mb-2">{videoTitle || 'Reflectly'}</h1>
          <p className="text-gray-400 mb-4 text-sm">Upload your video and generate an interactive transcript</p>

          {/* Video section */}
          <div className="modern-card mb-4 overflow-hidden">
            {!videoUrl ? (
              // Upload section
              <div 
                onClick={() => fileInputRef.current?.click()} 
                className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-gray-500 bg-opacity-30 bg-black"
              >
                <div className="flex flex-col items-center justify-center">
                  <FileVideo className="w-12 h-12 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">Upload MP4 Video</h3>
                  <p className="text-sm text-gray-500 mb-4">Drag and drop your video file here, or click to browse</p>
                  <button className="modern-button">
                    <UploadCloud size={16} />
                    Choose Video
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
              // Video player
              <div>
                {isUploading ? (
                  <div className="aspect-video bg-gray-900 flex items-center justify-center w-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-purple"></div>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    className="w-full aspect-video bg-black"
                  />
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {videoUrl && (
            <div className="flex justify-between gap-2 mb-4">
              <button 
                onClick={handleTranscribe}
                disabled={isTranscribing}
                className="modern-button flex-1"
              >
                {isTranscribing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>Generate</>
                )}
              </button>
              
              <button 
                onClick={triggerImportTranscript}
                className="modern-button flex-1"
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
                className="modern-button flex-1"
                style={{ opacity: transcripts.length === 0 ? 0.6 : 1 }}
              >
                <Download size={16} />
                Export
              </button>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="rounded-md p-4 mb-4 bg-red-900 bg-opacity-30 border border-red-500 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Transcript section */}
          <div className="modern-card">
            <div className="border-b border-gray-800 px-4 py-3">
              <h2 className="text-base font-medium">Transcript</h2>
            </div>
            
            {transcripts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <Clock className="w-10 h-10 mb-3 text-gray-600" />
                <p className="text-center text-sm">No transcript available yet.</p>
                <p className="text-xs text-center mt-2">{videoUrl ? "Click 'Generate' to create transcript" : "Upload a video first"}</p>
              </div>
            ) : (
              <div className="max-h-[calc(100vh-430px)] overflow-y-auto">
                {transcripts.map((transcript, index) => {
                  const isActive = currentTime >= transcript.start && currentTime <= transcript.end;
                  
                  return (
                    <div 
                      key={index}
                      onClick={() => handleTranscriptClick(transcript.start)}
                      className={`transcript-item border-b border-gray-800 ${isActive ? 'active' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="timestamp">
                          {formatTime(transcript.start)}
                        </div>
                        
                        <div className="flex-1">
                          <p className={`text-gray-200 text-sm ${isActive ? 'font-medium' : ''}`}>
                            {transcript.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 