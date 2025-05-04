'use client';

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult, ResponderProvided } from 'react-beautiful-dnd';
import { Search, Plus, Filter, MoreHorizontal, Edit2, Trash2, Link, MessageSquare, Grid, List, Settings, X, GripHorizontal } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../utils/supabase';
import DragDropDebug from './DragDropDebug';

// ChunkErrorHandler component to help with chunk loading errors
const ChunkErrorHandler = () => {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    const handleChunkError = (event: ErrorEvent) => {
      const isChunkError = 
        (event.error?.message?.includes('ChunkLoadError') || 
        event.message?.includes('ChunkLoadError') || 
        event.error?.message?.includes('Failed to fetch'));
        
      if (isChunkError) {
        console.error('Chunk loading error detected:', event);
        event.preventDefault();
        
        // Try to recover by refreshing the page after a delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    };
    
    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && (
        event.reason.message?.includes('ChunkLoadError') || 
        event.reason.toString?.().includes('ChunkLoadError')
      )) {
        console.error('Chunk load promise rejection:', event);
        event.preventDefault();
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    };
    
    window.addEventListener('error', handleChunkError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);
    
    return () => {
      window.removeEventListener('error', handleChunkError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    };
  }, []);
  
  return null;
};

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

// Component props
interface FixedKanbanBoardProps {
  userId?: string;
}

