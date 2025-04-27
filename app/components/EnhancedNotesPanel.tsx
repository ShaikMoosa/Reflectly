'use client';

import React, { useState, useEffect } from 'react';
import { Edit, Check, X, Tag, MessageSquare, Trash2, Clock, Plus } from 'lucide-react';
import TiptapEditor from './TiptapEditor';

// Import the Tiptap styles
import '../styles/tiptap.css';

interface Note {
  id: string;
  text: string;
  htmlContent?: string;
  timestamp: number;
  tags?: string[];
  comment?: string;
  isHighlighted?: boolean;
}

interface EnhancedNotesPanelProps {
  notes: Note[];
  onNoteClick: (timestamp: number) => void;
  onNoteEdit: (id: string, content: string, htmlContent: string) => void;
  onNoteDelete: (id: string) => void;
  onToggleHighlight: (id: string) => void;
  onAddTag: (noteId: string, tag: string) => void;
  onRemoveTag: (noteId: string, tagIndex: number) => void;
  onAddComment: (noteId: string, comment: string) => void;
  suggestedTags: string[];
  currentTimestamp?: number;
  onCreateNote?: (timestamp: number) => void;
}

const EnhancedNotesPanel: React.FC<EnhancedNotesPanelProps> = ({
  notes,
  onNoteClick,
  onNoteEdit,
  onNoteDelete,
  onToggleHighlight,
  onAddTag,
  onRemoveTag,
  onAddComment,
  suggestedTags,
  currentTimestamp,
  onCreateNote
}) => {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  // Format time in seconds to MM:SS format
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const startEditing = (note: Note) => {
    setEditingNoteId(note.id);
    setNoteContent(note.htmlContent || note.text);
  };

  const saveEdit = (id: string, plainText: string, htmlContent: string) => {
    if (editingNoteId && noteContent.trim()) {
      onNoteEdit(id, plainText, htmlContent);
      setEditingNoteId(null);
    }
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
  };

  const startAddingTag = (id: string) => {
    setActiveNoteId(id);
    setIsAddingTag(true);
    setTagInput('');
  };

  const saveTag = () => {
    if (activeNoteId !== null && tagInput.trim()) {
      onAddTag(activeNoteId, tagInput);
      setTagInput('');
      setIsAddingTag(false);
    }
  };

  const startAddingComment = (id: string) => {
    setActiveNoteId(id);
    setIsAddingComment(true);
    setCommentInput('');
  };

  const saveComment = () => {
    if (activeNoteId !== null && commentInput.trim()) {
      onAddComment(activeNoteId, commentInput);
      setCommentInput('');
      setIsAddingComment(false);
    }
  };

  const handleCreateNote = () => {
    if (currentTimestamp !== undefined && onCreateNote) {
      onCreateNote(currentTimestamp);
    }
  };

  // Convert HTML to plain text (simple implementation)
  const htmlToPlainText = (html: string): string => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  return (
    <div className="enhanced-notes-container bg-white rounded-lg shadow-sm border overflow-hidden h-full flex flex-col">
      <div className="notes-header bg-gray-50 p-3 border-b flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Notes</h3>
        {currentTimestamp !== undefined && onCreateNote && (
          <button 
            onClick={handleCreateNote}
            className="create-note-btn flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Plus size={16} />
            <span>New Note</span>
          </button>
        )}
      </div>
      
      <div className="notes-content flex-1 overflow-y-auto">
        {notes.length > 0 ? (
          <div className="user-notes p-4 space-y-4">
            {notes.map((note) => (
              <div 
                key={note.id} 
                className={`note-item border rounded-md overflow-hidden ${
                  note.isHighlighted ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className="note-header bg-gray-50 px-3 py-2 border-b flex items-center justify-between">
                  <div 
                    className="flex items-center gap-2 cursor-pointer" 
                    onClick={() => onNoteClick(note.timestamp)}
                  >
                    <Clock size={14} className="text-gray-500" />
                    <span className="timestamp text-sm font-mono text-gray-600">
                      {formatTime(note.timestamp)}
                    </span>
                  </div>
                  
                  <div className="note-actions flex items-center gap-1">
                    <button 
                      className={`note-action-btn p-1 rounded-md ${note.isHighlighted ? 'bg-yellow-100 text-yellow-700' : 'hover:bg-gray-200'}`}
                      onClick={() => onToggleHighlight(note.id)}
                      title={note.isHighlighted ? "Remove highlight" : "Highlight note"}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={note.isHighlighted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                      </svg>
                    </button>
                    
                    <button 
                      className="note-action-btn p-1 rounded-md hover:bg-gray-200"
                      onClick={() => startAddingTag(note.id)}
                      title="Add tag"
                    >
                      <Tag size={16} />
                    </button>
                    
                    <button 
                      className="note-action-btn p-1 rounded-md hover:bg-gray-200"
                      onClick={() => startAddingComment(note.id)}
                      title="Add comment"
                    >
                      <MessageSquare size={16} />
                    </button>
                    
                    <button 
                      className="note-action-btn p-1 rounded-md hover:bg-gray-200"
                      onClick={() => startEditing(note)}
                      title="Edit note"
                    >
                      <Edit size={16} />
                    </button>
                    
                    <button 
                      className="note-action-btn p-1 rounded-md hover:bg-red-100 text-red-500"
                      onClick={() => onNoteDelete(note.id)}
                      title="Delete note"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="note-content p-3">
                  {editingNoteId === note.id ? (
                    <div className="note-edit">
                      <TiptapEditor
                        content={noteContent}
                        onChange={setNoteContent}
                        timestamp={note.timestamp}
                        onInsertTimestamp={(time) => {}}
                        onSaveNote={() => {
                          const plainText = htmlToPlainText(noteContent);
                          saveEdit(note.id, plainText, noteContent);
                        }}
                        autofocus
                      />
                      <div className="note-edit-actions mt-2 flex justify-end gap-2">
                        <button 
                          className="cancel-btn px-3 py-1 text-sm text-gray-600 border rounded-md hover:bg-gray-100"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="note-display">
                      {note.htmlContent ? (
                        <div 
                          className="note-html-content prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: note.htmlContent }}
                        />
                      ) : (
                        <div className="note-text whitespace-pre-wrap">{note.text}</div>
                      )}
                    </div>
                  )}
                  
                  {note.tags && note.tags.length > 0 && (
                    <div className="note-tags mt-3 flex flex-wrap gap-2">
                      {note.tags.map((tag, tagIndex) => (
                        <div key={tagIndex} className="note-tag bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full flex items-center">
                          {tag}
                          <button 
                            className="remove-tag-btn ml-1 text-gray-500 hover:text-gray-700"
                            onClick={() => onRemoveTag(note.id, tagIndex)}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {note.comment && (
                    <div className="note-comment mt-3 bg-blue-50 text-blue-800 p-3 rounded-md text-sm italic">
                      {note.comment}
                    </div>
                  )}
                  
                  {isAddingTag && activeNoteId === note.id && (
                    <div className="tag-input-container mt-3 border rounded-md overflow-hidden flex">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Enter tag..."
                        className="tag-input flex-1 p-2 text-sm border-none outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && saveTag()}
                      />
                      
                      <div className="tag-input-actions flex">
                        <button className="tag-input-btn p-2 text-gray-500 hover:bg-gray-100" onClick={() => setIsAddingTag(false)} title="Cancel">
                          <X size={16} />
                        </button>
                        <button className="tag-input-btn p-2 text-blue-500 hover:bg-blue-50" onClick={saveTag} title="Save">
                          <Check size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {isAddingTag && activeNoteId === note.id && suggestedTags.length > 0 && (
                    <div className="suggested-tags mt-2">
                      <div className="suggested-tags-title text-xs text-gray-500 mb-1">Suggested tags:</div>
                      <div className="suggested-tags-list flex flex-wrap gap-1">
                        {suggestedTags.map((tag, i) => (
                          <button
                            key={i}
                            className="suggested-tag-btn text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                            onClick={() => {
                              setTagInput(tag);
                              setTimeout(() => saveTag(), 0);
                            }}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {isAddingComment && activeNoteId === note.id && (
                    <div className="comment-input-container mt-3 border rounded-md overflow-hidden">
                      <textarea
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="Add your comment..."
                        className="comment-input w-full p-2 text-sm border-none outline-none resize-y min-h-[80px]"
                      />
                      
                      <div className="comment-input-actions flex justify-end border-t bg-gray-50 p-2">
                        <button 
                          className="cancel-btn px-3 py-1 text-sm text-gray-600 border rounded-md hover:bg-gray-100 mr-2" 
                          onClick={() => setIsAddingComment(false)}
                        >
                          Cancel
                        </button>
                        <button 
                          className="save-btn px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600" 
                          onClick={saveComment}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-notes flex flex-col items-center justify-center h-full p-6 text-center text-gray-500">
            <MessageSquare size={32} className="text-gray-300 mb-2" />
            <p>No notes added yet.</p>
            <p className="text-sm mt-1">Add notes from the transcript or create a new note.</p>
            {currentTimestamp !== undefined && onCreateNote && (
              <button
                onClick={handleCreateNote}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Create Note
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedNotesPanel; 