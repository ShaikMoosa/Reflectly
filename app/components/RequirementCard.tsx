'use client';

import React from 'react';
import { Requirement } from '../models/kanban';
import { Draggable } from 'react-beautiful-dnd';

interface RequirementCardProps {
  requirement: Requirement;
  index: number;
  onClick: (requirement: Requirement) => void;
}

const statusColors = {
  'New': 'bg-blue-100 text-blue-800',
  'Pending': 'bg-yellow-100 text-yellow-800',
  'In Review': 'bg-purple-100 text-purple-800',
  'Approved': 'bg-green-100 text-green-800',
  'Revised': 'bg-orange-100 text-orange-800'
};

const RequirementCard: React.FC<RequirementCardProps> = ({ requirement, index, onClick }) => {
  const { id, title, description, status, code, owner, tags, links } = requirement;
  
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-4 mb-3 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 ${
            snapshot.isDragging ? 'shadow-lg' : ''
          }`}
          onClick={() => onClick(requirement)}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center">
              <span className="text-xs font-mono text-gray-500 dark:text-gray-400 mr-2">
                {code}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
              </span>
            </div>
            {owner && (
              <div className="flex items-center">
                <img 
                  src={owner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(owner.name)}&size=28`} 
                  alt={owner.name}
                  className="w-6 h-6 rounded-full"
                  title={`${owner.name} (${owner.role})`}
                />
              </div>
            )}
          </div>
          
          <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
            {title}
          </h3>
          
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
              {description}
            </p>
          )}
          
          <div className="flex flex-wrap items-center justify-between mt-2">
            <div className="flex flex-wrap gap-1">
              {tags && tags.map(tag => (
                <span
                  key={tag.id}
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    tag.color ? `bg-${tag.color}-100 text-${tag.color}-800` : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {tag.name}
                </span>
              ))}
            </div>
            
            {links && links.length > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
                </svg>
                {links.length} Links
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default RequirementCard; 