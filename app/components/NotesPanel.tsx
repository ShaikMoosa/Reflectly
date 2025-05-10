'use client';

import React, { useState, useRef } from 'react';
import { Edit, Check, X, Tag, MessageSquare, Save, Trash2 } from 'lucide-react';

interface Note {
  text: string;
  timestamp: number;
  tags?: string[];
  comment?: string;
  isHighlighted?: boolean;
}

interface NotesPanelProps {
  notes: Note[];
  onNoteClick: (timestamp: number) => void;
  onNoteEdit: (index: number, newText: string) => void;
  onNoteDelete: (index: number) => void;
  onToggleHighlight: (index: number) => void;
  onAddTag: (noteIndex: number, tag: string) => void;
  onRemoveTag: (noteIndex: number, tagIndex: number) => void;
  onAddComment: (noteIndex: number, comment: string) => void;
  suggestedTags: string[];
}

const NotesPanel: React.FC<NotesPanelProps> = ({
  notes,
  onNoteClick,
  onNoteEdit,
  onNoteDelete,
  onToggleHighlight,
  onAddTag,
  onRemoveTag,
  onAddComment,
  suggestedTags
}) => {
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [activeNoteIndex, setActiveNoteIndex] = useState<number | null>(null);

  const tagInputRef = useRef<HTMLInputElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);

  // Format time in seconds to MM:SS format
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const startEditing = (index: number) => {
    setEditingNoteIndex(index);
    setEditText(notes[index].text);
    setTimeout(() => {
      editInputRef.current?.focus();
    }, 0);
  };

  const saveEdit = () => {
    if (editingNoteIndex !== null && editText.trim()) {
      onNoteEdit(editingNoteIndex, editText);
      setEditingNoteIndex(null);
    }
  };

  const cancelEdit = () => {
    setEditingNoteIndex(null);
  };

  const startAddingTag = (index: number) => {
    setActiveNoteIndex(index);
    setIsAddingTag(true);
    setTagInput('');
    setTimeout(() => {
      tagInputRef.current?.focus();
    }, 0);
  };

  const saveTag = () => {
    if (activeNoteIndex !== null && tagInput.trim()) {
      onAddTag(activeNoteIndex, tagInput);
      setTagInput('');
      setIsAddingTag(false);
    }
  };

  const startAddingComment = (index: number) => {
    setActiveNoteIndex(index);
    setIsAddingComment(true);
    setCommentInput('');
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 0);
  };

  const saveComment = () => {
    if (activeNoteIndex !== null && commentInput.trim()) {
      onAddComment(activeNoteIndex, commentInput);
      setCommentInput('');
      setIsAddingComment(false);
    }
  };

  return (
    <div className="notes-container">
      {notes.length > 0 ? (
        <div className="user-notes">
          {notes.map((note, index) => (
            <div key={index} className={`note-item ${note.isHighlighted ? 'highlighted' : ''}`}>
              <div className="note-header">
                <div className="flex items-center gap-2">
                  <span 
                    className="timestamp cursor-pointer" 
                    onClick={() => onNoteClick(note.timestamp)}
                    title="Jump to this timestamp"
                  >
                    {formatTime(note.timestamp)}
                  </span>
                </div>
                
                <div className="note-actions">
                  <button 
                    className={`note-action-btn ${note.isHighlighted ? 'active' : ''}`}
                    onClick={() => onToggleHighlight(index)}
                    title={note.isHighlighted ? "Remove highlight" : "Highlight note"}
                  >
                    <span className="highlight-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={note.isHighlighted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                      </svg>
                    </span>
                  </button>
                  
                  <button 
                    className="note-action-btn"
                    onClick={() => startAddingTag(index)}
                    title="Add tag"
                  >
                    <Tag size={14} />
                  </button>
                  
                  <button 
                    className="note-action-btn"
                    onClick={() => startAddingComment(index)}
                    title="Add comment"
                  >
                    <MessageSquare size={14} />
                  </button>
                  
                  <button 
                    className="note-action-btn"
                    onClick={() => startEditing(index)}
                    title="Edit note"
                  >
                    <Edit size={14} />
                  </button>
                  
                  <button 
                    className="note-action-btn delete"
                    onClick={() => onNoteDelete(index)}
                    title="Delete note"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              <div className="note-content">
                {editingNoteIndex === index ? (
                  <div className="note-edit">
                    <textarea
                      ref={editInputRef}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="note-edit-input"
                    />
                    <div className="note-edit-actions">
                      <button className="tag-input-btn" onClick={cancelEdit} title="Cancel">
                        <X size={14} />
                      </button>
                      <button className="tag-input-btn save" onClick={saveEdit} title="Save">
                        <Check size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`note-text ${note.isHighlighted ? 'highlighted' : ''}`}>
                    {note.text}
                  </div>
                )}
                
                {note.tags && note.tags.length > 0 && (
                  <div className="note-tags">
                    {note.tags.map((tag, tagIndex) => (
                      <div key={tagIndex} className="note-tag">
                        {tag}
                        <button 
                          className="remove-tag-btn"
                          onClick={() => onRemoveTag(index, tagIndex)}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {note.comment && (
                  <div className="note-comment">
                    {note.comment}
                  </div>
                )}
                
                {isAddingTag && activeNoteIndex === index && (
                  <div className="tag-input-container">
                    <input
                      ref={tagInputRef}
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Enter tag..."
                      className="tag-input"
                      onKeyDown={(e) => e.key === 'Enter' && saveTag()}
                    />
                    
                    <div className="tag-input-actions">
                      <button className="tag-input-btn" onClick={() => setIsAddingTag(false)} title="Cancel">
                        <X size={14} />
                      </button>
                      <button className="tag-input-btn save" onClick={saveTag} title="Save">
                        <Check size={14} />
                      </button>
                    </div>
                    
                    {suggestedTags.length > 0 && (
                      <div className="suggested-tags">
                        <div className="suggested-tags-title">Suggested tags:</div>
                        <div className="suggested-tags-list">
                          {suggestedTags.map((tag, i) => (
                            <button
                              key={i}
                              className="suggested-tag-btn"
                              onClick={() => {
                                setTagInput(tag);
                                saveTag();
                              }}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {isAddingComment && activeNoteIndex === index && (
                  <div className="comment-input-container">
                    <textarea
                      ref={commentInputRef}
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Add your comment..."
                      className="comment-input"
                    />
                    
                    <div className="comment-input-actions">
                      <button className="comment-input-btn" onClick={() => setIsAddingComment(false)} title="Cancel">
                        <X size={14} />
                      </button>
                      <button className="comment-input-btn save" onClick={saveComment} title="Save">
                        <Check size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-notes">
          <p>No notes added yet. Add notes from the transcript.</p>
        </div>
      )}
    </div>
  );
};

export default NotesPanel; 