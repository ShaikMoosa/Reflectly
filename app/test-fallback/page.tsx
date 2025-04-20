'use client';

import React, { useState } from 'react';

export default function TestFallbackPage() {
  const [notes, setNotes] = useState<string>('');
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Simple Whiteboard Fallback</h1>
      <div className="border border-gray-300 rounded-lg h-[70vh] p-4 flex flex-col">
        <p className="mb-2 text-gray-600">This is a simple alternative that doesn't use Excalidraw:</p>
        <textarea 
          className="flex-grow p-2 rounded border border-gray-200" 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Type your notes here..."
        />
        <div className="mt-4 flex justify-between">
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => localStorage.setItem('simple-notes', notes)}
          >
            Save
          </button>
          <button 
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={() => {
              const saved = localStorage.getItem('simple-notes');
              if (saved) setNotes(saved);
            }}
          >
            Load
          </button>
        </div>
      </div>
    </div>
  );
} 