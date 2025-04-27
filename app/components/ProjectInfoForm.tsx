'use client';

import React, { useState } from 'react';

export interface ProjectInfo {
  name: string;
  description: string;
}

interface ProjectInfoFormProps {
  value: ProjectInfo;
  onChange: (value: ProjectInfo) => void;
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
    <div className="space-y-5">
      <div>
        <input
          type="text"
          id="name"
          name="name"
          value={value.name}
          onChange={handleChange}
          onBlur={() => setTouched(t => ({ ...t, name: true }))}
          autoFocus
          className={`w-full px-3 py-2 text-xl font-medium bg-transparent border-0 border-b-2 focus:outline-none focus:ring-0 ${showNameError ? 'border-red-500' : 'border-gray-200 dark:border-gray-700 focus:border-blue-500'}`}
          placeholder="Untitled project"
        />
        {showNameError && (
          <p className="mt-1 text-sm text-red-500">Project name is required.</p>
        )}
      </div>
      
      <div>
        <textarea
          id="description"
          name="description"
          value={value.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 mt-2 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-600 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
          placeholder="Add a description..."
        />
      </div>
    </div>
  );
};

export default ProjectInfoForm; 