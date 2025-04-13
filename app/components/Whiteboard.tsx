'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import type { Editor } from '@tldraw/tldraw';

// Dynamically import Tldraw to avoid SSR issues
const TldrawComponent = dynamic(() => import('@tldraw/tldraw').then(mod => ({ default: mod.Tldraw })), { ssr: false });

const Whiteboard = () => {
  const { resolvedTheme } = useTheme();
  const [editor, setEditor] = useState<Editor | null>(null);
  const [tldrawAvailable, setTldrawAvailable] = useState(true);

  useEffect(() => {
    // Check if Tldraw is available
    if (typeof window !== 'undefined') {
      try {
        require('@tldraw/tldraw');
      } catch (e) {
        setTldrawAvailable(false);
      }
    }
  }, []);

  // Update editor theme when theme changes
  useEffect(() => {
    if (editor) {
      try {
        // Use the correct property to set theme in TLDraw v3.11+
        editor.user.updateUserPreferences({
          colorScheme: resolvedTheme === 'dark' ? 'dark' : 'light'
        });
      } catch (error) {
        console.error('Error updating TLDraw theme:', error);
      }
    }
  }, [editor, resolvedTheme]);

  // Remove watermarks using MutationObserver
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const removeWatermarks = () => {
      const watermarks = document.querySelectorAll('[data-watermark="true"]');
      watermarks.forEach(watermark => watermark.remove());
    };

    // Initial removal
    removeWatermarks();

    // Setup MutationObserver to continuously remove watermarks
    const observer = new MutationObserver(removeWatermarks);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, []);

  if (!tldrawAvailable) {
    return (
      <div className="whiteboard-container flex items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-md shadow-md">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Tldraw not available</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Please install Tldraw with: <code className="bg-gray-100 dark:bg-gray-700 p-1 rounded">npm install @tldraw/tldraw</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="whiteboard-container h-full w-full">
      <TldrawComponent 
        onMount={(editor) => setEditor(editor)}
        className="tldraw h-full w-full" 
      />
    </div>
  );
};

export default Whiteboard; 