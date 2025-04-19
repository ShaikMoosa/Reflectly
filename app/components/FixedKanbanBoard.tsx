'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Search, Plus, Filter, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';

// Define the task type
interface Task {
  id: string;
  content: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: string;
  tags: string[];
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
      content: 'Implement authentication',
      description: 'Add login and signup functionality',
      priority: 'high',
      assignee: 'John',
      dueDate: '2023-11-30',
      tags: ['frontend', 'security']
    },
    'task-2': {
      id: 'task-2',
      content: 'Design landing page',
      description: 'Create a modern landing page design',
      priority: 'medium',
      assignee: 'Sarah',
      dueDate: '2023-12-05',
      tags: ['design', 'ui']
    },
    'task-3': {
      id: 'task-3',
      content: 'Add analytics',
      description: 'Integrate Google Analytics',
      priority: 'low',
      assignee: 'Mike',
      dueDate: '2023-12-10',
      tags: ['marketing']
    },
    'task-4': {
      id: 'task-4',
      content: 'Fix navigation bugs',
      description: 'Address reported navigation issues',
      priority: 'high',
      assignee: 'John',
      dueDate: '2023-11-25',
      tags: ['bug', 'frontend']
    },
    'task-5': {
      id: 'task-5',
      content: 'Update documentation',
      description: 'Revise the API documentation',
      priority: 'medium',
      assignee: 'Lisa',
      dueDate: '2023-12-15',
      tags: ['documentation']
    }
  },
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'To Do',
      taskIds: ['task-1', 'task-2']
    },
    'column-2': {
      id: 'column-2',
      title: 'In Progress',
      taskIds: ['task-3', 'task-4']
    },
    'column-3': {
      id: 'column-3',
      title: 'Done',
      taskIds: ['task-5']
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
    setCurrentTask(task);
    setShowModal(true);
  };

  const filteredData = getFilteredTasks();

  return (
    <div className="h-full w-full flex flex-col p-4">
      {/* Search and filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-white dark:bg-gray-700 h-10 pl-10 pr-3 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <button 
            className="flex items-center h-10 px-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <Filter className="h-4 w-4 mr-2" />
            <span>Filters</span>
          </button>
          <button 
            className="flex items-center h-10 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            onClick={() => openTaskModal()}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Kanban board */}
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
                                  <h4 className="font-medium text-gray-900 dark:text-white">{task.content}</h4>
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
                                  {task.assignee && (
                                    <span className="text-gray-600 dark:text-gray-400">
                                      {task.assignee}
                                    </span>
                                  )}
                                  {task.dueDate && (
                                    <span className="text-gray-600 dark:text-gray-400">
                                      {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                                <div className="flex mt-2 space-x-2">
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

      {/* Task modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {currentTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <div className="flex justify-end space-x-2 mt-6">
              <button 
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                onClick={() => {
                  if (currentTask) {
                    handleSaveTask(currentTask);
                  } else {
                    const newTask: Task = {
                      id: `task-${Date.now()}`,
                      content: 'New Task',
                      description: '',
                      priority: 'medium',
                      tags: []
                    };
                    handleSaveTask(newTask);
                  }
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard; 