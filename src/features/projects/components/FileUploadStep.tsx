'use client';

import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, FileVideo, X, AlertCircle, Info, Check, Clock } from 'lucide-react';

export interface UploadedFile {
  file: File;
  id: string;
}

interface FileUploadStepProps {
  onFilesChange: (files: UploadedFile[]) => void;
  initialFiles?: UploadedFile[];
}

const FileUploadStep: React.FC<FileUploadStepProps> = ({
  onFilesChange,
  initialFiles = []
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(initialFiles);
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRequiredError, setShowRequiredError] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear error when files are uploaded
  useEffect(() => {
    if (uploadedFiles.length > 0) {
      setError(null);
      setShowRequiredError(false);
    } else if (showRequiredError) {
      setError("Please upload a video file to continue");
    }
  }, [uploadedFiles, showRequiredError]);

  // Simulate upload progress for demo purposes
  useEffect(() => {
    uploadedFiles.forEach(file => {
      if (uploadProgress[file.id] === undefined || uploadProgress[file.id] < 100) {
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            const current = prev[file.id] || 0;
            if (current >= 100) {
              clearInterval(interval);
              return prev;
            }
            return {
              ...prev,
              [file.id]: Math.min(current + 10, 100)
            };
          });
        }, 300);
        
        return () => clearInterval(interval);
      }
    });
  }, [uploadedFiles, uploadProgress]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Process each file
    const newFiles: UploadedFile[] = [];
    
    Array.from(files).forEach(file => {
      if (file.type === 'video/mp4') {
        const fileId = Math.random().toString(36).substring(2, 9);
        newFiles.push({
          file,
          id: fileId
        });
        
        // Initialize progress
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: 0
        }));
      } else {
        setError("Only MP4 video files are supported");
      }
    });
    
    const updatedFiles = [...uploadedFiles, ...newFiles];
    setUploadedFiles(updatedFiles);
    onFilesChange(updatedFiles);
    
    // Reset the file input
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
    if (files.length === 0) return;
    
    // Process each file
    const newFiles: UploadedFile[] = [];
    let unsupportedFiles = false;
    
    Array.from(files).forEach(file => {
      if (file.type === 'video/mp4') {
        const fileId = Math.random().toString(36).substring(2, 9);
        newFiles.push({
          file,
          id: fileId
        });
        
        // Initialize progress
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: 0
        }));
      } else {
        unsupportedFiles = true;
      }
    });
    
    if (unsupportedFiles) {
      setError("Some files were not added. Only MP4 video files are supported.");
    }
    
    const updatedFiles = [...uploadedFiles, ...newFiles];
    setUploadedFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  // Manual trigger for file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeFile = (fileId: string) => {
    const filteredFiles = uploadedFiles.filter(f => f.id !== fileId);
    setUploadedFiles(filteredFiles);
    onFilesChange(filteredFiles);
    
    // Show required error if all files are removed
    if (filteredFiles.length === 0) {
      setShowRequiredError(true);
    }
    
    // Remove progress entry
    setUploadProgress(prev => {
      const newProgress = {...prev};
      delete newProgress[fileId];
      return newProgress;
    });
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="flex flex-col">
      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 rounded-md flex items-center">
          <AlertCircle size={16} className="mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Upload area */}
      {uploadedFiles.length === 0 && (
        <div 
          className={`border border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' 
              : error 
                ? 'border-red-300 dark:border-red-800/50 hover:border-red-500 dark:hover:border-red-700' 
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400'
          }`}
          onClick={triggerFileInput}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange} 
            accept="video/mp4" 
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center gap-3">
            <div className={`p-3 rounded-full ${error ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400'}`}>
              <UploadCloud size={32} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Drag and drop video here, or <span className="text-blue-500 dark:text-blue-400">browse</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                MP4 format only, max 50MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Display uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          {uploadedFiles.map((fileData) => (
            <div key={fileData.id} className="relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {/* File info header */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="text-blue-500 dark:text-blue-400">
                    <FileVideo size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                      {fileData.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(fileData.file.size)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {uploadProgress[fileData.id] === 100 ? (
                    <span className="text-green-500 dark:text-green-400 flex items-center">
                      <Check size={16} className="mr-1" />
                      <span className="text-xs">Complete</span>
                    </span>
                  ) : (
                    <span className="text-blue-500 dark:text-blue-400 flex items-center">
                      <Clock size={16} className="mr-1 animate-pulse" />
                      <span className="text-xs">{uploadProgress[fileData.id] || 0}%</span>
                    </span>
                  )}
                  
                  <button 
                    className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(fileData.id);
                    }}
                    aria-label="Remove file"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              
              {/* Progress bar */}
              {uploadProgress[fileData.id] !== undefined && uploadProgress[fileData.id] < 100 && (
                <div className="h-1 bg-gray-100 dark:bg-gray-700 w-full">
                  <div 
                    className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-300"
                    style={{ width: `${uploadProgress[fileData.id]}%` }}
                  />
                </div>
              )}
              
              {/* Video preview */}
              <div className="bg-black aspect-video">
                <video 
                  src={URL.createObjectURL(fileData.file)}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* File info footer */}
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <Info size={14} className="mr-2" />
                This video will be processed for transcript generation after upload
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Upload more files button */}
      {uploadedFiles.length > 0 && (
        <button 
          onClick={triggerFileInput}
          className="mt-4 w-full py-2 px-4 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-2"
        >
          <UploadCloud size={16} />
          Upload another video
        </button>
      )}
    </div>
  );
};

export default FileUploadStep; 