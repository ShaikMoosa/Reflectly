'use client';

import { useEffect } from 'react';
import { Button } from './components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  const handleReset = () => {
    // Clear client-side cache before resetting
    if (typeof window !== 'undefined') {
      // Clear any cached resources that might be causing issues
      if ('caches' in window) {
        try {
          caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
              if (cacheName.startsWith('next-')) {
                caches.delete(cacheName);
              }
            });
          });
        } catch (e) {
          console.error('Failed to clear cache:', e);
        }
      }
    }
    
    // Try to reset the error boundary
    reset();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          The application encountered an unexpected error. We've been notified and are working to fix the issue.
        </p>
        <div className="flex flex-col space-y-3">
          <Button 
            onClick={handleReset}
            className="w-full"
          >
            Try again
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Go to homepage
          </Button>
        </div>
      </div>
    </div>
  );
} 