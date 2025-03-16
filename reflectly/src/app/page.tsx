'use client';

import React, { useState, useRef, useEffect } from 'react';
import VideoPlayer from './components/VideoPlayer';
import TranscriptList from './components/TranscriptList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, RefreshCw, FileVideo } from 'lucide-react';

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
  const [videoTitle, setVideoTitle] = useState<string>('Video Transcription');
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showHelpTip, setShowHelpTip] = useState(true);
  
  // References
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // Create a FormData object to send the video file
      const formData = new FormData();
      if (videoFile) {
        formData.append('file', videoFile);
      } else if (videoUrl) {
        // For blob URLs, we need to fetch the file first
        const response = await fetch(videoUrl);
        const blob = await response.blob();
        formData.append('file', blob, 'video.mp4');
      }
      
      // Call our API endpoint
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to transcribe video');
      }
      
      const data = await response.json();
      
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
    setVideoTitle('Video Transcription');
    setTranscripts([]);
    setCurrentTime(0);
    setError(null);
    setShowHelpTip(true);
  };

  return (
    <main className="min-h-screen bg-slate-50/50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Reflectly</h1>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Upload your video and generate interactive transcripts with speaker identification
          </p>
        </header>

        {/* Video player section */}
        <Card className="mb-8 border border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="pb-2 pt-5 px-6 border-b border-slate-100">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold text-slate-800">
                {videoTitle}
              </CardTitle>
              {videoUrl && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetApp}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {error && (
              <div className="p-4 m-4 bg-red-50 border border-red-100 text-red-600 rounded-md text-sm">
                <div className="flex items-start">
                  <span className="text-red-500 text-lg mr-2">⚠️</span>
                  <div>
                    <p className="font-medium">{error}</p>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-red-500 mt-1" 
                      onClick={() => setError(null)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            )}
          
            {!videoUrl ? (
              // File upload area
              <div 
                onClick={triggerFileInput}
                className="border-2 border-dashed border-slate-200 rounded-lg m-6 p-10 flex flex-col items-center justify-center cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                  <FileVideo className="w-8 h-8" />
                </div>
                <h3 className="text-base font-medium text-slate-700 mb-1">Upload MP4 Video</h3>
                <p className="text-sm text-slate-500 mb-4 text-center max-w-md">
                  Drag and drop your video file here, or click to browse
                </p>
                <Button 
                  variant="outline"
                  className="text-sm"
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

                {showHelpTip && (
                  <div className="mt-6 p-3 bg-blue-50 border border-blue-100 rounded-md max-w-md text-sm text-blue-600">
                    <p className="font-medium mb-1">💡 Pro Tip</p>
                    <p className="text-slate-600 text-xs">After uploading a video, you can generate an AI transcript to navigate through the content easily.</p>
                  </div>
                )}
              </div>
            ) : (
              // Video player
              <>
                {isUploading ? (
                  <div className="flex items-center justify-center h-64 bg-slate-50">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-500 rounded-full animate-spin mb-3"></div>
                      <div className="text-slate-500 font-medium text-sm">Loading video...</div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg overflow-hidden">
                    <VideoPlayer
                      ref={videoRef}
                      src={videoUrl}
                      className="w-full aspect-video"
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Transcribe button - shown only when video is loaded and no transcript exists */}
        {videoUrl && transcripts.length === 0 && (
          <div className="flex justify-center mb-8">
            <Button 
              onClick={handleTranscribe}
              disabled={isTranscribing}
              variant="default"
              size="lg"
              className="relative"
            >
              {isTranscribing ? (
                <>
                  <div className="absolute inset-0 bg-slate-800 rounded-md animate-pulse opacity-20"></div>
                  <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Generating transcript...
                </>
              ) : (
                'Generate AI Transcript'
              )}
            </Button>
          </div>
        )}

        {/* Transcript list - shown only when transcripts exist */}
        {transcripts.length > 0 && (
          <div>
            <div className="flex items-center mb-2 px-1">
              <h2 className="text-sm font-medium text-slate-700">
                Transcript
              </h2>
              <div className="ml-2 text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                Click on any line to jump to that moment
              </div>
            </div>
            <Card className="border border-slate-200 shadow-sm overflow-hidden rounded-xl">
              <CardContent className="p-0">
                <TranscriptList
                  transcripts={transcripts}
                  onTranscriptClick={handleTranscriptClick}
                  currentTime={currentTime}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
} 