'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, CornerUpRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  isLoading?: boolean;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  transcriptAvailable: boolean;
  currentTimestamp?: number;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  transcriptAvailable,
  currentTimestamp
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputHeight, setInputHeight] = useState(40); // Default height
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-resize textarea as content grows
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Reset height to measure the scrollHeight accurately
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(Math.max(40, textareaRef.current.scrollHeight), 120);
      textareaRef.current.style.height = `${newHeight}px`;
      setInputHeight(newHeight);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !transcriptAvailable || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSendMessage(inputValue);
      setInputValue('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = '40px';
        setInputHeight(40);
      }
    } finally {
      setIsSubmitting(false);
      textareaRef.current?.focus();
    }
  };

  // Scroll to bottom of messages when new ones arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-panel h-full flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="chat-header p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-800">AI Chat</h2>
      </div>
      
      {/* Messages */}
      <div 
        ref={chatContainerRef}
        className="chat-messages flex-1 p-4 overflow-y-auto space-y-4"
      >
        {messages.length === 0 ? (
          <div className="chat-welcome text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
              <CornerUpRight size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-600 mb-2">Ask the AI about this video content</p>
            <p className="text-sm text-gray-500">
              Try questions like "Summarize the main points" or "What was discussed at {formatTimestamp(currentTimestamp || 0)}?"
            </p>
            
            {!transcriptAvailable && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md text-gray-600 text-sm border border-gray-200">
                Please generate or import a transcript first to enable AI chat.
              </div>
            )}
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`message-container ${
                  message.role === 'user' ? 'flex justify-end' : 'flex justify-start'
                }`}
              >
                <div 
                  className={`message max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-gray-100 text-gray-800' 
                      : 'bg-white border border-gray-200 shadow-sm text-gray-700'
                  }`}
                >
                  <div className="message-content">
                    {message.isLoading ? (
                      <div>{message.content}</div>
                    ) : (
                      <div className="markdown prose prose-sm max-w-none prose-headings:font-bold prose-headings:my-1 prose-p:my-1 prose-ul:pl-4 prose-ol:pl-4 prose-li:my-0.5 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-blockquote:pl-2 prose-blockquote:border-l-2 prose-blockquote:border-gray-300 prose-blockquote:italic">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                  {message.timestamp && (
                    <div className="message-timestamp text-xs text-gray-500 mt-1">
                      {message.timestamp}
                    </div>
                  )}
                  {message.isLoading && (
                    <div className="loading-indicator flex space-x-1 mt-1">
                      <div className="dot w-1.5 h-1.5 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: '0ms' }}></div>
                      <div className="dot w-1.5 h-1.5 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: '300ms' }}></div>
                      <div className="dot w-1.5 h-1.5 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: '600ms' }}></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Input area */}
      <div className="chat-input-container p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message…"
            disabled={!transcriptAvailable || isSubmitting}
            className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 resize-none"
            style={{ height: `${inputHeight}px` }}
          />
          <button 
            type="submit" 
            className="absolute right-3 bottom-0 h-full flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors disabled:text-gray-300"
            disabled={!transcriptAvailable || isSubmitting || !inputValue.trim()}
          >
            <Send size={18} className={isSubmitting ? 'opacity-50' : ''} />
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-2 pl-1">
          Press Enter to send, Shift + Enter for a new line
        </p>
      </div>
    </div>
  );
};

export default ChatPanel; 