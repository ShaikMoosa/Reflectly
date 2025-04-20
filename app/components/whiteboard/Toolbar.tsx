'use client';

import React from 'react';
import { useBoardStore } from '../../stores/useBoardStore';

interface ToolbarProps {
  onClear: () => void;
}

export default function Toolbar({ onClear }: ToolbarProps) {
  const { 
    addShape, 
    tool, 
    setTool, 
    selectedId, 
    deleteShape 
  } = useBoardStore();

  const getRandomColor = () => {
    const colors = [
      '#e74c3c', // Red
      '#3498db', // Blue
      '#2ecc71', // Green
      '#f1c40f', // Yellow
      '#9b59b6', // Purple
      '#1abc9c', // Teal
      '#e67e22', // Orange
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleAddShape = () => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const fill = getRandomColor();
    
    if (tool === 'rect') {
      addShape({
        type: 'rect',
        x: centerX - 50,
        y: centerY - 35,
        width: 100,
        height: 70,
        fill
      });
    } else if (tool === 'circle') {
      addShape({
        type: 'circle',
        x: centerX,
        y: centerY,
        radius: 40,
        fill
      });
    }
  };

  const handleDeleteSelected = () => {
    if (selectedId) {
      deleteShape(selectedId);
    }
  };

  return (
    <div className="absolute top-4 left-4 flex flex-col space-y-2 bg-white dark:bg-gray-800 p-3 rounded shadow z-10">
      <div className="flex flex-col space-y-1">
        <button
          className={`px-4 py-2 rounded text-sm ${
            tool === 'select' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          onClick={() => setTool('select')}
        >
          Select
        </button>
        <button
          className={`px-4 py-2 rounded text-sm ${
            tool === 'pan' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          onClick={() => setTool('pan')}
        >
          Pan
        </button>
        <button
          className={`px-4 py-2 rounded text-sm ${
            tool === 'rect' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          onClick={() => setTool('rect')}
        >
          Rectangle
        </button>
        <button
          className={`px-4 py-2 rounded text-sm ${
            tool === 'circle' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          onClick={() => setTool('circle')}
        >
          Circle
        </button>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
        {(tool === 'rect' || tool === 'circle') && (
          <button
            className="w-full px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            onClick={handleAddShape}
          >
            Add {tool === 'rect' ? 'Rectangle' : 'Circle'}
          </button>
        )}
        
        {tool === 'select' && (
          <button
            className={`w-full px-4 py-2 rounded text-sm ${
              selectedId 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleDeleteSelected}
            disabled={!selectedId}
          >
            Delete Selected
          </button>
        )}
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
        <button
          className="w-full px-4 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
          onClick={onClear}
        >
          Clear All
        </button>
      </div>
    </div>
  );
} 