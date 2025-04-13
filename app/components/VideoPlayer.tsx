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
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const lastCurrentTimeRef = useRef<number>(currentTime);
  
  // Log component render
  logDebug('VideoPlayer', 'Rendering', { videoUrl, currentTime, isPlaying });

  // Set user interaction to true on first mount
  useEffect(() => {
    // After a slight delay to ensure video element is ready
    const timer = setTimeout(() => {
      setHasUserInteracted(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle seek operations (setting currentTime) from external sources
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isInternalUpdate || !isVideoLoaded) return;
    
    // Check if currentTime has significantly changed from last value
    // This ensures we only act on deliberate timestamp clicks, not small updates
    if (Math.abs(currentTime - lastCurrentTimeRef.current) > 0.5) {
      logDebug('VideoPlayer', 'Significant time jump detected', { 
        from: lastCurrentTimeRef.current, 
        to: currentTime,
        diff: currentTime - lastCurrentTimeRef.current
      });
      
      try {
        // Directly set video position
        video.currentTime = currentTime;
        
        // If video is paused, try to play it
        if (video.paused) {
          logDebug('VideoPlayer', 'Attempting to play after time jump');
          // Use promise to handle autoplay restrictions
          video.play()
            .then(() => {
              logDebug('VideoPlayer', 'Successfully started playing after time jump');
            })
            .catch(err => {
              logDebug('VideoPlayer', 'Failed to play after time jump', { error: err });
            });
        }
      } catch (err) {
        logDebug('VideoPlayer', 'Error during time jump', { error: err });
      }
    }
    
    // Update last known currentTime
    lastCurrentTimeRef.current = currentTime;
  }, [currentTime, isInternalUpdate, isVideoLoaded]);

  // Handle play/pause state from external sources
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasUserInteracted || !isVideoLoaded) return;
    
    logDebug('VideoPlayer', 'External isPlaying update', { isPlaying, isPaused: video.paused });
    
    try {
      if (isPlaying && video.paused) {
        video.play()
          .catch(error => {
            logDebug('VideoPlayer', 'Playback error during play', { error });
          });
      } else if (!isPlaying && !video.paused) {
        video.pause();
      }
    } catch (err) {
      logDebug('VideoPlayer', 'Error toggling play state', { error: err });
    }
  }, [isPlaying, hasUserInteracted, isVideoLoaded]);

  // Handle time updates from the video element
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    
    // Prevent feedback loops by marking this as an internal update
    setIsInternalUpdate(true);
    onTimeUpdate(video.currentTime);
    
    // Update our reference for last known time
    lastCurrentTimeRef.current = video.currentTime;
    
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
    setIsVideoLoaded(true);
    const video = videoRef.current;
    logDebug('VideoPlayer', 'Video loaded', { 
      duration: video?.duration,
      currentTime: video?.currentTime,
      readyState: video?.readyState
    });
    
    // Ensure the initial currentTime is set
    if (video && currentTime > 0) {
      video.currentTime = currentTime;
    }
  };

  // Handle seek events directly from the video element
  const handleSeek = () => {
    const video = videoRef.current;
    if (!video) return;
    
    logDebug('VideoPlayer', 'User manually seeked video', { newTime: video.currentTime });
    lastCurrentTimeRef.current = video.currentTime;
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      logDebug('VideoPlayer', 'Component unmounting');
    };
  }, []);

  return (
    <div className="video-player w-full rounded-xl overflow-hidden shadow-lg relative">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full"
        controls
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => handlePlayPause()}
        onPause={() => handlePlayPause()}
        onLoadedData={handleLoadedData}
        onSeeking={handleSeek}
        onSeeked={handleSeek}
        onError={(e) => logDebug('VideoPlayer', 'Video error', { error: e })}
      />
    </div>
  );
};

export default VideoPlayer; 