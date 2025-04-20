'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import to prevent SSR issues
const SimpleExcalidrawWrapper = dynamic(
  () => import('../components/SimpleExcalidrawWrapper'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4">Loading Simple Whiteboard...</p>
        </div>
      </div>
    )
  }
);

export default function SimpleTestPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Simple Excalidraw Test</h1>
      <p className="mb-4">This is a simpler implementation using .jsx files</p>
      <div className="border border-gray-300 rounded-lg h-[70vh]">
        <SimpleExcalidrawWrapper />
      </div>
    </div>
  );
} 