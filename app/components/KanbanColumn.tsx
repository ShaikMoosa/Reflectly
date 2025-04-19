'use client';

import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { KanbanColumn as KanbanColumnType, Requirement } from '../models/kanban';
import RequirementCard from './RequirementCard';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  column: KanbanColumnType;
  onCardClick: (requirement: Requirement) => void;
  onAddCard: (columnId: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, onCardClick, onAddCard }) => {
  return (
    <div className="flex flex-col min-w-[350px] bg-gray-50 dark:bg-gray-850 rounded-lg shadow p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h3 className="font-semibold text-gray-800 dark:text-white">{column.title}</h3>
          <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
            {column.items.length}
          </span>
        </div>
        <button 
          className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          onClick={() => onAddCard(column.id)}
          title={`Add to ${column.title}`}
        >
          <Plus size={16} />
        </button>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto ${
              snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            } rounded transition-colors p-1 min-h-[200px]`}
          >
            {column.items.map((requirement, index) => (
              <RequirementCard 
                key={requirement.id} 
                requirement={requirement} 
                index={index}
                onClick={onCardClick}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn; 