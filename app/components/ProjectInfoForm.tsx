'use client';

import React, { useState } from 'react';

export interface ProjectInfo {
  name: string;
  description: string;
}

interface ProjectInfoFormProps {
  value: ProjectInfo;
  onChange: (data: ProjectInfo) => void;
  showValidation?: boolean;
}

const ProjectInfoForm: React.FC<ProjectInfoFormProps> = ({ value, onChange, showValidation }) => {
  const [touched, setTouched] = useState<{ name: boolean }>({ name: false });
  const isNameInvalid = !value.name.trim();
  const showNameError = (showValidation || touched.name) && isNameInvalid;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value: val } = e.target;
    onChange({ ...value, [name]: val });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-6">Project Information</h2>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={value.name}
            onChange={handleChange}
            onBlur={() => setTouched(t => ({ ...t, name: true }))}
            autoFocus
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${showNameError ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter project name"
          />
          {showNameError && (
            <p className="mt-1 text-sm text-red-500">Project name is required.</p>
          )}
        </div>
        <div className="mt-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={value.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
            placeholder="Enter project description"
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoForm; 