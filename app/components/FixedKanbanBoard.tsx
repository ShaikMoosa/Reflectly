'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Search, Plus, Filter, MoreHorizontal, Edit2, Trash2, Link, MessageSquare, Grid, List, Settings } from 'lucide-react';

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

const KanbanBoard: React.FC = () => {
  const [boardData, setBoardData] = useState<BoardData>(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState({
    priority: [] as ('low' | 'medium' | 'high')[],
    assignee: [] as string[],
    tags: [] as string[]
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

  // Filter tasks based on search term and filters
  const getFilteredTasks = () => {
    const filtered = { ...boardData };

    // Apply search filter
    if (searchTerm) {
      for (const columnId in filtered.columns) {
        filtered.columns[columnId] = {
          ...filtered.columns[columnId],
          taskIds: filtered.columns[columnId].taskIds.filter(taskId => {
            const task = filtered.tasks[taskId];
            return task.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
          })
        };
      }
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

  return (
    <div className="h-full w-full flex flex-col p-4">
      {/* Search and filters */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm breadcrumbs">
          <ul className="flex items-center space-x-2">
            <li><a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">Projects</a></li>
            <li className="before:content-['/'] before:mx-2 before:text-gray-500">
              <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">Device Requirements</a>
            </li>
            <li className="before:content-['/'] before:mx-2 before:text-gray-500">
              <span className="text-gray-900 dark:text-white">Design Control</span>
            </li>
          </ul>
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
            >
              <List size={16} className="mr-1.5" />
              Traceability
            </button>
          </div>
          
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center ${
              showFilters
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} className="mr-1.5" />
            Filters
          </button>
          
          <button
            className="px-3 py-1.5 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center"
            onClick={() => openTaskModal()}
          >
            <Plus size={16} className="mr-1.5" />
            Create Design Review
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <h3 className="font-medium text-sm mb-2 text-gray-700 dark:text-gray-300">Status</h3>
              <div className="space-y-1">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 rounded text-indigo-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">New</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 rounded text-indigo-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">In Review</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 rounded text-indigo-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Approved</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 rounded text-indigo-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Pending</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 rounded text-indigo-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Revised</span>
                </label>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-sm mb-2 text-gray-700 dark:text-gray-300">Type</h3>
              <div className="space-y-1">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 rounded text-indigo-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">System</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 rounded text-indigo-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Battery</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 rounded text-indigo-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Electrode</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 rounded text-indigo-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Labeling</span>
                </label>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-sm mb-2 text-gray-700 dark:text-gray-300">Tags</h3>
              <div className="space-y-1">
                {availableTags.slice(0, 5).map(tag => (
                  <label key={tag} className="flex items-center">
                    <input type="checkbox" className="mr-2 rounded text-indigo-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{tag}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-sm mb-2 text-gray-700 dark:text-gray-300">System</h3>
              <div className="space-y-1">
                {systemOptions.map(option => (
                  <label key={option} className="flex items-center">
                    <input type="checkbox" className="mr-2 rounded text-indigo-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modify the rendering to conditionally show the Kanban board or traceability view */}
      {viewType === 'grid' ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 h-full overflow-x-auto pb-4">
            {filteredData.columnOrder.map(columnId => {
              const column = filteredData.columns[columnId];
              return (
                <div key={column.id} className="flex-none w-80">
                  <div className="bg-white dark:bg-gray-700 rounded-t-lg p-3 shadow-md">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">{column.title}</h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 rounded-full px-2 py-0.5">
                        {column.taskIds.length}
                      </span>
                    </div>
                  </div>
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`bg-gray-100 dark:bg-gray-800 p-3 rounded-b-lg shadow-md min-h-[50vh] ${
                          snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-indigo-900/30' : ''
                        }`}
                      >
                        {column.taskIds.map((taskId, index) => {
                          const task = filteredData.tasks[taskId];
                          return (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white dark:bg-gray-700 p-3 mb-3 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                                    snapshot.isDragging ? 'shadow-lg' : ''
                                  }`}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                      {task.type && <span className="text-sm">{typeIcons[task.type]}</span>}
                                      {task.code && (
                                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                          {task.code}
                                        </span>
                                      )}
                                      <h4 className="font-medium text-gray-900 dark:text-white">{task.content}</h4>
                                    </div>
                                    <div className="relative">
                                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                  {task.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{task.description}</p>
                                  )}
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {task.tags.map(tag => (
                                      <span 
                                        key={tag} 
                                        className={`text-xs px-2 py-0.5 rounded-full ${getTagColor(tag)}`}
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="flex justify-between items-center mt-3 text-xs">
                                    <span className={`px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full ${statusColors[task.status]}`}>
                                      {task.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </span>
                                    {task.assignee && (
                                      <span className="text-gray-600 dark:text-gray-400">
                                        {task.assignee}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex justify-between mt-2">
                                    <div className="flex space-x-2">
                                      <button 
                                        className="text-xs text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 flex items-center"
                                        onClick={() => openTaskModal(task)}
                                      >
                                        <Edit2 className="h-3 w-3 mr-1" />
                                        Edit
                                      </button>
                                      <button 
                                        className="text-xs text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 flex items-center"
                                        onClick={() => handleDeleteTask(task.id)}
                                      >
                                        <Trash2 className="h-3 w-3 mr-1" />
                                        Delete
                                      </button>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500">
                                      {task.links && task.links.length > 0 && (
                                        <span className="flex items-center mr-2">
                                          <Link className="h-3 w-3 mr-1" />
                                          {task.links.length} Links
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
                              )}
                            </Draggable>
                          );
                        })}
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

      {/* Enhanced Notion-style Task modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white border-b pb-4 border-gray-200 dark:border-gray-700">
              {currentTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            
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
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard; 