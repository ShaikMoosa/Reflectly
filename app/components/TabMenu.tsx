'use client';

import React from 'react';
import { FileText, MessageSquare, Sun, Moon } from 'lucide-react';

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
    <div className="top-controls">
      <div className="tab-menu">
        <button
          className={`tab-button ${activeTab === 'transcript' ? 'active' : ''}`}
          onClick={() => onTabChange('transcript')}
        >
          <FileText size={16} />
          <span>Transcript</span>
        </button>
        
        <button
          className={`tab-button ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => onTabChange('notes')}
        >
          <FileText size={16} />
          <span>Notes</span>
        </button>
        
        <button
          className={`tab-button ${activeTab === 'ai-chat' ? 'active' : ''}`}
          onClick={() => onTabChange('ai-chat')}
        >
          <MessageSquare size={16} />
          <span>AI Chat</span>
        </button>
      </div>
      
      <button className="theme-toggle" onClick={onToggleTheme} title="Toggle theme">
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  );
};

export default TabMenu; 