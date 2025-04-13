'use client';

import React from 'react';
import { useEffect } from 'react';

export default function ErrorPage({
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

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card bg-base-200 w-full max-w-md shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-error">Something went wrong!</h2>
          <p className="py-4">An unexpected error occurred in the application.</p>
          
          <div className="bg-error bg-opacity-10 p-4 rounded-lg mb-4">
            <p className="font-bold text-sm">Error details:</p>
            <p className="text-xs font-mono overflow-auto max-h-32 mt-2">{error.message}</p>
            {error.digest && (
              <p className="text-xs mt-2">Error ID: {error.digest}</p>
            )}
          </div>
          
          <div className="card-actions justify-end">
            <button 
              className="btn btn-primary" 
              onClick={() => window.location.href = '/'}
            >
              Go to Home
            </button>
            <button 
              className="btn btn-outline" 
              onClick={() => reset()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 