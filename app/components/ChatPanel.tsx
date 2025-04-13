'use client';

import React, { useState, useRef } from 'react';
import { Send } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  transcriptAvailable: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  transcriptAvailable
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !transcriptAvailable || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setInputValue('');
      await onSendMessage(inputValue);
    } finally {
      setIsSubmitting(false);
      chatInputRef.current?.focus();
    }
  };

  // Scroll to bottom of messages when new ones arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-section">
      <h2 id="chat-heading">AI Chat</h2>
      
      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-welcome">
              <p>Chat with AI about this video. Ask questions about the content or request summaries.</p>
              {!transcriptAvailable && (
                <p className="text-accent-red mt-2">
                  Note: Please generate or import a transcript first to enable AI chat functionality.
                </p>
              )}
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div key={index} className={`chat-message ${message.role}`}>
                  <div className="message-content">{message.content}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="chat-input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="chat-input"
            ref={chatInputRef}
            disabled={!transcriptAvailable || isSubmitting}
          />
          <button 
            type="submit" 
            className="chat-send-button"
            disabled={!transcriptAvailable || isSubmitting}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel; 