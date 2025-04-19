'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Search, Plus, Filter, MoreHorizontal, Edit2, Trash2, Link, MessageSquare, Grid, List, Settings, X } from 'lucide-react';

// Define the task type
interface Task {
  id: string;
  content: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: string;
  tags: string[];
  // New fields
  code?: string; // For requirement codes like UN-1, SR-1
  status: 'new' | 'in_review' | 'approved' | 'pending' | 'revised';
  type?: 'labeling' | 'battery' | 'electrode' | 'system' | 'other';
  links?: string[]; // IDs of linked requirements
  system?: string; // System/subsystem classification
  createdAt: string;
  updatedAt: string;
  commentCount?: number;
}

// Define the column type
interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

// Define the board data type
interface BoardData {
  tasks: {
    [key: string]: Task;
  };
  columns: {
    [key: string]: Column;
  };
  columnOrder: string[];
}

const initialData: BoardData = {
  tasks: {
    'task-1': {
      id: 'task-1',
      content: 'System shall conform to all standards required for sale in USA',
      description: 'Ensure compliance with all regulatory standards for medical devices in the US market',
      priority: 'high',
      assignee: 'John',
      dueDate: '2023-11-30',
      tags: ['compliance', 'regulatory'],
      code: 'UN-1',
      status: 'new',
      type: 'system',
      links: ['task-3', 'task-5'],
      system: 'System Requirements',
      createdAt: '2023-10-15T10:30:00Z',
      updatedAt: '2023-10-15T10:30:00Z',
      commentCount: 2
    },
    'task-2': {
      id: 'task-2',
      content: 'System shall conform to IEC 60601-1',
      description: 'Implementation must comply with IEC standards for medical electrical equipment',
      priority: 'medium',
      assignee: 'Sarah',
      dueDate: '2023-12-05',
      tags: ['design', 'compliance'],
      code: 'SR-1',
      status: 'in_review',
      type: 'battery',
      links: ['task-1'],
      system: 'Subsystem Requirements',
      createdAt: '2023-10-17T09:15:00Z',
      updatedAt: '2023-10-17T09:15:00Z',
      commentCount: 5
    },
    'task-3': {
      id: 'task-3',
      content: 'System shall have a Type BF part per IEC 60601',
      description: 'Implement electrical isolation in accordance with Type BF specifications',
      priority: 'low',
      assignee: 'Mike',
      dueDate: '2023-12-10',
      tags: ['safety'],
      code: 'DO-1',
      status: 'approved',
      type: 'labeling',
      system: 'Design Output',
      createdAt: '2023-10-08T14:30:00Z',
      updatedAt: '2023-10-19T15:40:00Z',
      commentCount: 2
    },
    'task-4': {
      id: 'task-4',
      content: 'System shall use an IEC 62133 Certified Battery',
      description: 'Battery selection must comply with IEC 62133 safety standards',
      priority: 'high',
      assignee: 'John',
      dueDate: '2023-11-25',
      tags: ['safety', 'compliance'],
      code: 'DN-1',
      status: 'in_review',
      type: 'battery',
      links: ['task-3'],
      system: 'Design Output',
      createdAt: '2023-10-11T10:45:00Z',
      updatedAt: '2023-10-17T13:25:00Z',
      commentCount: 2
    },
    'task-5': {
      id: 'task-5',
      content: 'System shall have at least 1 hour of functional use',
      description: 'Battery must support minimum 1 hour operation under normal usage conditions',
      priority: 'medium',
      assignee: 'Lisa',
      dueDate: '2023-12-15',
      tags: ['performance'],
      code: 'UN-2',
      status: 'pending',
      type: 'battery',
      links: ['task-4'],
      system: 'User Needs',
      createdAt: '2023-10-13T15:50:00Z',
      updatedAt: '2023-10-13T15:50:00Z',
      commentCount: 3
    }
  },
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'User Needs',
      taskIds: ['task-1', 'task-5']
    },
    'column-2': {
      id: 'column-2',
      title: 'Design Inputs',
      taskIds: ['task-2', 'task-4']
    },
    'column-3': {
      id: 'column-3',
      title: 'Design Output',
      taskIds: ['task-3']
    }
  },
  columnOrder: ['column-1', 'column-2', 'column-3']
};

// Priority colors
const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

