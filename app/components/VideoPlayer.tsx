'use client';

import React, { useRef, useEffect, useState } from 'react';

// Debug logging utility
const logDebug = (component: string, action: string, data?: any) => {
  console.log(`[${component}] ${action}`, data !== undefined ? data : '');
};

interface VideoPlayerProps {
  videoUrl: string;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  currentTime,
  onTimeUpdate,
  isPlaying,
  onPlayPause
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInternalUpdate, setIsInternalUpdate] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  
  // Log component render
  logDebug('VideoPlayer', 'Rendering', { videoUrl, currentTime, isPlaying });

  // Handle seek operations (setting currentTime) from external sources
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isInternalUpdate) return;
    
    logDebug('VideoPlayer', 'External time update detected', { currentTime, videoCurrentTime: video.currentTime });
    
    // Only update if there's a significant difference to avoid loops
    if (Math.abs(video.currentTime - currentTime) > 0.5) {
      logDebug('VideoPlayer', 'Setting video currentTime', { from: video.currentTime, to: currentTime });
      video.currentTime = currentTime;
    }
  }, [currentTime, isInternalUpdate]);

  // Handle play/pause state from external sources
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasUserInteracted) return;
    
    logDebug('VideoPlayer', 'External isPlaying update', { isPlaying, isPaused: video.paused });
    
    const playPromise = isPlaying && video.paused ? 
      video.play() : 
      !isPlaying && !video.paused ? 
        video.pause() : 
        null;
    
    if (playPromise) {
      playPromise.catch(error => {
        logDebug('VideoPlayer', 'Playback error', { error });
      });
    }
  }, [isPlaying, hasUserInteracted]);

  // Handle time updates from the video element
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    
    // Prevent feedback loops by marking this as an internal update
    setIsInternalUpdate(true);
    onTimeUpdate(videoRef.current.currentTime);
    
    // Reset the flag after a short delay
    setTimeout(() => {
      setIsInternalUpdate(false);
    }, 50);
  };

  // Handle play/pause events from the video element
  const handlePlayPause = () => {
    setHasUserInteracted(true);
    onPlayPause();
    logDebug('VideoPlayer', 'Play/pause triggered by user');
  };

  // Log when video is loaded
  const handleLoadedData = () => {
    logDebug('VideoPlayer', 'Video loaded', { duration: videoRef.current?.duration });
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      logDebug('VideoPlayer', 'Component unmounting');
    };
  }, []);

  return (
    <div className="video-player w-full rounded-xl overflow-hidden shadow-lg">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full"
        controls
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => handlePlayPause()}
        onPause={() => handlePlayPause()}
        onLoadedData={handleLoadedData}
        onError={(e) => logDebug('VideoPlayer', 'Video error', { error: e })}
      />
    </div>
  );
};

export default VideoPlayer; 