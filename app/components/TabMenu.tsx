'use client';

import React from 'react';
import { FileText, MessageSquare, Moon, Sun } from 'lucide-react';

interface TabMenuProps {
  activeTab: 'transcript' | 'notes' | 'ai-chat';
  onTabChange: (tab: 'transcript' | 'notes' | 'ai-chat') => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const TabMenu: React.FC<TabMenuProps> = ({
  activeTab,
  onTabChange,
  isDarkMode,
  onToggleTheme
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex space-x-1">
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'transcript' 
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
          }`}
          onClick={() => onTabChange('transcript')}
        >
          <div className="flex items-center gap-2">
            <FileText size={16} />
            <span>Transcript</span>
          </div>
        </button>
        
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'notes' 
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
          }`}
          onClick={() => onTabChange('notes')}
        >
          <div className="flex items-center gap-2">
            <FileText size={16} />
            <span>Notes</span>
          </div>
        </button>
        
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'ai-chat' 
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
          }`}
          onClick={() => onTabChange('ai-chat')}
        >
          <div className="flex items-center gap-2">
            <MessageSquare size={16} />
            <span>AI Chat</span>
          </div>
        </button>
      </div>
      
      <button className="theme-toggle" onClick={onToggleTheme} title="Toggle theme">
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  );
};

export default TabMenu; 