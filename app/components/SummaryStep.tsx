'use client';

import React from 'react';
import { FileVideo, CheckCircle } from 'lucide-react';
import { ProjectInfo } from './ProjectInfoForm';
import { UploadedFile } from './FileUploadStep';

interface SummaryStepProps {
  projectInfo: ProjectInfo;
  uploadedFiles: UploadedFile[];
}

const SummaryStep: React.FC<SummaryStepProps> = ({
  projectInfo,
  uploadedFiles
}) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Summary</h2>
      
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium mb-2 flex items-center">
            <CheckCircle size={20} className="text-green-500 mr-2" />
            Project Details
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm text-gray-500">Project Name</p>
              <p className="font-medium">{projectInfo.name || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-medium">
                {projectInfo.category ? 
                  projectInfo.category.charAt(0).toUpperCase() + projectInfo.category.slice(1) : 
                  'Not specified'}
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-500">Description</p>
            <p className="font-medium">{projectInfo.description || 'No description provided'}</p>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2 flex items-center">
            <CheckCircle size={20} className="text-green-500 mr-2" />
            Videos
          </h3>
          
          {uploadedFiles.length > 0 ? (
            <div className="space-y-2 mt-4">
              {uploadedFiles.map((fileData) => (
                <div key={fileData.id} className="flex items-center p-2 border border-gray-100 rounded-md">
                  <FileVideo size={16} className="text-blue-500 mr-2" />
                  <span className="font-medium">{fileData.file.name}</span>
                  <span className="text-gray-500 text-sm ml-2">({(fileData.file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic mt-4">No videos uploaded</p>
          )}
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h4 className="font-medium text-blue-700 mb-2">Ready to Process</h4>
          <p className="text-sm text-blue-600">
            Your project setup is complete. Click "Finish" to create your project and process your videos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SummaryStep; 