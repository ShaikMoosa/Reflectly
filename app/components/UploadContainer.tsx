'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';

interface UploadContainerProps {
  onFileUpload: (file: File) => void;
  isUploading: boolean;
}

const UploadContainer: React.FC<UploadContainerProps> = ({
  onFileUpload,
  isUploading
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'video/mp4') {
      onFileUpload(file);
    }
    // Reset input value so the same file can be uploaded again if needed
    if (event.target) {
      event.target.value = '';
    }
  };

  // Add drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      if (file.type === 'video/mp4') {
        onFileUpload(file);
      }
    }
  };

  // Manual trigger for file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div 
      className={`upload-container modern-card ${isDragActive ? 'drag-active' : ''}`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={triggerFileInput}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="video/mp4" 
        style={{ display: 'none' }} 
      />
      
      <div className="text-center">
        <UploadCloud className="mx-auto mb-4" size={48} />
        <h3 className="text-lg font-semibold mb-2">Upload your video</h3>
        <p className="text-sm mb-4">
          Drop your MP4 video here, or click to select
        </p>
        {isUploading && (
          <div className="flex justify-center">
            <div className="animate-spin h-6 w-6 border-2 border-accent-purple border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadContainer; 