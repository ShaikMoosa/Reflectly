'use client';

import React, { forwardRef, useState, useEffect } from 'react';

/**
 * Props for the VideoPlayer component
 */
interface VideoPlayerProps {
  src: string;             // Video source URL
  className?: string;      // Optional CSS class name for styling
}

/**
 * VideoPlayer Component
 * 
 * A simple video player component that can be controlled via ref.
 * Supports standard HTML5 video attributes and custom styling.
 * 
 * Usage:
 * ```
 * const videoRef = useRef<HTMLVideoElement>(null);
 * <VideoPlayer ref={videoRef} src="/path/to/video.mp4" />
 * ```
 */
const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ src, className = '' }, ref) => {
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Reset states when src changes
    useEffect(() => {
      if (src) {
        setIsLoading(true);
        setHasError(false);
      }
    }, [src]);

    const handleLoadedData = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
      console.error('Error loading video from source:', src);
    };

    return (
      <div className="relative rounded-md overflow-hidden" style={{ minHeight: "200px" }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
              <span className="text-sm text-blue-600">Loading video...</span>
            </div>
          </div>
        )}
        
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center px-4">
              <span className="text-4xl mb-2 block">⚠️</span>
              <h3 className="text-red-600 font-medium mb-1">Failed to load video</h3>
              <p className="text-sm text-gray-500">Please check that the video file is valid and try again.</p>
            </div>
          </div>
        )}
        
        <video
          ref={ref}
          src={src}
          controls
          className={`w-full bg-black aspect-video ${className}`}
          preload="metadata"
          onLoadedData={handleLoadedData}
          onError={handleError}
        />
      </div>
    );
  }
);

// Display name for debugging and React DevTools
VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer; 