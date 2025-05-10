'use client';

import React, { useRef, useEffect, useState, forwardRef, Ref } from 'react';

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

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(({
  videoUrl,
  currentTime,
  onTimeUpdate,
  isPlaying,
  onPlayPause
}, forwardedRef) => {
  // Use internal ref if no ref is forwarded
  const localRef = useRef<HTMLVideoElement>(null);
  // This ensures we always have a ref object with current property
  const videoRef = (forwardedRef as React.RefObject<HTMLVideoElement>) || localRef;
  
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
    if (!video || isInternalUpdate) return;
    
    // Always update when time changes from transcript click
    // This ensures we respond to all seek requests
    if (Math.abs(currentTime - video.currentTime) > 0.2) {
      logDebug('VideoPlayer', 'External seek detected', { 
        from: video.currentTime, 
        to: currentTime
      });
      
      try {
        // Set the video's current time
        video.currentTime = currentTime;
        
        // If video is paused and this appears to be a seek from transcript,
        // attempt to play the video automatically
        if (video.paused && Math.abs(currentTime - lastCurrentTimeRef.current) > 1) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => logDebug('VideoPlayer', 'Successfully played after seek'))
              .catch((err: Error) => logDebug('VideoPlayer', 'Failed to play after seek', { error: err }));
          }
        }
      } catch (err) {
        logDebug('VideoPlayer', 'Error during time jump', { error: err });
      }
    }
    
    // Update last known currentTime
    lastCurrentTimeRef.current = currentTime;
  }, [currentTime, isInternalUpdate]);

  // Handle play/pause state from external sources
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasUserInteracted || !isVideoLoaded) return;
    
    logDebug('VideoPlayer', 'External isPlaying update', { isPlaying, isPaused: video.paused });
    
    try {
      if (isPlaying && video.paused) {
        video.play()
          .catch((error: Error) => {
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
        ref={videoRef as React.RefObject<HTMLVideoElement>}
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
});

// Add display name for better debugging
VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer; 