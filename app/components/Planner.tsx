'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, Edit, Trash2, X, Check } from 'lucide-react';

// Types for our kanban data
type Task = {
  id: string;
  content: string;
};

type Column = {
  id: string;
  title: string;
  taskIds: string[];
};

type KanbanData = {
  tasks: {
    [key: string]: Task;
  };
  columns: {
    [key: string]: Column;
  };
  columnOrder: string[];
};

// Initial demo data
const initialData: KanbanData = {
  tasks: {
    'task-1': { id: 'task-1', content: 'Record interviews' },
    'task-2': { id: 'task-2', content: 'Create interview questions' },
    'task-3': { id: 'task-3', content: 'Review transcripts' },
    'task-4': { id: 'task-4', content: 'Identify key themes' },
    'task-5': { id: 'task-5', content: 'Create storyboard' },
    'task-6': { id: 'task-6', content: 'Design UI mockups' },
  },
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'To Do',
      taskIds: ['task-1', 'task-2', 'task-3'],
    },
    'column-2': {
      id: 'column-2',
      title: 'In Progress',
      taskIds: ['task-4'],
    },
    'column-3': {
      id: 'column-3',
      title: 'Done',
      taskIds: ['task-5', 'task-6'],
    },
  },
  columnOrder: ['column-1', 'column-2', 'column-3'],
};

// Helper to generate IDs
const generateId = () => {
  return `id-${Math.random().toString(36).substr(2, 9)}`;
};

// Local storage key
const STORAGE_KEY = 'reflectly_planner_data';

