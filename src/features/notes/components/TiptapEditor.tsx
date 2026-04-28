'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading, 
  Link as LinkIcon, 
  CheckSquare, 
  Highlighter, 
  Clock,
  Tag
} from 'lucide-react';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  timestamp?: number;
  onInsertTimestamp?: (time: number) => void;
  onAddTag?: () => void;
  onSaveNote?: () => void;
  autofocus?: boolean;
}

export default function TiptapEditor({
  content,
  onChange,
  placeholder = 'Start typing...',
  readOnly = false,
  timestamp,
  onInsertTimestamp,
  onAddTag,
  onSaveNote,
  autofocus = false
}: TiptapEditorProps) {
  // Format time for display
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Initialize the editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
    ],
    content,
    editable: !readOnly,
    autofocus,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update content if it changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const insertTimestamp = () => {
    if (editor && timestamp && onInsertTimestamp) {
      editor.chain().focus().insertContent(`[${formatTime(timestamp)}] `).run();
      onInsertTimestamp(timestamp);
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-editor-container">
      {!readOnly && (
        <div className="tiptap-toolbar border-b border-gray-200 p-2 flex flex-wrap items-center gap-1 bg-white">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`editor-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
            title="Bold"
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`editor-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
            title="Italic"
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`editor-btn ${editor.isActive('highlight') ? 'is-active' : ''}`}
            title="Highlight"
          >
            <Highlighter size={16} />
          </button>
          
          <div className="toolbar-divider"></div>
          
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`editor-btn ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
            title="Heading"
          >
            <Heading size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`editor-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`}
            title="Bullet List"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`editor-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`}
            title="Numbered List"
          >
            <ListOrdered size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={`editor-btn ${editor.isActive('taskList') ? 'is-active' : ''}`}
            title="Task List"
          >
            <CheckSquare size={16} />
          </button>
          
          <div className="toolbar-divider"></div>
          
          {timestamp !== undefined && (
            <button
              onClick={insertTimestamp}
              className="editor-btn timestamp-btn"
              title="Insert Timestamp"
            >
              <Clock size={16} />
              <span className="ml-1 text-xs">{formatTime(timestamp)}</span>
            </button>
          )}
          
          {onAddTag && (
            <button
              onClick={onAddTag}
              className="editor-btn"
              title="Add Tag"
            >
              <Tag size={16} />
            </button>
          )}
        </div>
      )}
      
      <div className="tiptap-content-wrapper p-3">
        <EditorContent editor={editor} className="tiptap-editor-content prose prose-sm max-w-none" />
      </div>

      {/* Bubble menu for quick formatting */}
      {!readOnly && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 150 }}>
          <div className="bubble-menu-container flex bg-white shadow-lg rounded-md border overflow-hidden">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`bubble-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
            >
              <Bold size={14} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`bubble-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
            >
              <Italic size={14} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={`bubble-btn ${editor.isActive('highlight') ? 'is-active' : ''}`}
            >
              <Highlighter size={14} />
            </button>
            <button
              onClick={() => {
                // Simple implementation for adding links
                const url = window.prompt('URL:');
                if (url) {
                  editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
                }
              }}
              className={`bubble-btn ${editor.isActive('link') ? 'is-active' : ''}`}
            >
              <LinkIcon size={14} />
            </button>
          </div>
        </BubbleMenu>
      )}
      
      {/* Optional save button */}
      {onSaveNote && !readOnly && (
        <div className="flex justify-end p-2 border-t">
          <button 
            onClick={onSaveNote}
            className="save-btn px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Save Note
          </button>
        </div>
      )}
    </div>
  );
} 