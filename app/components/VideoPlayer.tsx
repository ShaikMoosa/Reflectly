'use client';

import React, { forwardRef, useState, useEffect } from 'react';
import { Loader } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  className?: string;
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ src, className = '' }, ref) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    
    // Reset loading state when src changes
    useEffect(() => {
      console.log(`VideoPlayer: New src received: ${src ? 'Valid source' : 'Empty source'}`);
      if (src) {
        setIsLoading(true);
        setHasError(false);
      }
    }, [src]);
    
    const handleLoadedData = () => {
      console.log("VideoPlayer: Video loaded successfully");
      setIsLoading(false);
    };

    const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      console.error("VideoPlayer: Error loading video", e);
      setIsLoading(false);
      setHasError(true);
    };

    // Force-hide the loader after a timeout as a failsafe
    useEffect(() => {
      if (isLoading && src) {
        const timer = setTimeout(() => {
          console.log("VideoPlayer: Forcing loading state to complete after timeout");
          setIsLoading(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }, [isLoading, src]);

    return (
      <div className="relative w-full aspect-video bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
            <Loader className="w-10 h-10 text-white animate-spin" />
          </div>
        )}
        
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
            <div className="text-red-500 text-center">
              <p className="mb-2">Error loading video</p>
              <button 
                onClick={() => setHasError(false)}
                className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        {src && (
          <video
            ref={ref}
            src={src}
            controls
            className={`w-full h-full object-contain ${className}`}
            onLoadedData={handleLoadedData}
            onError={handleError}
            preload="auto"
          />
        )}
      </div>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer; 