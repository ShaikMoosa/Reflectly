'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Import with dynamic to prevent any SSR/import errors
const ExcalidrawWhiteboard = dynamic(
  () => import('../components/ExcalidrawWhiteboard'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center p-4">
          <div className="animate-spin h-10 w-10 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4">Loading component...</p>
        </div>
      </div>
    )
  }
);

export default function TestWhiteboardPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Excalidraw Test</h1>
      <div className="border border-gray-300 rounded-lg h-[70vh]">
        <ExcalidrawWhiteboard />
      </div>
    </div>
  );
} 