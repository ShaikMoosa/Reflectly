'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useBoardStore } from '../../stores/useBoardStore';
import dynamic from 'next/dynamic';

// Dynamically import KonvaComponents with no SSR
const KonvaComponents = dynamic(
  () => import('./KonvaComponents'),
  { ssr: false }
);

export default function Board() {
  const {
    shapes,
    selectedId,
    updateShape,
    selectShape,
    deleteShape,
    tool,
    viewportTransform,
    updateViewport
  } = useBoardStore();
  
  const [stageSize, setStageSize] = useState({
    width: 1000,
    height: 700
  });

  // Wait for client-side hydration
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Set initial stage size
    setStageSize({
      width: window.innerWidth,
      height: window.innerHeight - 64, // Adjust for header
    });

    // Handle window resize
    const handleResize = () => {
      setStageSize({
        width: window.innerWidth,
        height: window.innerHeight - 64,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard handlers
  useEffect(() => {
    if (!isClient) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedId) {
        deleteShape(selectedId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, deleteShape, isClient]);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin h-10 w-10 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <KonvaComponents 
      shapes={shapes}
      selectedId={selectedId}
      tool={tool}
      viewportTransform={viewportTransform}
      stageSize={stageSize}
      updateShape={updateShape}
      selectShape={selectShape}
      deleteShape={deleteShape}
      updateViewport={updateViewport}
    />
  );
} 