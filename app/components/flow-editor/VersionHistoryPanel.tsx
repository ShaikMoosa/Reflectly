'use client';

import React from 'react';
import { FlowProject, FlowVersion } from './types';

interface VersionHistoryPanelProps {
  project: FlowProject;
  readOnly?: boolean;
  onClose: () => void;
  onVersionSelect: (versionId: string) => void;
}

export default function VersionHistoryPanel({
  project,
  readOnly = false,
  onClose,
  onVersionSelect,
}: VersionHistoryPanelProps) {
  // Combine current version with previous versions for display
  const allVersions = [
    project.currentVersion,
    ...project.versions.filter(v => v.id !== project.currentVersion.id),
  ];
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };
  
  return (
    <div className="version-history-panel fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-lg shadow-xl overflow-hidden">
        {/* Panel header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Version History
          </h2>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={onClose}
            aria-label="Close panel"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        
        {/* Version list */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {allVersions.length > 0 ? (
            <ul className="space-y-3">
              {allVersions.map((version) => (
                <li
                  key={version.id}
                  className={`p-3 rounded-md border ${
                    version.id === project.currentVersion.id
                      ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800/50'
                      : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/80'
                  } cursor-pointer transition-colors`}
                  onClick={() => onVersionSelect(version.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {version.name}
                    </span>
                    <div className="flex items-center space-x-2">
                      {version.isApproved && (
                        <span className="flex items-center text-xs text-green-700 dark:text-green-400">
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
                            className="mr-1"
                          >
                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                            <path d="m9 12 2 2 4-4" />
                          </svg>
                          Approved
                        </span>
                      )}
                      {version.id === project.currentVersion.id && (
                        <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full dark:bg-indigo-900 dark:text-indigo-300">
                          Current
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>{formatDate(version.timestamp)}</span>
                    {version.approvedBy && (
                      <span>Approved by {version.approvedBy}</span>
                    )}
                  </div>
                  {version.description && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      {version.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto text-gray-400 dark:text-gray-500 mb-3"
              >
                <path d="M12 8V4H8" />
                <rect width="16" height="12" x="4" y="8" rx="2" />
                <path d="M2 14h2" />
                <path d="M20 14h2" />
                <path d="M15 13v2" />
                <path d="M9 13v2" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">
                No version history available
              </p>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          {!readOnly && (
            <button
              className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-650 transition-colors"
              onClick={onClose}
            >
              Create New Version
            </button>
          )}
          <button
            className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-650 transition-colors ml-auto"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 