// Tag colors (rotate through these for different tags)
const tagColors = [
  'bg-purple-100 text-purple-800',
  'bg-green-100 text-green-800',
  'bg-pink-100 text-pink-800',
  'bg-indigo-100 text-indigo-800',
  'bg-teal-100 text-teal-800'
];

// Inside the component, add these status color mappings
const statusColors = {
  new: 'bg-blue-100 text-blue-800 border-blue-200',
  in_review: 'bg-purple-100 text-purple-800 border-purple-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  revised: 'bg-orange-100 text-orange-800 border-orange-200'
};

const typeIcons = {
  system: '🔄',
  battery: '🔋',
  electrode: '⚡',
  labeling: '🏷️',
  other: '📋'
};

// Define system options
const systemOptions = ['User Needs', 'System Requirements', 'Subsystem Requirements', 'Design Input', 'Design Output'];

const FixedKanbanBoard: React.FC = () => {
  const [boardData, setBoardData] = useState<BoardData>(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState({
    priority: [] as ('low' | 'medium' | 'high')[],
    assignee: [] as string[],
    tags: [] as string[],
    status: [] as ('new' | 'in_review' | 'approved' | 'pending' | 'revised')[]
  });

  // Form state for new/edit task
  const [taskForm, setTaskForm] = useState({
    id: '',
    content: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignee: '',
    dueDate: '',
    tags: [] as string[],
    code: '',
    status: 'new' as 'new' | 'in_review' | 'approved' | 'pending' | 'revised',
    type: 'other' as 'labeling' | 'battery' | 'electrode' | 'system' | 'other',
    links: [] as string[],
    system: '',
    createdAt: '',
    updatedAt: '',
    commentCount: 0
  });

  // Available assignees for dropdown
  const assignees = ['John', 'Sarah', 'Mike', 'Lisa'];
  // Available tags for selection
  const availableTags = ['frontend', 'backend', 'design', 'bug', 'feature', 'documentation', 'ui', 'security', 'marketing'];

  // Add state for view type
  const [viewType, setViewType] = useState<'grid' | 'traceability'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Add loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Track active filters count
  const activeFiltersCount = 
    (filter.priority?.length || 0) + 
    (filter.assignee?.length || 0) + 
    (filter.tags?.length || 0) + 
    (filter.status?.length || 0);

  // Add highlight matching text function
  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, i) => 
          regex.test(part) ? 
            <span key={i} className="bg-yellow-200 dark:bg-yellow-700">{part}</span> : 
            <span key={i}>{part}</span>
        )}
      </>
    );
  };

  // Handle drag end event
  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    // If there's no destination, do nothing
    if (!destination) return;

    // If the destination is the same as the source and the index is the same, do nothing
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Get source and destination columns
    const sourceColumn = boardData.columns[source.droppableId];
    const destinationColumn = boardData.columns[destination.droppableId];

    // If moving within the same column
    if (sourceColumn === destinationColumn) {
      const newTaskIds = Array.from(sourceColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...sourceColumn,
        taskIds: newTaskIds
      };

      const newBoardData = {
        ...boardData,
        columns: {
          ...boardData.columns,
          [newColumn.id]: newColumn
        }
      };

      setBoardData(newBoardData);
      return;
    }

    // Moving from one column to another
    const sourceTaskIds = Array.from(sourceColumn.taskIds);
    sourceTaskIds.splice(source.index, 1);
    const newSourceColumn = {
      ...sourceColumn,
      taskIds: sourceTaskIds
    };

    const destinationTaskIds = Array.from(destinationColumn.taskIds);
    destinationTaskIds.splice(destination.index, 0, draggableId);
    const newDestinationColumn = {
      ...destinationColumn,
      taskIds: destinationTaskIds
    };

    const newBoardData = {
      ...boardData,
      columns: {
        ...boardData.columns,
        [newSourceColumn.id]: newSourceColumn,
        [newDestinationColumn.id]: newDestinationColumn
      }
    };

    setBoardData(newBoardData);
  };

  // Handle task creation or update
  const handleSaveTask = (task: Task) => {
    if (task.id in boardData.tasks) {
      // Update existing task
      setBoardData({
        ...boardData,
        tasks: {
          ...boardData.tasks,
          [task.id]: task
        }
      });
    } else {
      // Add new task to the first column
      const firstColumn = boardData.columns[boardData.columnOrder[0]];
      setBoardData({
        ...boardData,
        tasks: {
          ...boardData.tasks,
          [task.id]: task
        },
        columns: {
          ...boardData.columns,
          [firstColumn.id]: {
            ...firstColumn,
            taskIds: [...firstColumn.taskIds, task.id]
          }
        }
      });
    }
    setShowModal(false);
    setCurrentTask(null);
  };

  // Handle task deletion
  const handleDeleteTask = (taskId: string) => {
    // Find which column contains this task
    let columnWithTask: Column | null = null;
    for (const columnId in boardData.columns) {
      if (boardData.columns[columnId].taskIds.includes(taskId)) {
        columnWithTask = boardData.columns[columnId];
        break;
      }
    }

    if (!columnWithTask) return;

    // Remove task from column
    const newTaskIds = columnWithTask.taskIds.filter(id => id !== taskId);
    const newColumn = {
      ...columnWithTask,
      taskIds: newTaskIds
    };

    // Create new tasks object without the deleted task
    const { [taskId]: deletedTask, ...remainingTasks } = boardData.tasks;

    const newBoardData = {
      ...boardData,
      tasks: remainingTasks,
      columns: {
        ...boardData.columns,
        [columnWithTask.id]: newColumn
      }
    };

    setBoardData(newBoardData);
  };

  // Improved filtering function with better performance
  const getFilteredTasks = () => {
    // Avoid unnecessary work if no filters applied
    if (!searchTerm && !activeFiltersCount) return boardData;
    
    const filtered = { ...boardData };
    const activeFilters = {
      status: filter.status?.length > 0,
      priority: filter.priority.length > 0,
      tags: filter.tags.length > 0,
      assignee: filter.assignee.length > 0
    };

    // Apply search filter
    for (const columnId in filtered.columns) {
      filtered.columns[columnId] = {
        ...filtered.columns[columnId],
        taskIds: filtered.columns[columnId].taskIds.filter(taskId => {
          const task = filtered.tasks[taskId];
          
          // Apply search term filter
          const matchesSearch = !searchTerm || 
            task.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
          
          if (!matchesSearch) return false;
          
          // Apply status filter
          const matchesStatus = !activeFilters.status || 
            filter.status?.includes(task.status);
          
          if (activeFilters.status && !matchesStatus) return false;
          
          // Apply priority filter
          const matchesPriority = !activeFilters.priority || 
            filter.priority.includes(task.priority);
          
          if (activeFilters.priority && !matchesPriority) return false;
          
          // Apply tags filter (match if any tag matches)
          const matchesTags = !filter.tags.length || 
            task.tags.some(tag => filter.tags.includes(tag));
          
          if (filter.tags.length > 0 && !matchesTags) return false;
          
          // Apply assignee filter
          const matchesAssignee = !filter.assignee.length || 
            (task.assignee && filter.assignee.includes(task.assignee));
          
          if (filter.assignee.length > 0 && !matchesAssignee) return false;
          
          return true;
        })
      };
    }

    return filtered;
  };

  const getTagColor = (tag: string) => {
    // Simple hash function to consistently assign the same color to the same tag
    const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return tagColors[hash % tagColors.length];
  };

  const openTaskModal = (task: Task | null = null) => {
    if (task) {
      // Edit existing task
      setTaskForm({
        id: task.id,
        content: task.content,
        description: task.description || '',
        priority: task.priority,
        assignee: task.assignee || '',
        dueDate: task.dueDate || '',
        tags: [...task.tags],
        code: task.code || '',
        status: task.status,
        type: task.type || 'other',
        links: task.links || [],
        system: task.system || '',
        createdAt: task.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        commentCount: task.commentCount || 0
      });
    } else {
      // Create new task
      setTaskForm({
        id: `task-${Date.now()}`,
        content: '',
        description: '',
        priority: 'medium',
        assignee: '',
        dueDate: '',
        tags: [],
        code: '',
        status: 'new',
        type: 'other',
        links: [],
        system: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        commentCount: 0
      });
    }
    setCurrentTask(task);
    setShowModal(true);
  };

  const handleTagToggle = (tag: string) => {
    if (taskForm.tags.includes(tag)) {
      setTaskForm({
        ...taskForm,
        tags: taskForm.tags.filter(t => t !== tag)
      });
    } else {
      setTaskForm({
        ...taskForm,
        tags: [...taskForm.tags, tag]
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveTask(taskForm);
  };

  // Handle status filter toggle
  const handleStatusToggle = (status: 'new' | 'in_review' | 'approved' | 'pending' | 'revised') => {
    setFilter(prev => {
      const statusFilters = prev.status;
      const newStatusFilters = statusFilters.includes(status)
        ? statusFilters.filter(s => s !== status)
        : [...statusFilters, status];
      
      return { ...prev, status: newStatusFilters };
    });
  };

  // Handle priority filter toggle
  const handlePriorityToggle = (priority: 'low' | 'medium' | 'high') => {
    setFilter(prev => {
      const newPriorities = prev.priority.includes(priority)
        ? prev.priority.filter(p => p !== priority)
        : [...prev.priority, priority];
      return { ...prev, priority: newPriorities };
    });
  };

  // Handle assignee filter toggle
  const handleAssigneeToggle = (assignee: string) => {
    setFilter(prev => {
      const newAssignees = prev.assignee.includes(assignee)
        ? prev.assignee.filter(a => a !== assignee)
        : [...prev.assignee, assignee];
      return { ...prev, assignee: newAssignees };
    });
  };

  // Handle tag filter toggle
  const handleTagFilterToggle = (tag: string) => {
    setFilter(prev => {
      const newTags = prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag];
      return { ...prev, tags: newTags };
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredData = getFilteredTasks();

  // Add this function to render the traceability view
  const renderTraceabilityView = () => {
    // Flatten all tasks into a single array
    const allTasks = Object.values(boardData.tasks);
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Code</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">System</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assignee</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Links</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {allTasks.map(task => (
                <tr 
                  key={task.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => openTaskModal(task)}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">
                    {task.code || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                    {task.content}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[task.status]}`}>
                      {task.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {task.type ? `${typeIcons[task.type]} ${task.type.charAt(0).toUpperCase() + task.type.slice(1)}` : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {task.system || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {task.assignee || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {task.links && task.links.length > 0 ? (
                      <span className="flex items-center text-blue-600 dark:text-blue-400">
                        <Link className="h-3 w-3 mr-1" />
                        {task.links.length} Links
                      </span>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Add keyboard handler for modal
  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowModal(false);
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleFormSubmit(e as unknown as React.FormEvent);
    }
  };

  // Update rendered task cards 
  const renderTaskCard = (task: Task, provided: any, snapshot: any) => (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`group bg-white dark:bg-gray-700 p-4 mb-3 rounded-lg shadow-sm hover:shadow-md transition-all ${
        snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-300 dark:ring-indigo-600' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 max-w-[calc(100%-24px)]">
          {task.type && <span className="flex-shrink-0 text-base">{typeIcons[task.type]}</span>}
          {task.code && (
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400 flex-shrink-0 bg-gray-100 dark:bg-gray-600 px-1.5 py-0.5 rounded">
              {task.code}
            </span>
          )}
          <h4 className="font-medium text-gray-900 dark:text-white text-sm leading-5 break-words">
            {searchTerm ? highlightMatch(task.content, searchTerm) : task.content}
          </h4>
        </div>
        <div className="relative flex-shrink-0">
          <button 
            aria-label="Task options"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {task.description && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 hover:line-clamp-none transition-all">
          {searchTerm ? highlightMatch(task.description, searchTerm) : task.description}
        </div>
      )}
      
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {task.tags.map(tag => (
            <span 
              key={tag} 
              className={`text-xs px-2 py-0.5 rounded-full ${getTagColor(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      <div className="flex justify-between items-center mt-2 text-xs border-t pt-2 border-gray-100 dark:border-gray-600">
        <span className={`px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
        <span className={`px-2 py-0.5 rounded-full ${statusColors[task.status]}`}>
          {task.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </span>
        {task.assignee && (
          <span className="bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded-full text-gray-700 dark:text-gray-300">
            {task.assignee}
          </span>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <div className="flex space-x-2">
          <button 
            className="text-xs text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 flex items-center opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              openTaskModal(task);
            }}
            aria-label="Edit task"
          >
            <Edit2 className="h-3 w-3 mr-1" />
            Edit
          </button>
          <button 
            className="text-xs text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 flex items-center opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteTask(task.id);
            }}
            aria-label="Delete task"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </button>
        </div>
        <div className="flex items-center text-xs text-gray-500">
          {task.links && task.links.length > 0 && (
            <span className="flex items-center mr-2">
              <Link className="h-3 w-3 mr-1" />
              {task.links.length}
            </span>
          )}
          {task.commentCount && task.commentCount > 0 && (
            <span className="flex items-center">
              <MessageSquare className="h-3 w-3 mr-1" />
              {task.commentCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  // Empty/No Results state component
  const EmptyState = ({ type }: { type: 'empty' | 'no-results' | 'loading' }) => (
    <div className="flex flex-col items-center justify-center p-6 h-64 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
      {type === 'loading' ? (
        <>
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading tasks...</p>
        </>
      ) : type === 'no-results' ? (
        <>
          <Search className="w-10 h-10 text-gray-400 mb-4" />
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">No matching tasks found</h3>
          <p className="text-gray-500 dark:text-gray-400 text-center">
            Try adjusting your search or filters
          </p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setFilter({ 
                priority: [] as ('low' | 'medium' | 'high')[], 
                assignee: [] as string[], 
                tags: [] as string[], 
                status: [] as ('new' | 'in_review' | 'approved' | 'pending' | 'revised')[] 
              });
            }}
            className="mt-4 px-3 py-1.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-md text-sm font-medium"
          >
            Clear all filters
          </button>
        </>
      ) : (
        <>
          <Plus className="w-10 h-10 text-gray-400 mb-4" />
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">No tasks in this column</h3>
          <p className="text-gray-500 dark:text-gray-400 text-center">
            Click the Create button to add your first task
          </p>
        </>
      )}
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col p-4">
      {/* Header with search and filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="w-full md:w-64 relative">
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full px-4 py-2 pl-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X size={20} />
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-1 flex">
            <button
              className={`flex items-center rounded px-3 py-1.5 text-sm transition-colors ${
                viewType === 'grid'
                  ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
              }`}
              onClick={() => setViewType('grid')}
              aria-label="Grid view"
            >
              <Grid size={16} className="mr-1.5" />
              Grid
            </button>
            <button
              className={`flex items-center rounded px-3 py-1.5 text-sm transition-colors ${
                viewType === 'traceability'
                  ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
              }`}
              onClick={() => setViewType('traceability')}
              aria-label="Traceability view"
            >
              <List size={16} className="mr-1.5" />
              Traceability
            </button>
          </div>
          
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center relative ${
              showFilters
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setShowFilters(!showFilters)}
            aria-label={showFilters ? "Hide filters" : "Show filters"}
          >
            <Filter size={16} className="mr-1.5" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>
          
          <button
            className="px-3 py-1.5 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center"
            onClick={() => openTaskModal()}
            aria-label="Create new task"
          >
            <Plus size={16} className="mr-1.5" />
            Create
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="font-medium text-gray-800 dark:text-gray-200">Filter Tasks</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              aria-label="Close filters"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-750 rounded-md">
              <h3 className="font-medium text-sm mb-2 text-gray-700 dark:text-gray-300">Status</h3>
              <div className="space-y-1">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2 rounded text-indigo-600"
                    checked={filter.status?.includes('new')}
                    onChange={() => handleStatusToggle('new')}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">New</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2 rounded text-indigo-600"
                    checked={filter.status?.includes('in_review')}
                    onChange={() => handleStatusToggle('in_review')}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">In Review</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2 rounded text-indigo-600"
                    checked={filter.status?.includes('approved')}
                    onChange={() => handleStatusToggle('approved')}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Approved</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2 rounded text-indigo-600"
                    checked={filter.status?.includes('pending')}
                    onChange={() => handleStatusToggle('pending')}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Pending</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2 rounded text-indigo-600"
                    checked={filter.status?.includes('revised')}
                    onChange={() => handleStatusToggle('revised')}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Revised</span>
                </label>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-sm mb-2 text-gray-700 dark:text-gray-300">Priority</h3>
              <div className="space-y-1">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2 rounded text-indigo-600"
                    checked={filter.priority.includes('low')}
                    onChange={() => handlePriorityToggle('low')}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Low</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2 rounded text-indigo-600"
                    checked={filter.priority.includes('medium')}
                    onChange={() => handlePriorityToggle('medium')}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Medium</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2 rounded text-indigo-600"
                    checked={filter.priority.includes('high')}
                    onChange={() => handlePriorityToggle('high')}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">High</span>
                </label>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-sm mb-2 text-gray-700 dark:text-gray-300">Assignee</h3>
              <div className="space-y-1">
                {assignees.map(assignee => (
                  <label key={assignee} className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2 rounded text-indigo-600"
                      checked={filter.assignee.includes(assignee)}
                      onChange={() => handleAssigneeToggle(assignee)}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{assignee}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-sm mb-2 text-gray-700 dark:text-gray-300">Tags</h3>
              <div className="space-y-1">
                {availableTags.slice(0, 5).map(tag => (
                  <label key={tag} className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2 rounded text-indigo-600"
                      checked={filter.tags.includes(tag)}
                      onChange={() => handleTagFilterToggle(tag)}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{tag}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => setFilter({ 
                priority: [] as ('low' | 'medium' | 'high')[], 
                assignee: [] as string[], 
                tags: [] as string[], 
                status: [] as ('new' | 'in_review' | 'approved' | 'pending' | 'revised')[] 
              })}
              className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              disabled={activeFiltersCount === 0}
            >
              Clear Filters
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="px-3 py-1.5 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState type="loading" />
        </div>
      ) : viewType === 'grid' ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 h-full overflow-x-auto pb-4">
            {filteredData.columnOrder.map(columnId => {
              const column = filteredData.columns[columnId];
              return (
                <div key={column.id} className="flex-none w-80">
                  <div className="bg-white dark:bg-gray-700 rounded-t-lg p-3 shadow-md sticky top-0 z-10">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">{column.title}</h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 rounded-full px-2 py-0.5 min-w-[1.5rem] text-center">
                        {column.taskIds.length}
                      </span>
                    </div>
                  </div>
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`bg-gray-100 dark:bg-gray-800 p-3 rounded-b-lg shadow-md min-h-[50vh] transition-colors ${
                          snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-indigo-900/30 ring-2 ring-indigo-200 dark:ring-indigo-800' : ''
                        }`}
                      >
                        {column.taskIds.length === 0 ? (
                          <EmptyState type={searchTerm || activeFiltersCount > 0 ? 'no-results' : 'empty'} />
                        ) : (
                          column.taskIds.map((taskId, index) => {
                            const task = filteredData.tasks[taskId];
                            return (
                              <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(provided, snapshot) => renderTaskCard(task, provided, snapshot)}
                              </Draggable>
                            );
                          })
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      ) : (
        renderTraceabilityView()
      )}

      {/* Enhanced Task modal with keyboard support */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleModalKeyDown}
            tabIndex={-1}
          >
            <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {currentTask ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={taskForm.content}
                  onChange={(e) => setTaskForm({...taskForm, content: e.target.value})}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
                  placeholder="Task title"
                  required
                />
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
                  placeholder="Task description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({...taskForm, priority: e.target.value as 'low' | 'medium' | 'high'})}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                {/* Assignee */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Assignee
                  </label>
                  <select
                    value={taskForm.assignee}
                    onChange={(e) => setTaskForm({...taskForm, assignee: e.target.value})}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
                  >
                    <option value="">Unassigned</option>
                    {assignees.map(assignee => (
                      <option key={assignee} value={assignee}>{assignee}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
                />
              </div>
              
              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 rounded-md text-sm transition-colors ${
                        taskForm.tags.includes(tag)
                          ? `${getTagColor(tag)} border border-transparent`
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Requirement Code
                </label>
                <input
                  type="text"
                  value={taskForm.code}
                  onChange={(e) => setTaskForm({...taskForm, code: e.target.value})}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
                  placeholder="e.g., UN-1, SR-1"
                />
              </div>
              
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({...taskForm, status: e.target.value as 'new' | 'in_review' | 'approved' | 'pending' | 'revised'})}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
                >
                  <option value="new">New</option>
                  <option value="in_review">In Review</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="revised">Revised</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Requirement Type
                  </label>
                  <select
                    value={taskForm.type}
                    onChange={(e) => setTaskForm({...taskForm, type: e.target.value as 'labeling' | 'battery' | 'electrode' | 'system' | 'other'})}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
                  >
                    <option value="system">System</option>
                    <option value="battery">Battery</option>
                    <option value="electrode">Electrode</option>
                    <option value="labeling">Labeling</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                {/* System */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    System/Category
                  </label>
                  <select
                    value={taskForm.system}
                    onChange={(e) => setTaskForm({...taskForm, system: e.target.value})}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
                  >
                    <option value="">Select system</option>
                    {systemOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400 self-center mr-auto">
                  Press Esc to cancel, Ctrl+Enter to save
                </span>
                <button 
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {currentTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FixedKanbanBoard; 