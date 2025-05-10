'use client';

import React, { useState } from 'react';
import TiptapEditor from './TiptapEditor';
import { X } from 'lucide-react';

interface NewNoteEditorProps {
  timestamp: number;
  onSave: (plainText: string, htmlContent: string) => void;
  onCancel: () => void;
}

const NewNoteEditor: React.FC<NewNoteEditorProps> = ({
  timestamp,
  onSave,
  onCancel
}) => {
  const [content, setContent] = useState('');
  
  // Convert HTML to plain text
  const htmlToPlainText = (html: string): string => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  const handleSave = () => {
    if (content.trim()) {
      const plainText = htmlToPlainText(content);
      onSave(plainText, content);
    }
  };

  // Format time for display
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="new-note-editor bg-white rounded-lg shadow-md border">
      <div className="editor-header p-3 border-b flex justify-between items-center">
        <h3 className="text-lg font-medium">New Note at {formatTime(timestamp)}</h3>
        <button 
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={18} />
        </button>
      </div>
      
      <div className="editor-content p-3">
        <TiptapEditor
          content=""
          onChange={setContent}
          placeholder="Start typing your note..."
          timestamp={timestamp}
          onInsertTimestamp={(time) => {}}
          onSaveNote={handleSave}
          autofocus
        />
      </div>
      
      <div className="editor-footer p-3 border-t flex justify-end space-x-2">
        <button 
          onClick={onCancel}
          className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          disabled={!content.trim()}
        >
          Save Note
        </button>
      </div>
    </div>
  );
};

export default NewNoteEditor; 