const initialData: BoardData = {
  tasks: {},
  columns: {
    'todo-column': {
      id: 'todo-column',
      title: 'To Do',
      taskIds: []
    },
    'in-progress-column': {
      id: 'in-progress-column',
      title: 'In Progress',
      taskIds: []
    },
    'done-column': {
      id: 'done-column',
      title: 'Done',
      taskIds: []
    }
  },
  columnOrder: ['todo-column', 'in-progress-column', 'done-column']
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

const FixedKanbanBoard: React.FC<FixedKanbanBoardProps> = ({ userId }) => {
  // CSS variables for the dragging animation
  useEffect(() => {
    // Add CSS variables to document root
    document.documentElement.style.setProperty('--card-rgb', '255, 255, 255');
    document.documentElement.style.setProperty('--item-dragging-bg', 'rgba(255, 255, 255, 0.9)');
    document.documentElement.style.setProperty('--item-dragging-shadow', '0 8px 24px rgba(0, 0, 0, 0.15)');
    
    // For dark mode
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.style.setProperty('--card-rgb', '55, 65, 81');
      document.documentElement.style.setProperty('--item-dragging-bg', 'rgba(55, 65, 81, 0.9)');
    }
    
    return () => {
      // Clean up variables when component unmounts
      document.documentElement.style.removeProperty('--card-rgb');
      document.documentElement.style.removeProperty('--item-dragging-bg');
      document.documentElement.style.removeProperty('--item-dragging-shadow');
    };
  }, []);

  // Load board data from localStorage or use empty initial data - only once on mount
  const loadBoardData = useCallback(() => {
    try {
      const savedData = localStorage.getItem('plannerBoardData');
      if (savedData) {
        return JSON.parse(savedData) as BoardData;
      }
    } catch (error) {
      console.error('Error loading board data from localStorage:', error);
    }
    return initialData;
  }, []);

  const [boardData, setBoardData] = useState<BoardData>(() => loadBoardData());
  
  // Debounced localStorage save to avoid excessive writes
  useEffect(() => {
    // Create a debounced save function
    const saveData = () => {
      try {
        localStorage.setItem('plannerBoardData', JSON.stringify(boardData));
      } catch (error) {
        console.error('Error saving board data to localStorage:', error);
      }
    };
    
    // Set timeout with proper initialization
    const saveTimeout = setTimeout(saveData, 500);
    
    // Cleanup function
    return () => {
      clearTimeout(saveTimeout);
      saveData(); // Save on unmount
    };
  }, [boardData]);

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
    commentCount: 0,
    columnId: '' // New field to track which column to add task to
  });

  // Available assignees for dropdown
  const assignees = ['You', 'Team Member']; // Simplified assignee list
  // Available tags for selection
  const availableTags = ['frontend', 'backend', 'design', 'bug', 'feature', 'documentation', 'ui', 'testing'];

  // Add state for view type
  const [viewType, setViewType] = useState<'grid' | 'traceability'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Add loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Add a timeout to force reset loading state if stuck
  useEffect(() => {
    // If loading state gets stuck, reset it after 5 seconds
    let loadingTimer: NodeJS.Timeout;
    
    if (isLoading) {
      loadingTimer = setTimeout(() => {
        setIsLoading(false);
      }, 5000);
    }
    
    return () => {
      if (loadingTimer) clearTimeout(loadingTimer);
    };
  }, [isLoading]);
  
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
  const onDragEnd = (result: DropResult, provided?: ResponderProvided) => {
    const { destination, source, draggableId } = result;

    // If there's no destination, do nothing
    if (!destination) {
      return;
    }

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

    if (!sourceColumn || !destinationColumn) {
      console.error('Source or destination column not found');
      return;
    }

    // If moving within the same column
    if (source.droppableId === destination.droppableId) {
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
        [sourceColumn.id]: newSourceColumn,
        [destinationColumn.id]: newDestinationColumn
      }
    };

    setBoardData(newBoardData);
  };

  // Handle task creation or update
  const handleSaveTask = (task: Task) => {
    try {
      if (task.id in boardData.tasks) {
        // Update existing task
        
        // Find which column contains this task (in case we need to update its position)
        let columnWithTaskId: string | null = null;
        
        for (const columnId of boardData.columnOrder) {
          if (boardData.columns[columnId].taskIds.includes(task.id)) {
            columnWithTaskId = columnId;
            break;
          }
        }
        
        setBoardData(prev => ({
          ...prev,
          tasks: {
            ...prev.tasks,
            [task.id]: task
          }
        }));
      } else {
        // Create new task
        // Use the selected column for new tasks instead of always using the first column
        const selectedColumnId = taskForm.columnId || boardData.columnOrder[0];
        
        
        // Make sure the column exists
        if (!boardData.columns[selectedColumnId]) {
          console.error('Selected column does not exist:', selectedColumnId);
          return;
        }
        
        // Generate a unique ID to prevent collisions
        const newTaskId = `task-${Date.now()}-${Math.round(Math.random() * 1000)}`;
        const newTask = {
          ...task,
          id: newTaskId
        };
        
        setBoardData(prev => ({
          ...prev,
          tasks: {
            ...prev.tasks,
            [newTaskId]: newTask
          },
          columns: {
            ...prev.columns,
            [selectedColumnId]: {
              ...prev.columns[selectedColumnId],
              taskIds: [...prev.columns[selectedColumnId].taskIds, newTaskId]
            }
          }
        }));
      }
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      // Ensure isLoading is reset to false
      setIsLoading(false);
      
      // Close the modal
      setShowModal(false);
      setCurrentTask(null);
    }
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
  const getFilteredTasks = useCallback(() => {
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
  }, [boardData, searchTerm, filter, activeFiltersCount]);

  // Memoize filtered data to avoid unnecessary recalculations
  const filteredData = useMemo(() => getFilteredTasks(), [getFilteredTasks]);

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
        commentCount: task.commentCount || 0,
        columnId: '' // No column selection for existing tasks
      });
    } else {
      // Create new task
      const newTaskId = `task-${Date.now()}-${Math.round(Math.random() * 1000)}`;
      setTaskForm({
        id: newTaskId,
        content: '',
        description: '',
        priority: 'medium',
        assignee: '',
        dueDate: '',
        tags: [],
        code: '',
        status: 'new',
        type: 'other', // Default type
        links: [],
        system: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        commentCount: 0,
        columnId: boardData.columnOrder[0] // Default to first column
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
    
    // Set loading state
    setIsLoading(true);
    
    // Validation - ensure required fields are present
    if (!taskForm.content.trim()) {
      alert('Task title is required');
      setIsLoading(false);
      return;
    }
    
    // Create a new task object from the form data
    const taskToSave: Task = {
      id: taskForm.id,
      content: taskForm.content.trim(),
      description: taskForm.description.trim() || undefined,
      priority: taskForm.priority,
      assignee: taskForm.assignee || undefined,
      dueDate: taskForm.dueDate || undefined,
      tags: taskForm.tags,
      code: taskForm.code || undefined,
      status: taskForm.status,
      type: taskForm.type || undefined,
      links: taskForm.links || [],
      system: taskForm.system || undefined,
      createdAt: taskForm.createdAt,
      updatedAt: new Date().toISOString(),
      commentCount: taskForm.commentCount
    };
    
    // Save the task
    handleSaveTask(taskToSave);
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

  // Update rendered task cards to use the memoized component
  const renderTaskCard = (task: Task, provided: any, snapshot: any) => (
    <TaskCard
      task={task}
      provided={provided}
      snapshot={snapshot}
      getTagColor={getTagColor}
      handleDeleteTask={handleDeleteTask}
      openTaskModal={openTaskModal}
      searchTerm={searchTerm}
      highlightMatch={highlightMatch}
      statusColors={statusColors}
      priorityColors={priorityColors}
      typeIcons={typeIcons}
    />
  );

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
            <tbody>
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
                  <td className="px-4 py-3 whitespace-nowrap">
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

  // Add animation styles for dragging
  const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    // change background colour if dragging
    background: isDragging ? 'var(--item-dragging-bg, rgba(var(--card-rgb), 0.8))' : 'var(--item-bg, #fff)',
    boxShadow: isDragging ? 'var(--item-dragging-shadow, 0 8px 16px rgba(0, 0, 0, 0.1))' : 'var(--item-shadow, 0 1px 3px rgba(0, 0, 0, 0.05))',
    borderRadius: '0.5rem',
    // styles we need to apply on draggables
    ...draggableStyle,
  });

  // Memoize task card rendering for better performance
  const TaskCard = memo(({ 
    task, 
    provided, 
    snapshot, 
    getTagColor, 
    handleDeleteTask,
    openTaskModal,
    searchTerm,
    highlightMatch,
    statusColors,
    priorityColors,
    typeIcons
  }: {
    task: Task;
    provided: any;
    snapshot: any;
    getTagColor: (tag: string) => string;
    handleDeleteTask: (id: string) => void;
    openTaskModal: (task: Task) => void;
    searchTerm: string;
    highlightMatch: (text: string, searchTerm: string) => React.ReactNode;
    statusColors: Record<string, string>;
    priorityColors: Record<string, string>;
    typeIcons: Record<string, string>;
  }) => {
    return (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
        className={`group bg-white dark:bg-gray-700 p-4 mb-3 rounded-lg shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
          snapshot.isDragging ? 'shadow-xl ring-2 ring-indigo-300 dark:ring-indigo-600 rotate-1 scale-105' : ''
        }`}
        data-task-id={task.id}
      >
        {/* Drag handle at top of card */}
        <div 
          {...provided.dragHandleProps} 
          className="flex justify-center items-center w-full h-4 mb-3 cursor-grab active:cursor-grabbing"
        >
          <div className="w-10 h-1 bg-gray-200 dark:bg-gray-600 rounded-full group-hover:bg-indigo-200 dark:group-hover:bg-indigo-700 transition-colors"></div>
        </div>
        
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
  }, (prevProps, nextProps) => {
    // Custom comparison function for memo
    // Only re-render if these props change
    return (
      prevProps.task.id === nextProps.task.id &&
      prevProps.task.content === nextProps.task.content &&
      prevProps.task.description === nextProps.task.description &&
      prevProps.task.priority === nextProps.task.priority &&
      prevProps.task.status === nextProps.task.status &&
      prevProps.task.assignee === nextProps.task.assignee &&
      prevProps.task.tags.join() === nextProps.task.tags.join() &&
      prevProps.searchTerm === nextProps.searchTerm &&
      prevProps.snapshot.isDragging === nextProps.snapshot.isDragging
    );
  });

  // Empty/No Results state component
  const EmptyState = memo(({ type }: { type: 'empty' | 'no-results' | 'loading' }) => (
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
  ));

  // Create a memoized column component
  const KanbanColumn = memo(({ 
    column, 
    columnId, 
    index, 
    filteredData,
    renderTaskCard,
    EmptyState,
    searchTerm,
    activeFiltersCount
  }: { 
    column: Column; 
    columnId: string; 
    index: number;
    filteredData: BoardData;
    renderTaskCard: (task: Task, provided: any, snapshot: any) => JSX.Element;
    EmptyState: React.ComponentType<{ type: 'empty' | 'no-results' | 'loading' }>;
    searchTerm: string;
    activeFiltersCount: number;
  }) => {
    // Column color indicators based on position
    const columnColors = [
      "border-l-4 border-blue-500", // To Do
      "border-l-4 border-yellow-500", // In Progress 
      "border-l-4 border-green-500", // Done
    ];
    const colorClass = columnColors[index % columnColors.length];
    
    return (
      <div key={column.id} className={`flex-none w-80 ${colorClass} rounded-lg bg-gray-50 dark:bg-gray-800/50 shadow-md overflow-hidden`}>
        <div className="bg-white dark:bg-gray-700 p-3 sticky top-0 z-10 border-b border-gray-200 dark:border-gray-600">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold flex items-center">
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                index === 0 ? 'bg-blue-500' : 
                index === 1 ? 'bg-yellow-500' : 
                'bg-green-500'
              }`}></span>
              {column.title}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 rounded-full px-2 py-0.5 min-w-[1.5rem] text-center">
              {column.taskIds.length}
            </span>
          </div>
        </div>
        <Droppable droppableId={column.id} type="TASK">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`p-3 min-h-[calc(100vh-13rem)] transition-all ${
                snapshot.isDraggingOver 
                  ? 'bg-blue-50 dark:bg-indigo-900/30 ring-inset ring-2 ring-indigo-200 dark:ring-indigo-800' 
                  : ''
              }`}
              data-column-id={column.id}
            >
              {column.taskIds.length === 0 ? (
                <EmptyState type={searchTerm || activeFiltersCount > 0 ? 'no-results' : 'empty'} />
              ) : (
                column.taskIds.map((taskId, index) => {
                  const task = filteredData.tasks[taskId];
                  if (!task) {
                    return null;
                  }
                  return (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => renderTaskCard(task, provided, snapshot)}
                    </Draggable>
                  );
                })
              )}
              {provided.placeholder}
              {snapshot.isDraggingOver && (
                <div className="mt-2 p-2 text-center text-xs bg-indigo-50 dark:bg-indigo-900/20 rounded-md text-indigo-600 dark:text-indigo-300 border border-dashed border-indigo-200 dark:border-indigo-800">
                  Drop here to add to {column.title}
                </div>
              )}
            </div>
          )}
        </Droppable>
      </div>
    );
  });

  // Create a memoized grid view component
  const GridView = memo(({ 
    onDragEnd, 
    filteredData, 
    renderTaskCard,
    EmptyState,
    searchTerm,
    activeFiltersCount,
    boardData
  }: { 
    onDragEnd: (result: DropResult, provided?: ResponderProvided) => void;
    filteredData: BoardData;
    renderTaskCard: (task: Task, provided: any, snapshot: any) => JSX.Element;
    EmptyState: React.ComponentType<{ type: 'empty' | 'no-results' | 'loading' }>;
    searchTerm: string;
    activeFiltersCount: number;
    boardData: BoardData;
  }) => {
    return (
      <DragDropContext onDragEnd={onDragEnd}>
        {/* Notion-style hint banner */}
        <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-md p-3 text-sm text-yellow-800 dark:text-yellow-300 flex items-center">
          <div className="mr-2 p-1 bg-yellow-100 dark:bg-yellow-800 rounded-full">
            <GripHorizontal size={16} className="text-yellow-600 dark:text-yellow-300" />
          </div>
          <span>
            <span className="font-medium">Tip:</span> Drag tasks between columns to update their status. Use the drag handle at the top of each card.
          </span>
          <button 
            onClick={(e) => e.currentTarget.parentElement?.remove()} 
            className="ml-auto text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
          >
            <X size={16} />
          </button>
        </div>
        
        {/* Debug panel */}
        <div className="fixed bottom-4 right-4 p-2 bg-white dark:bg-gray-800 rounded shadow-lg text-xs opacity-70 hover:opacity-100 transition-opacity z-50 max-w-xs">
          <div className="font-mono text-gray-700 dark:text-gray-300 mb-1">
            Drag and Drop Debug:
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            {boardData.columnOrder.map(colId => (
              <div key={colId}>
                {boardData.columns[colId].title}: {boardData.columns[colId].taskIds.length} tasks
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex gap-6 h-full overflow-x-auto pb-4">
          {filteredData.columnOrder.map((columnId, index) => {
            const column = filteredData.columns[columnId];
            return (
              <KanbanColumn
                key={column.id}
                column={column}
                columnId={column.id}
                index={index}
                filteredData={filteredData}
                renderTaskCard={renderTaskCard}
                EmptyState={EmptyState}
                searchTerm={searchTerm}
                activeFiltersCount={activeFiltersCount}
              />
            );
          })}
        </div>
      </DragDropContext>
    );
  }, (prevProps, nextProps) => {
    // Custom comparison for the GridView component
    return (
      prevProps.filteredData === nextProps.filteredData &&
      prevProps.searchTerm === nextProps.searchTerm &&
      prevProps.activeFiltersCount === nextProps.activeFiltersCount
    );
  });

  // Main component return with optimized render
  return (
    <div className="h-full w-full flex flex-col px-10 py-8">
      {/* Chunk error handler */}
      <ChunkErrorHandler />
      
      {/* Task Creation/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onKeyDown={handleModalKeyDown}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {currentTask ? 'Edit Task' : 'Create New Task'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleFormSubmit}>
                <div className="space-y-4">
                  {/* Title field */}
                  <div>
                    <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="task-title"
                      type="text"
                      value={taskForm.content}
                      onChange={(e) => setTaskForm({...taskForm, content: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Task title"
                      required
                    />
                  </div>
                  
                  {/* Description field */}
                  <div>
                    <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      id="task-description"
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Task description"
                    />
                  </div>
                  
                  {/* Code and Status fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="task-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Code
                      </label>
                      <input
                        id="task-code"
                        type="text"
                        value={taskForm.code}
                        onChange={(e) => setTaskForm({...taskForm, code: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., UN-1, REQ-1"
                      />
                    </div>
                    <div>
                      <label htmlFor="task-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </label>
                      <select
                        id="task-status"
                        value={taskForm.status}
                        onChange={(e) => setTaskForm({...taskForm, status: e.target.value as any})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="new">New</option>
                        <option value="in_review">In Review</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="revised">Revised</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Type and Priority fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="task-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type
                      </label>
                      <select
                        id="task-type"
                        value={taskForm.type}
                        onChange={(e) => setTaskForm({...taskForm, type: e.target.value as any})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="system">System {typeIcons.system}</option>
                        <option value="battery">Battery {typeIcons.battery}</option>
                        <option value="electrode">Electrode {typeIcons.electrode}</option>
                        <option value="labeling">Labeling {typeIcons.labeling}</option>
                        <option value="other">Other {typeIcons.other}</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Priority
                      </label>
                      <select
                        id="task-priority"
                        value={taskForm.priority}
                        onChange={(e) => setTaskForm({...taskForm, priority: e.target.value as any})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Assignee and System fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="task-assignee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Assignee
                      </label>
                      <select
                        id="task-assignee"
                        value={taskForm.assignee}
                        onChange={(e) => setTaskForm({...taskForm, assignee: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Not assigned</option>
                        {assignees.map(assignee => (
                          <option key={assignee} value={assignee}>{assignee}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="task-system" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        System
                      </label>
                      <select
                        id="task-system"
                        value={taskForm.system}
                        onChange={(e) => setTaskForm({...taskForm, system: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">None</option>
                        {systemOptions.map(system => (
                          <option key={system} value={system}>{system}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {taskForm.tags.map(tag => (
                        <span 
                          key={tag}
                          className={`${getTagColor(tag)} text-xs px-2 py-1 rounded-full flex items-center`}
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleTagToggle(tag)}
                            className="ml-1.5 text-opacity-70 hover:text-opacity-100"
                            aria-label={`Remove ${tag} tag`}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.filter(tag => !taskForm.tags.includes(tag)).map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagToggle(tag)}
                          className={`text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600`}
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Column selection (for new tasks only) */}
                  {!currentTask && (
                    <div>
                      <label htmlFor="task-column" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Column
                      </label>
                      <select
                        id="task-column"
                        value={taskForm.columnId}
                        onChange={(e) => setTaskForm({...taskForm, columnId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      >
                        {boardData.columnOrder.map((columnId) => (
                          <option key={columnId} value={columnId}>
                            {boardData.columns[columnId].title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 flex items-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                        {currentTask ? 'Saving...' : 'Creating...'}
                      </>
                    ) : (
                      currentTask ? 'Save Changes' : 'Create Task'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Debug panel */}
      <DragDropDebug data={boardData} />
      
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
          <div className="text-center">
            <div className="w-16 h-16 border-t-4 border-indigo-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading tasks...</p>
            <button 
              onClick={() => setIsLoading(false)} 
              className="mt-6 px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              Cancel Loading
            </button>
          </div>
        </div>
      ) : viewType === 'grid' ? (
        <GridView
          onDragEnd={onDragEnd}
          filteredData={filteredData}
          renderTaskCard={renderTaskCard}
          EmptyState={EmptyState}
          searchTerm={searchTerm}
          activeFiltersCount={activeFiltersCount}
          boardData={boardData}
        />
      ) : (
        // Traceability View
        renderTraceabilityView()
      )}
    </div>
  );
};

export default FixedKanbanBoard; 