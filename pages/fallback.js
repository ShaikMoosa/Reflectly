import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

export default function FallbackPage() {
  const [isClient, setIsClient] = useState(false);
  const [notes, setNotes] = useState('');
  
  useEffect(() => {
    setIsClient(true);
    // Load notes from localStorage if available
    const savedNotes = localStorage.getItem('fallback-notes');
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);
  
  const handleSave = () => {
    localStorage.setItem('fallback-notes', notes);
    alert('Notes saved!');
  };
  
  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your notes?')) {
      setNotes('');
      localStorage.removeItem('fallback-notes');
    }
  };
  
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-10 w-10 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>Reflectly - Fallback Whiteboard</title>
        <meta name="description" content="Simple fallback whiteboard" />
      </Head>
      
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Reflectly</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Whiteboard (Fallback Mode)</h2>
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={handleClear}
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Clear
              </button>
            </div>
          </div>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-[70vh] p-4 resize-none border-none outline-none dark:bg-gray-700 dark:text-white"
              placeholder="This is a fallback whiteboard. You can write your notes here until we resolve the Excalidraw integration issues."
            />
          </div>
          
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Due to technical limitations, we've provided this simplified whiteboard. Your data is saved locally in your browser.
          </p>
        </div>
      </main>
    </div>
  );
} 