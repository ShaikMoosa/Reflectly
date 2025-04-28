'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChunkErrorBoundary({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleChunkError = (event: ErrorEvent) => {
      if (
        event.error?.message?.includes('ChunkLoadError') || 
        event.message?.includes('ChunkLoadError') || 
        event.error?.message?.includes('Failed to fetch') ||
        event.message?.includes('Failed to fetch')
      ) {
        console.error('Chunk loading or fetch error detected, refreshing...', event);
        
        // Show an error state first
        setHasError(true);
        
        // Then refresh after a short delay
        setTimeout(() => {
          router.refresh();
        }, 1000);
      }
    };
    
    // Add listener for unhandled errors
    window.addEventListener('error', handleChunkError);
    
    // Add listener for unhandled promise rejections with proper type
    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      if (
        typeof event.reason === 'object' && 
        event.reason !== null && 
        (
          // Check message property if available
          ('message' in event.reason && 
            typeof event.reason.message === 'string' && 
            (
              event.reason.message.includes('ChunkLoadError') || 
              event.reason.message.includes('Failed to fetch')
            )
          ) || 
          // Check toString representation as fallback
          event.reason.toString().includes('ChunkLoadError') || 
          event.reason.toString().includes('Failed to fetch')
        )
      ) {
        console.error('Promise rejection with chunk error detected, refreshing...', event);
        
        // Show an error state first
        setHasError(true);
        
        // Then refresh after a short delay
        setTimeout(() => {
          router.refresh();
        }, 1000);
      }
    };
    
    window.addEventListener('unhandledrejection', handlePromiseRejection);
    
    return () => {
      window.removeEventListener('error', handleChunkError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    };
  }, [router]);
  
  if (hasError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Loading content...</h2>
          <p className="text-gray-600 dark:text-gray-400">Please wait while we refresh the page.</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
} 