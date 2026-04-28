'use client';

import React from 'react';
import { ChevronRight, LayoutGrid, List, Search, Filter, Plus } from 'lucide-react';

interface KanbanHeaderProps {
  view: 'grid' | 'traceability';
  onViewChange: (view: 'grid' | 'traceability') => void;
  onFilterToggle: () => void;
  onCreateReview: () => void;
  isFilterVisible: boolean;
}

const KanbanHeader: React.FC<KanbanHeaderProps> = ({
  view,
  onViewChange,
  onFilterToggle,
  onCreateReview,
  isFilterVisible
}) => {
  return (
    <div className="mb-6">
      {/* Breadcrumb */}
      <div className="flex items-center mb-4 text-sm">
        <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
          Planner
        </a>
        <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
        <span className="font-medium text-gray-900 dark:text-white">Design Control</span>
      </div>

      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Design Control</h1>
        
        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by title..."
              className="py-2 pl-10 pr-4 w-60 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Filter Toggle */}
          <button
            onClick={onFilterToggle}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isFilterVisible
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </button>
          
          {/* View Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-md p-1">
            <button
              onClick={() => onViewChange('grid')}
              className={`flex items-center px-3 py-1 text-sm font-medium rounded ${
                view === 'grid'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
              Grid
            </button>
            <button
              onClick={() => onViewChange('traceability')}
              className={`flex items-center px-3 py-1 text-sm font-medium rounded ${
                view === 'traceability'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <List className="mr-2 h-4 w-4" />
              Traceability
            </button>
          </div>
          
          {/* Create Design Review */}
          <button
            onClick={onCreateReview}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Design Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default KanbanHeader; 