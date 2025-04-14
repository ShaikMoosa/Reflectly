'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, FileVideo, X } from 'lucide-react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Process each file
    const newFiles: UploadedFile[] = [];
    
    Array.from(files).forEach(file => {
      if (file.type === 'video/mp4') {
        newFiles.push({
          file,
          id: Math.random().toString(36).substring(2, 9)
        });
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
    
    Array.from(files).forEach(file => {
      if (file.type === 'video/mp4') {
        newFiles.push({
          file,
          id: Math.random().toString(36).substring(2, 9)
        });
      } else {
        // Show error for non-MP4 files
        console.error('Only MP4 files are allowed');
        // You could add toast notification here
      }
    });
    
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
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Upload Video</h2>
      <p className="text-gray-600 mb-6">
        Upload an MP4 video file that you want to transcribe and analyze.
        You can either drag and drop your video file here or click to browse your files.
      </p>
      
      <div 
        className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-all ${
          isDragActive ? 'border-blue-500 bg-blue-50' : ''
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
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="bg-blue-100 p-4 rounded-full">
            <UploadCloud size={48} className="text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold">Upload your video</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Maximum file size: 50 MB<br/>
            Supported format: MP4
          </p>
          <button className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 mt-2">
            Choose a video
          </button>
        </div>
      </div>

      {/* Display uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Uploaded Video</h3>
          <div className="space-y-4">
            {uploadedFiles.map((fileData) => (
              <div key={fileData.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between bg-white shadow-sm">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-4">
                    <FileVideo size={24} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">{fileData.file.name}</p>
                    <p className="text-gray-500 text-sm">{(fileData.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(fileData.id);
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            ))}
            
            {/* Preview container for the video */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6 rounded-lg overflow-hidden border border-gray-200">
                <video 
                  src={URL.createObjectURL(uploadedFiles[0].file)}
                  controls
                  className="w-full h-auto"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadStep; 