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
    <main className="min-h-screen bg-white text-black p-4 md:p-6 flex justify-center">
      <div className="max-w-3xl w-full flex flex-col items-center">
        <h1 className="text-2xl font-bold text-center mb-4">{videoTitle || 'Reflectly'}</h1>
        <p className="text-center text-gray-500 mb-8">Upload your video and generate an interactive transcript</p>

        {/* Video content area - centered */}
        <div className="mb-6 w-full flex justify-center">
          {!videoUrl ? (
            // Upload section
            <div 
              onClick={() => fileInputRef.current?.click()} 
              className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-gray-300 w-full"
            >
              <div className="flex flex-col items-center justify-center">
                <FileVideo className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Upload MP4 Video</h3>
                <p className="text-sm text-gray-500 mb-4">Drag and drop your video file here, or click to browse</p>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
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
            // Video player - centered
            <div className="w-full flex justify-center">
              {isUploading ? (
                <div className="aspect-video bg-gray-100 flex items-center justify-center w-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-700"></div>
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
        
        {/* Action Buttons with inline styles - center aligned */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem',
          justifyContent: 'center',
          width: '100%'
        }}>
          {/* Generate transcript button */}
          <button 
            onClick={handleTranscribe}
            disabled={isTranscribing}
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
              cursor: isTranscribing ? 'not-allowed' : 'pointer',
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
              cursor: transcripts.length === 0 ? 'not-allowed' : 'pointer',
              border: 'none',
              opacity: transcripts.length === 0 ? 0.7 : 1
            }}
          >
            <Download size={16} style={{ marginRight: '0.5rem' }} />
            Export transcript
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6 w-full text-center">
            {error}
          </div>
        )}

        {/* Transcript display - centered */}
        {transcripts.length > 0 && (
          <div className="mt-6 w-full">
            <h2 className="text-xl font-semibold mb-4 text-center">Transcript</h2>
            <div className="space-y-[18px]">
              {transcripts.map((transcript, index) => {
                const isActive = currentTime >= transcript.start && currentTime <= transcript.end;
                const speakerNumber = transcript.speaker?.split(' ')[1] || '1';
                
                return (
                  <div 
                    key={index}
                    onClick={() => handleTranscriptClick(transcript.start)}
                    className="p-6 cursor-pointer rounded-lg border border-gray-100 shadow-sm hover:bg-[#F1F1F1F1] hover:shadow-md hover:transform hover:scale-[1.01] hover:border-gray-200"
                    style={{ backgroundColor: isActive ? '#f9f9f9' : 'white' }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-sm font-medium">
                          S{speakerNumber}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-black font-medium mb-1">
                          Speaker {speakerNumber}
                        </p>
                        <p className={`text-gray-700 text-base ${isActive ? 'font-medium' : ''}`}>
                          {transcript.text}
                        </p>
                      </div>
                      
                      <div className="text-purple-500 flex items-center gap-1">
                        <Play className="h-4 w-4" fill="currentColor" strokeWidth={0} />
                        <span className="text-sm font-mono">{formatTime(transcript.start)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 