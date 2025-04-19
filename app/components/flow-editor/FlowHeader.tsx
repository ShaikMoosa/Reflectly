'use client';

import React, { useState } from 'react';
import { FlowProject, ValidationWarning } from './types';

interface FlowHeaderProps {
  project: FlowProject;
  warnings: ValidationWarning[];
  readOnly?: boolean;
  onVersionChange: () => void;
  onExport: () => void;
}

export default function FlowHeader({
  project,
  warnings,
  readOnly = false,
  onVersionChange,
  onExport,
}: FlowHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleApproveVersion = () => {
    // In a real implementation, this would trigger an API call
    // or dispatch an action to update the project state
    console.log('Approve version:', project.currentVersion.id);
  };

  return (
    <div className="flow-header h-14 flex items-center justify-between px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Left side: hamburger menu and project title */}
      <div className="flex items-center space-x-4">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {project.title}
          </h1>
          <div className="flex items-center space-x-2">
            <button
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center"
              onClick={onVersionChange}
            >
              <span className="mr-1">{project.currentVersion.name}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                project.currentVersion.isApproved
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
              }`}
            >
              {project.currentVersion.isApproved ? 'Approved' : 'Draft'}
            </span>
          </div>
        </div>
      </div>

      {/* Center: warnings indicator */}
      {warnings.length > 0 && (
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
          <button
            className="flex items-center space-x-1 px-3 py-1 rounded-md bg-yellow-50 text-yellow-800 border border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800/50"
            title="View warnings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
              <path d="M12 9v4"></path>
              <path d="M12 17h.01"></path>
            </svg>
            <span>{warnings.length}</span>
          </button>
        </div>
      )}

      {/* Right side: actions */}
      <div className="flex items-center space-x-2">
        {!readOnly && (
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              project.currentVersion.isApproved
                ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                : 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600'
            }`}
            onClick={handleApproveVersion}
            disabled={project.currentVersion.isApproved}
          >
            {project.currentVersion.isApproved ? 'Approved' : 'Approve'}
          </button>
        )}

        <button
          className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          onClick={onExport}
        >
          Export
        </button>

        <div className="relative">
          <button className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
            {/* User avatar or initials */}
            <span className="text-sm font-medium">
              {project.createdBy.charAt(0)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
} 