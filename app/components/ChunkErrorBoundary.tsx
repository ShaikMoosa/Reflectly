'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Define types for our custom window properties
declare global {
  interface Window {
    __CHUNK_RETRY_COUNT?: Record<string, any>;
    __webpack_require__?: {
      c: Record<string, any>;
    };
  }
}

export default function ChunkErrorBoundary({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  useEffect(() => {
    // Track chunk load attempts
    window.__CHUNK_RETRY_COUNT = window.__CHUNK_RETRY_COUNT || {};
    
    const handleChunkError = (event: ErrorEvent) => {
      const isChunkError = 
        event.error?.message?.includes('ChunkLoadError') || 
        event.message?.includes('ChunkLoadError') || 
        event.error?.message?.includes('Failed to fetch') ||
        event.message?.includes('Failed to fetch');
        
      if (isChunkError) {
        console.error('Chunk loading or fetch error detected:', event);
        
        // Show an error state
        setHasError(true);
        
        // Increment retry count
        setRetryCount(prev => prev + 1);
        
        // Clear cache for better recovery
        if (typeof window !== 'undefined') {
          // Clear webpack cache if possible
          const webpackRequire = window.__webpack_require__;
          if (webpackRequire?.c) {
            Object.keys(webpackRequire.c).forEach(moduleId => {
              if (moduleId.includes('layout') || moduleId.includes('chunk')) {
                delete webpackRequire.c[moduleId];
              }
            });
          }
        }
        
        // Prevent default error handling
        event.preventDefault();
        
        // Handle based on retry count
        if (retryCount >= 3) {
          // Hard reload after multiple failures
          console.log('Multiple chunk load failures, performing hard reload...');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          // Try soft refresh first
          console.log(`Attempting soft refresh, retry ${retryCount + 1}...`);
          setTimeout(() => {
            router.refresh();
          }, 500);
        }
      }
    };
    
    // Add listener for unhandled errors
    window.addEventListener('error', handleChunkError);
    
    // Add listener for unhandled promise rejections
    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const isChunkError = 
        (typeof reason === 'object' && 
         reason !== null && 
         (('message' in reason && 
           typeof reason.message === 'string' && 
           (reason.message.includes('ChunkLoadError') || 
            reason.message.includes('Failed to fetch'))
          ) || 
          reason.toString().includes('ChunkLoadError') || 
          reason.toString().includes('Failed to fetch')
         )
        );
      
      if (isChunkError) {
        console.error('Promise rejection with chunk error detected:', event);
        
        // Show an error state
        setHasError(true);
        
        // Increment retry count
        setRetryCount(prev => prev + 1);
        
        // Prevent default handling
        event.preventDefault();
        
        // Handle based on retry count
        if (retryCount >= 3) {
          // Hard reload after multiple failures
          console.log('Multiple chunk load failures, performing hard reload...');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          // Try soft refresh first
          console.log(`Attempting soft refresh, retry ${retryCount + 1}...`);
          setTimeout(() => {
            router.refresh();
          }, 500);
        }
      }
    };
    
    window.addEventListener('unhandledrejection', handlePromiseRejection);
    
    return () => {
      window.removeEventListener('error', handleChunkError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    };
  }, [router, retryCount]);
  
  if (hasError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-xl font-semibold mb-4">Loading content...</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please wait while we refresh the page. {retryCount > 0 ? `(Attempt ${retryCount})` : ''}
          </p>
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
} 