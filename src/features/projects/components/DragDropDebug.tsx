'use client';

import React from 'react';

interface DebugPanelProps {
  data: any;
  isActive?: boolean;
}

const DragDropDebug: React.FC<DebugPanelProps> = ({ data, isActive = true }) => {
  if (!isActive) return null;
  
  return (
    <div className="fixed bottom-4 right-4 p-2 bg-white dark:bg-gray-800 rounded shadow-lg text-xs opacity-70 hover:opacity-100 transition-opacity z-50 max-w-xs">
      <div className="font-mono text-gray-700 dark:text-gray-300 mb-1">
        Drag and Drop Debug:
      </div>
      <div className="text-gray-600 dark:text-gray-400">
        {data.columnOrder?.map((colId: string) => (
          <div key={colId}>
            {data.columns?.[colId]?.title}: {data.columns?.[colId]?.taskIds?.length} tasks
          </div>
        ))}
      </div>
      <div className="mt-2 text-xs text-indigo-500 dark:text-indigo-400">
        Click to dock/undock
      </div>
    </div>
  );
};

export default DragDropDebug; 