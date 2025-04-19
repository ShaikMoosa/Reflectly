'use client';

import React from 'react';
import FixedKanbanBoard from '../components/FixedKanbanBoard';

export default function PlannerPage() {
  return (
    <div className="w-full">
      <div className="overflow-hidden p-6">
        <h1 className="text-3xl font-bold mb-2">Project Planner</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Organize your ideas and tasks with this Kanban board. Drag and drop cards to update status.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 h-[calc(100vh-220px)]">
          <FixedKanbanBoard />
        </div>
      </div>
    </div>
  );
} 