export default function Planner() {
  const [data, setData] = useState<KanbanData>(initialData);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [addingInColumn, setAddingInColumn] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [addingColumn, setAddingColumn] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        setData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error('Error loading planner data from localStorage:', error);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving planner data to localStorage:', error);
    }
  }, [data]);

  // Handle drag end
  const onDragEnd = (result: any) => {
    const { destination, source, draggableId, type } = result;

    // Drop outside the list
    if (!destination) {
      return;
    }

    // Drop in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Handle column reordering
    if (type === 'column') {
      const newColumnOrder = Array.from(data.columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);

      setData({
        ...data,
        columnOrder: newColumnOrder,
      });
      return;
    }

    // Handle task reordering
    const startColumn = data.columns[source.droppableId];
    const finishColumn = data.columns[destination.droppableId];

    // Reordering in the same column
    if (startColumn === finishColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...startColumn,
        taskIds: newTaskIds,
      };

      setData({
        ...data,
        columns: {
          ...data.columns,
          [newColumn.id]: newColumn,
        },
      });
      return;
    }

    // Moving from one column to another
    const startTaskIds = Array.from(startColumn.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStartColumn = {
      ...startColumn,
      taskIds: startTaskIds,
    };

    const finishTaskIds = Array.from(finishColumn.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinishColumn = {
      ...finishColumn,
      taskIds: finishTaskIds,
    };

    setData({
      ...data,
      columns: {
        ...data.columns,
        [newStartColumn.id]: newStartColumn,
        [newFinishColumn.id]: newFinishColumn,
      },
    });
  };

  // Add a new task
  const addTask = (columnId: string) => {
    if (!newTaskContent.trim()) return;

    const newTaskId = `task-${generateId()}`;
    const newTask = {
      id: newTaskId,
      content: newTaskContent,
    };

    const column = data.columns[columnId];
    const newTaskIds = Array.from(column.taskIds);
    newTaskIds.push(newTaskId);

    setData({
      ...data,
      tasks: {
        ...data.tasks,
        [newTaskId]: newTask,
      },
      columns: {
        ...data.columns,
        [columnId]: {
          ...column,
          taskIds: newTaskIds,
        },
      },
    });

    setNewTaskContent('');
    setAddingInColumn(null);
  };

  // Edit a task
  const updateTask = (taskId: string) => {
    if (!newTaskContent.trim()) return;

    setData({
      ...data,
      tasks: {
        ...data.tasks,
        [taskId]: {
          ...data.tasks[taskId],
          content: newTaskContent,
        },
      },
    });

    setNewTaskContent('');
    setEditingTask(null);
  };

  // Delete a task
  const deleteTask = (taskId: string, columnId: string) => {
    const column = data.columns[columnId];
    const newTaskIds = column.taskIds.filter(id => id !== taskId);

    const newTasks = { ...data.tasks };
    delete newTasks[taskId];

    setData({
      ...data,
      tasks: newTasks,
      columns: {
        ...data.columns,
        [columnId]: {
          ...column,
          taskIds: newTaskIds,
        },
      },
    });
  };

  // Add a new column
  const addColumn = () => {
    if (!newColumnTitle.trim()) return;

    const newColumnId = `column-${generateId()}`;
    const newColumn = {
      id: newColumnId,
      title: newColumnTitle,
      taskIds: [],
    };

    setData({
      ...data,
      columns: {
        ...data.columns,
        [newColumnId]: newColumn,
      },
      columnOrder: [...data.columnOrder, newColumnId],
    });

    setNewColumnTitle('');
    setAddingColumn(false);
  };

  // Edit column title
  const updateColumn = (columnId: string) => {
    if (!newColumnTitle.trim()) return;

    setData({
      ...data,
      columns: {
        ...data.columns,
        [columnId]: {
          ...data.columns[columnId],
          title: newColumnTitle,
        },
      },
    });

    setNewColumnTitle('');
    setEditingColumn(null);
  };

  // Delete a column
  const deleteColumn = (columnId: string) => {
    // Remove all tasks in the column
    const tasksToRemove = data.columns[columnId].taskIds;
    const newTasks = { ...data.tasks };
    tasksToRemove.forEach(taskId => {
      delete newTasks[taskId];
    });

    // Remove the column
    const newColumns = { ...data.columns };
    delete newColumns[columnId];

    // Update column order
    const newColumnOrder = data.columnOrder.filter(id => id !== columnId);

    setData({
      tasks: newTasks,
      columns: newColumns,
      columnOrder: newColumnOrder,
    });
  };

  // Reset data to initial state
  const resetData = () => {
    setData(initialData);
    setShowResetConfirm(false);
  };

  return (
    <div className="planner-container">
      <div className="planner-header">
        <h2>Project Planner</h2>
        <div className="planner-actions">
          <button 
            className="modern-button secondary"
            onClick={() => setAddingColumn(true)}
          >
            <Plus size={16} />
            Add Column
          </button>
          <button 
            className="modern-button warning"
            onClick={() => setShowResetConfirm(true)}
          >
            Reset Board
          </button>
        </div>
      </div>

      {/* Reset confirmation dialog */}
      {showResetConfirm && (
        <div className="planner-modal-overlay">
          <div className="planner-modal">
            <h3>Reset Board</h3>
            <p>Are you sure you want to reset the board to its initial state? All your changes will be lost.</p>
            <div className="planner-modal-actions">
              <button 
                className="modern-button warning"
                onClick={resetData}
              >
                Yes, Reset
              </button>
              <button 
                className="modern-button secondary"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add column form */}
      {addingColumn && (
        <div className="add-column-form">
          <input
            type="text"
            value={newColumnTitle}
            onChange={(e) => setNewColumnTitle(e.target.value)}
            placeholder="Enter column title..."
            className="planner-input"
            autoFocus
          />
          <div className="planner-form-actions">
            <button 
              className="modern-button"
              onClick={addColumn}
            >
              Add
            </button>
            <button 
              className="modern-button secondary"
              onClick={() => setAddingColumn(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-columns" direction="horizontal" type="column">
          {(provided) => (
            <div 
              className="planner-board"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {data.columnOrder.map((columnId, index) => {
                const column = data.columns[columnId];
                const tasks = column.taskIds.map(taskId => data.tasks[taskId]);

                return (
                  <Draggable key={column.id} draggableId={column.id} index={index}>
                    {(provided) => (
                      <div
                        className="planner-column"
                        {...provided.draggableProps}
                        ref={provided.innerRef}
                      >
                        {/* Column header */}
                        <div 
                          className="planner-column-header"
                          {...provided.dragHandleProps}
                        >
                          {editingColumn === column.id ? (
                            <div className="planner-edit-form">
                              <input
                                type="text"
                                value={newColumnTitle}
                                onChange={(e) => setNewColumnTitle(e.target.value)}
                                className="planner-input"
                                autoFocus
                              />
                              <div className="planner-edit-actions">
                                <button 
                                  className="planner-icon-button"
                                  onClick={() => updateColumn(column.id)}
                                  title="Save"
                                >
                                  <Check size={14} />
                                </button>
                                <button 
                                  className="planner-icon-button"
                                  onClick={() => {
                                    setEditingColumn(null);
                                    setNewColumnTitle('');
                                  }}
                                  title="Cancel"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h3 className="planner-column-title">{column.title}</h3>
                              <div className="planner-column-actions">
                                <button 
                                  className="planner-icon-button"
                                  onClick={() => {
                                    setEditingColumn(column.id);
                                    setNewColumnTitle(column.title);
                                  }}
                                  title="Edit column"
                                >
                                  <Edit size={14} />
                                </button>
                                <button 
                                  className="planner-icon-button"
                                  onClick={() => deleteColumn(column.id)}
                                  title="Delete column"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Tasks container */}
                        <Droppable droppableId={column.id} type="task">
                          {(provided) => (
                            <div
                              className="planner-tasks"
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                            >
                              {tasks.map((task, index) => (
                                <Draggable
                                  key={task.id}
                                  draggableId={task.id}
                                  index={index}
                                >
                                  {(provided) => (
                                    <div
                                      className="planner-task"
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                    >
                                      {editingTask === task.id ? (
                                        <div className="planner-edit-form">
                                          <input
                                            type="text"
                                            value={newTaskContent}
                                            onChange={(e) => setNewTaskContent(e.target.value)}
                                            className="planner-input"
                                            autoFocus
                                          />
                                          <div className="planner-edit-actions">
                                            <button 
                                              className="planner-icon-button"
                                              onClick={() => updateTask(task.id)}
                                              title="Save"
                                            >
                                              <Check size={14} />
                                            </button>
                                            <button 
                                              className="planner-icon-button"
                                              onClick={() => {
                                                setEditingTask(null);
                                                setNewTaskContent('');
                                              }}
                                              title="Cancel"
                                            >
                                              <X size={14} />
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <div className="planner-task-content">
                                            {task.content}
                                          </div>
                                          <div className="planner-task-actions">
                                            <button 
                                              className="planner-icon-button"
                                              onClick={() => {
                                                setEditingTask(task.id);
                                                setNewTaskContent(task.content);
                                              }}
                                              title="Edit task"
                                            >
                                              <Edit size={14} />
                                            </button>
                                            <button 
                                              className="planner-icon-button"
                                              onClick={() => deleteTask(task.id, column.id)}
                                              title="Delete task"
                                            >
                                              <Trash2 size={14} />
                                            </button>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}

                              {/* Add task form or button */}
                              {addingInColumn === column.id ? (
                                <div className="planner-add-task-form">
                                  <input
                                    type="text"
                                    value={newTaskContent}
                                    onChange={(e) => setNewTaskContent(e.target.value)}
                                    placeholder="Enter task content..."
                                    className="planner-input"
                                    autoFocus
                                  />
                                  <div className="planner-form-actions">
                                    <button 
                                      className="planner-icon-button"
                                      onClick={() => addTask(column.id)}
                                      title="Add task"
                                    >
                                      <Check size={14} />
                                    </button>
                                    <button 
                                      className="planner-icon-button"
                                      onClick={() => {
                                        setAddingInColumn(null);
                                        setNewTaskContent('');
                                      }}
                                      title="Cancel"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button 
                                  className="planner-add-button"
                                  onClick={() => setAddingInColumn(column.id)}
                                >
                                  <Plus size={14} />
                                  Add Task
                                </button>
                              )}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
} 