'use client';

import React, { useState, useEffect } from 'react';

export default function TestPage() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Simple Test Page</h1>
      <p className="mb-4">This page has minimal dependencies to test server rendering.</p>
      
      {isClient ? (
        <div className="border border-gray-300 p-4 rounded">
          <p>Client-side rendering is working!</p>
          <p>Current time: {new Date().toLocaleTimeString()}</p>
        </div>
      ) : (
        <div className="flex items-center justify-center h-20">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
} 