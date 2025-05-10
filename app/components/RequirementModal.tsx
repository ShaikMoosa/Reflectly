'use client';

import React, { useEffect, useState } from 'react';
import { 
  Requirement, 
  RequirementStatus, 
  Component, 
  Tag, 
  User 
} from '../models/kanban';
import { X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface RequirementModalProps {
  isOpen: boolean;
  requirement?: Requirement;
  components: Component[];
  tags: Tag[];
  users: User[];
  columnId?: string;
  onSave: (requirement: Requirement) => void;
  onCancel: () => void;
  onDelete?: (requirementId: string) => void;
  isCreating?: boolean;
}

const RequirementModal: React.FC<RequirementModalProps> = ({
  isOpen,
  requirement,
  components,
  tags,
  users,
  columnId,
  onSave,
  onCancel,
  onDelete,
  isCreating = false
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<RequirementStatus>('New');
  const [componentId, setComponentId] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [code, setCode] = useState('');

  useEffect(() => {
    if (requirement) {
      setTitle(requirement.title);
      setDescription(requirement.description || '');
      setStatus(requirement.status);
      setComponentId(requirement.componentId || '');
      setOwnerId(requirement.ownerId || '');
      setSelectedTags(requirement.tags?.map(tag => tag.id) || []);
      setCode(requirement.code || '');
    } else {
      // Default values for new requirement
      setTitle('');
      setDescription('');
      setStatus('New');
      setComponentId('');
      setOwnerId('');
      setSelectedTags([]);
      setCode('');
    }
  }, [requirement, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate a unique ID for new requirements
    const id = requirement?.id || uuidv4();
    
    // Determine column-based code prefix if no code is set
    let newCode = code;
    if (!newCode && columnId) {
      if (columnId === 'user-needs') newCode = `UN-${Math.floor(Math.random() * 1000)}`;
      else if (columnId === 'design-inputs') newCode = `SR-${Math.floor(Math.random() * 1000)}`;
      else if (columnId === 'design-outputs') newCode = `DO-${Math.floor(Math.random() * 1000)}`;
    }

    // Create or update the requirement
    const updatedRequirement: Requirement = {
      id,
      title,
      description,
      status,
      componentId: componentId || undefined,
      component: componentId ? components.find(c => c.id === componentId) : undefined,
      ownerId: ownerId || undefined,
      owner: ownerId ? users.find(u => u.id === ownerId) : undefined,
      tags: selectedTags.map(tagId => tags.find(tag => tag.id === tagId)!).filter(Boolean),
      links: requirement?.links || [],
      createdAt: requirement?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      code: newCode
    };

    onSave(updatedRequirement);
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    );
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl mx-4 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isCreating ? 'Create New Requirement' : 'Edit Requirement'}
          </h2>
          <button 
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title*
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status*
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RequirementStatus)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="New">New</option>
                <option value="Pending">Pending</option>
                <option value="In Review">In Review</option>
                <option value="Approved">Approved</option>
                <option value="Revised">Revised</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g., SR-1, UN-2"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Component
              </label>
              <select
                value={componentId}
                onChange={(e) => setComponentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select a component</option>
                {components.map(component => (
                  <option key={component.id} value={component.id}>
                    {component.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Owner
              </label>
              <select
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select an owner</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <div
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.id)}
                    className={`px-3 py-1 rounded-md text-sm cursor-pointer transition-colors ${
                      selectedTags.includes(tag.id)
                        ? `bg-${tag.color || 'blue'}-100 text-${tag.color || 'blue'}-800 border-${tag.color || 'blue'}-200 dark:bg-${tag.color || 'blue'}-900/30 dark:text-${tag.color || 'blue'}-400`
                        : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300'
                    } border`}
                  >
                    {tag.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            {!isCreating && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(requirement!.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isCreating ? 'Create' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequirementModal; 