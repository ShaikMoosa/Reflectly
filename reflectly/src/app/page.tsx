'use client';

import React, { useState, useRef, useEffect } from 'react';
import VideoPlayer from './components/VideoPlayer';
import TranscriptList from './components/TranscriptList';
import { Button } from '../components/ui/button';
import { UploadCloud, FileVideo, FileAudio, Download, Upload } from 'lucide-react';

/**
 * TranscriptItem interface - defines the structure for a transcript segment
 */
interface TranscriptItem {
  start: number;    // Start time in seconds
  end: number;      // End time in seconds
  text: string;     // Transcript text content
  speaker?: string; // Optional speaker identifier
}

/**
 * Main application component
 */
export default function Home() {
  // State management
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoTitle, setVideoTitle] = useState<string>('Upload a video to get started');
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showHelpTip, setShowHelpTip] = useState(true);
  
  // References
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importTranscriptRef = useRef<HTMLInputElement>(null);

  /**
   * Updates current video time when the video is playing
   */
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

  /**
   * Clean up object URLs when component unmounts
   */
  useEffect(() => {
    return () => {
      if (videoUrl && videoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  /**
   * Handles video file upload
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'video/mp4') {
      setIsUploading(true);
      setVideoFile(file);
      setError(null);
      setShowHelpTip(false);
      
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

  /**
   * Generates transcript from the video
   * Uses OpenAI's API through our backend endpoint
   */
  const handleTranscribe = async () => {
    if (!videoFile && !videoUrl) return;

    setIsTranscribing(true);
    setError(null);
    
    try {
      console.log('Starting transcription process...');
      
      // Create a FormData object to send the video file
      const formData = new FormData();
      if (videoFile) {
        console.log('Using uploaded video file:', videoFile.name);
        formData.append('file', videoFile);
      } else if (videoUrl) {
        // For blob URLs, we need to fetch the file first
        console.log('Using blob URL video');
        const response = await fetch(videoUrl);
        const blob = await response.blob();
        formData.append('file', blob, 'video.mp4');
      }
      
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
      
      setIsTranscribing(false);
    } catch (error: any) {
      console.error('Error transcribing video:', error);
      setIsTranscribing(false);
      setError(error.message || 'Failed to generate transcript. Please try again.');
    }
  };

  /**
   * Jumps to specific timestamp in video when clicking on transcript
   */
  const handleTranscriptClick = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      videoRef.current.play().catch(err => {
        console.error("Playback error:", err);
        setError('Failed to play video at the selected timestamp.');
      });
    }
  };
  
  /**
   * Trigger file input when clicking on upload area
   */
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const resetApp = () => {
    if (videoUrl && videoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoFile(null);
    setVideoUrl('');
    setVideoTitle('Upload a video to get started');
    setTranscripts([]);
    setCurrentTime(0);
    setError(null);
    setShowHelpTip(true);
  };

  /**
   * Exports the current transcript as a JSON file
   */
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

  /**
   * Imports a transcript from a JSON file
   */
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

  /**
   * Opens the file dialog for transcript import
   */
  const triggerImportTranscript = () => {
    importTranscriptRef.current?.click();
  };

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Video title */}
        <h1 className="text-2xl font-bold text-center mb-6">{videoTitle}</h1>

        {/* Video content area */}
        <div className="mb-6">
          {!videoUrl ? (
            // File upload area
            <div 
              onClick={triggerFileInput}
              className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-gray-300 hover:bg-gray-50/50 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <FileVideo className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-black mb-2">Upload MP4 Video</h3>
              <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
                Drag and drop your video file here, or click to browse
              </p>
              <Button 
                variant="outline"
                className="text-sm border-gray-300 hover:bg-gray-100 hover:text-black"
                onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}
              >
                <UploadCloud className="w-4 h-4 mr-2" />
                Choose Video
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          ) : (
            // Video player
            <VideoPlayer
              ref={videoRef} 
              src={videoUrl}
              className="w-full rounded-lg overflow-hidden"
            />
          )}
        </div>
        
        {/* Action Buttons with INLINE STYLES to ensure visibility */}
        <div className="flex flex-wrap items-center gap-4 mb-8 justify-start" style={{
          display: 'flex',
          justifyContent: 'flex-start',
          marginBottom: '2rem',
          gap: '1rem',
          width: '100%'
        }}>
          {/* Generate transcript button */}
          <button 
            onClick={handleTranscribe}
            disabled={isTranscribing || !videoUrl}
            style={{
              backgroundColor: 'black',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              minWidth: '180px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            {isTranscribing ? (
              <>
                <div style={{ 
                  width: '1rem', 
                  height: '1rem', 
                  borderRadius: '50%', 
                  borderTop: '2px solid transparent',
                  borderRight: '2px solid white',
                  borderBottom: '2px solid white',
                  borderLeft: '2px solid white',
                  marginRight: '0.5rem',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Processing...
              </>
            ) : (
              <>
                Generate transcript
              </>
            )}
          </button>
          
          {/* Import transcript button */}
          <button 
            onClick={triggerImportTranscript}
            disabled={!videoUrl}
            style={{
              backgroundColor: 'black',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              minWidth: '180px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            <Upload size={16} style={{ marginRight: '0.5rem' }} />
            Import transcript
          </button>
          <input
            ref={importTranscriptRef}
            type="file"
            accept="application/json"
            onChange={handleImportTranscript}
            className="hidden"
          />
          
          {/* Export transcript button */}
          <button 
            onClick={handleExportTranscript}
            disabled={transcripts.length === 0}
            style={{
              backgroundColor: 'black',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              minWidth: '180px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            <Download size={16} style={{ marginRight: '0.5rem' }} />
            Export transcript
          </button>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {/* Transcripts */}
        {transcripts.length > 0 && (
          <div className="mt-8">
            <TranscriptList 
              transcripts={transcripts}
              onTranscriptClick={handleTranscriptClick}
              currentTime={currentTime}
            />
          </div>
        )}
      </div>
    </main>
  );
} 