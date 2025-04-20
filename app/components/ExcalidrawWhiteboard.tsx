'use client';

import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

// Dynamically import Excalidraw to prevent SSR issues
const Excalidraw = dynamic(
  async () => {
    const mod = await import('@excalidraw/excalidraw');
    return mod.Excalidraw;
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
          <p className="mt-4">Loading Whiteboard...</p>
        </div>
      </div>
    )
  }
);

function ExcalidrawWhiteboard() {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Set up the container size
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      // This would update Excalidraw's dimensions when container resizes
    });
    
    resizeObserver.observe(containerRef.current);
    
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Set loaded to true since Excalidraw is now available
    setIsLoaded(true);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full flex flex-col overflow-hidden bg-white dark:bg-gray-800 rounded-lg"
    >
      {!isLoaded ? (
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-center">
            <div className="animate-spin h-10 w-10 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
            <p className="mt-4">Loading Whiteboard...</p>
          </div>
        </div>
      ) : (
        <Excalidraw
          theme={theme === "dark" ? "dark" : "light"}
          UIOptions={{
            canvasActions: {
              export: { saveFileToDisk: true },
              loadScene: true,
              saveToActiveFile: true,
              toggleTheme: true,
              saveAsImage: true,
              clearCanvas: true,
              changeViewBackgroundColor: true
            }
          }}
        />
      )}
    </div>
  );
}

// Export as memoized component to prevent unnecessary re-renders
export default memo(ExcalidrawWhiteboard); 