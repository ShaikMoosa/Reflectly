'use client';

import React from 'react';
import { ToolType } from './types';

interface FlowToolbarProps {
  selectedTool: ToolType;
  canUndo: boolean;
  canRedo: boolean;
  readOnly?: boolean;
  onToolSelect: (tool: ToolType) => void;
  onUndo: () => void;
  onRedo: () => void;
}

export default function FlowToolbar({
  selectedTool,
  canUndo,
  canRedo,
  readOnly = false,
  onToolSelect,
  onUndo,
  onRedo,
}: FlowToolbarProps) {
  // Define toolbar items
  const tools = [
    {
      id: 'select' as ToolType,
      label: 'Select',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
      ),
      description: 'Select and move nodes',
    },
    {
      id: 'pan' as ToolType,
      label: 'Pan',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>
      ),
      description: 'Pan around the canvas',
    },
    {
      id: 'node' as ToolType,
      label: 'Add Node',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M8 12h8M12 8v8"/></svg>
      ),
      description: 'Add a new node',
      disabled: readOnly,
    },
    {
      id: 'connect' as ToolType,
      label: 'Connect',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12 12H9zM3 3v18"/></svg>
      ),
      description: 'Connect nodes',
      disabled: readOnly,
    },
    {
      id: 'text' as ToolType,
      label: 'Text',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18H3"/></svg>
      ),
      description: 'Add text to canvas',
      disabled: readOnly,
    },
    {
      id: 'lasso' as ToolType,
      label: 'Lasso',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 22a5 5 0 0 1-2-4"/><path d="M7 16.93c.96.43 1.96.74 2.99.91"/><path d="M3.34 14A6.8 6.8 0 0 1 2 10c0-4.42 4.48-8 10-8s10 3.58 10 8a7.19 7.19 0 0 1-.33 2"/><path d="M5 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/><path d="M14.33 22h-.09a.35.35 0 0 1-.24-.32v-10a.34.34 0 0 1 .33-.34c.08 0 .15.03.21.08l7.34 6a.33.33 0 0 1-.21.59h-4.49l-2.57 3.85a.35.35 0 0 1-.28.14v0z"/></svg>
      ),
      description: 'Free-form selection',
    },
    {
      id: 'delete' as ToolType,
      label: 'Delete',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
      ),
      description: 'Delete selected elements',
      disabled: readOnly,
    },
  ];

  return (
    <div className="flow-toolbar w-16 flex flex-col items-center bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 py-4">
      {/* Tool buttons */}
      <div className="flex flex-col items-center space-y-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors ${
              selectedTool === tool.id
                ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            } ${tool.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={() => !tool.disabled && onToolSelect(tool.id)}
            title={`${tool.label}: ${tool.description}`}
            disabled={tool.disabled}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="my-4 w-8 border-t border-gray-200 dark:border-gray-700"></div>

      {/* History controls */}
      <div className="flex flex-col items-center space-y-2">
        <button
          className={`w-10 h-10 rounded-md flex items-center justify-center ${
            canUndo
              ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
          }`}
          onClick={onUndo}
          disabled={!canUndo || readOnly}
          title="Undo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
        </button>

        <button
          className={`w-10 h-10 rounded-md flex items-center justify-center ${
            canRedo
              ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
          }`}
          onClick={onRedo}
          disabled={!canRedo || readOnly}
          title="Redo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
        </button>
      </div>

      {/* Divider */}
      <div className="my-4 w-8 border-t border-gray-200 dark:border-gray-700"></div>

      {/* Simulation controls */}
      <div className="flex flex-col items-center space-y-2">
        <button
          className="w-10 h-10 rounded-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Run simulation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
        </button>
      </div>
    </div>
  );
} 