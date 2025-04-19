'use client';

import React from 'react';
import { Component, Tag, User, RequirementStatus } from '../models/kanban';
import { ChevronDown, ChevronRight, X } from 'lucide-react';

interface KanbanFiltersProps {
  tags: Tag[];
  components: Component[];
  users: User[];
  selectedTags: string[];
  selectedComponents: string[];
  selectedUsers: string[];
  selectedStatuses: RequirementStatus[];
  onTagsChange: (tags: string[]) => void;
  onComponentsChange: (components: string[]) => void;
  onUsersChange: (users: string[]) => void;
  onStatusesChange: (statuses: RequirementStatus[]) => void;
  onClose: () => void;
}

const KanbanFilters: React.FC<KanbanFiltersProps> = ({
  tags,
  components,
  users,
  selectedTags,
  selectedComponents,
  selectedUsers,
  selectedStatuses,
  onTagsChange,
  onComponentsChange,
  onUsersChange,
  onStatusesChange,
  onClose
}) => {
  const [expandedComponents, setExpandedComponents] = React.useState<Record<string, boolean>>({});

  const toggleComponentExpanded = (componentId: string) => {
    setExpandedComponents(prev => ({
      ...prev,
      [componentId]: !prev[componentId]
    }));
  };

  const handleTagChange = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(id => id !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  const handleComponentChange = (componentId: string) => {
    if (selectedComponents.includes(componentId)) {
      onComponentsChange(selectedComponents.filter(id => id !== componentId));
    } else {
      onComponentsChange([...selectedComponents, componentId]);
    }
  };

  const handleUserChange = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      onUsersChange(selectedUsers.filter(id => id !== userId));
    } else {
      onUsersChange([...selectedUsers, userId]);
    }
  };

  const handleStatusChange = (status: RequirementStatus) => {
    if (selectedStatuses.includes(status)) {
      onStatusesChange(selectedStatuses.filter(s => s !== status));
    } else {
      onStatusesChange([...selectedStatuses, status]);
    }
  };

  const renderComponentTree = (component: Component, depth = 0) => {
    const hasChildren = component.children && component.children.length > 0;
    const isExpanded = expandedComponents[component.id];
    
    return (
      <div key={component.id} className="mb-1">
        <div 
          className="flex items-center py-1"
          style={{ marginLeft: `${depth * 1.5}rem` }}
        >
          {hasChildren ? (
            <button 
              onClick={() => toggleComponentExpanded(component.id)}
              className="mr-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <div className="w-5"></div>
          )}
          
          <label className="flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">
            <input
              type="checkbox"
              className="rounded text-blue-600 mr-2"
              checked={selectedComponents.includes(component.id)}
              onChange={() => handleComponentChange(component.id)}
            />
            {component.name}
          </label>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {component.children!.map(child => renderComponentTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900 dark:text-white">Filters</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Status Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Status</h4>
          <div className="space-y-1">
            {['New', 'Pending', 'In Review', 'Approved', 'Revised'].map((status) => (
              <label key={status} className="flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded text-blue-600 mr-2"
                  checked={selectedStatuses.includes(status as RequirementStatus)}
                  onChange={() => handleStatusChange(status as RequirementStatus)}
                />
                {status}
              </label>
            ))}
          </div>
        </div>

        {/* Tags Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Tags</h4>
          <div className="space-y-1">
            {tags.map(tag => (
              <label key={tag.id} className="flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded text-blue-600 mr-2"
                  checked={selectedTags.includes(tag.id)}
                  onChange={() => handleTagChange(tag.id)}
                />
                {tag.name}
              </label>
            ))}
          </div>
        </div>

        {/* Owner Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Owner</h4>
          <div className="space-y-1">
            {users.map(user => (
              <label key={user.id} className="flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded text-blue-600 mr-2"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleUserChange(user.id)}
                />
                <span className="flex items-center">
                  <img 
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=20`}
                    alt={user.name}
                    className="w-5 h-5 rounded-full mr-2"
                  />
                  {user.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Components Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Components</h4>
          <div className="space-y-1">
            {components
              .filter(c => !c.parentId) // Only top-level components
              .map(component => renderComponentTree(component))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanFilters; 