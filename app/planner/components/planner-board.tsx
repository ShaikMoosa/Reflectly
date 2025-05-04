'use client';

import React, { useState, useEffect } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
  DropResult,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot,
  DroppableStateSnapshot,
} from '@hello-pangea/dnd'; // Using the maintained fork
import {
  PlannerData,
  addColumn,
  addTask,
  deleteColumn,
  deleteTask,
  updateColumnOrder,
  updateColumnTitle,
  updateTaskContent,
  updateTaskOrder,
} from '../actions';
import { Button } from '../../components/ui/button'; // Fixed path
import { Input } from '../../components/ui/input';   // Fixed path
import { Textarea } from '../../components/ui/textarea'; // Fixed path
import { PlusIcon, TrashIcon, EditIcon, CheckIcon, XIcon } from 'lucide-react'; // Example icons
import { toast } from 'sonner'; // Assuming shadcn uses sonner for toasts

type PlannerColumn = PlannerData['columns'][0];
type PlannerTask = PlannerColumn['tasks'][0];

interface PlannerBoardProps {
  initialData: PlannerData;
}

// Helper to reorder list
const reorder = <T extends any[]>(list: T, startIndex: number, endIndex: number): T => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result as T;
};

export default function PlannerBoard({ initialData }: PlannerBoardProps) {
  // Initialize state from server-fetched data
  const [columns, setColumns] = useState<PlannerData['columns']>(initialData.columns);
  const [isClient, setIsClient] = useState(false);

  // Ensure dnd works correctly with SSR
  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- Drag and Drop Logic ---
  const onDragEnd: OnDragEndResponder = async (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    // Dropped outside a valid droppable
    if (!destination) {
      return;
    }

    // Dropped in the same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // --- Optimistic Update & Server Action Call ---
    const originalColumns = columns;
    // Deep copy might be safer for nested tasks, but shallow copy often sufficient
    const updatedColumns = columns.map(col => ({ ...col, tasks: [...col.tasks] }));

    try {
      // --- Handling Column Dragging ---
      if (type === 'COLUMN') {
        const newColumnOrder = reorder(
          updatedColumns,
          source.index,
          destination.index
        );

        // Optimistic UI update
        setColumns(newColumnOrder);

        // Prepare IDs for server action
        const orderedColumnIds = newColumnOrder.map((col) => col.id);

        // Call server action (no await needed for optimistic update)
        updateColumnOrder(orderedColumnIds)
          .then(() => toast.success('Column order saved.'))
          .catch((error) => {
            console.error("Failed to update column order:", error);
            toast.error(`Failed to save column order: ${error.message}`);
            setColumns(originalColumns); // Revert on error
          });
        return;
      }

      // --- Handling Task Dragging ---
      if (type === 'TASK') {
        const startColumnIndex = updatedColumns.findIndex(col => col.id === source.droppableId);
        const finishColumnIndex = updatedColumns.findIndex(col => col.id === destination.droppableId);

        if (startColumnIndex === -1 || finishColumnIndex === -1) return; // Column not found

        const startColumn = updatedColumns[startColumnIndex];
        const finishColumn = updatedColumns[finishColumnIndex];

        // Task moved within the same column
        if (startColumn.id === finishColumn.id) {
          const newTasks = reorder(
            startColumn.tasks,
            source.index,
            destination.index
          );
          // Update tasks in the copied column
          updatedColumns[startColumnIndex] = { ...startColumn, tasks: newTasks };
        } else {
          // Task moved to a different column
          const startTasks = [...startColumn.tasks];
          const finishTasks = [...finishColumn.tasks];

          const [movedTask] = startTasks.splice(source.index, 1);
          movedTask.column_id = finishColumn.id; // Update column_id reference
          finishTasks.splice(destination.index, 0, movedTask);

          // Update tasks in the copied columns
          updatedColumns[startColumnIndex] = { ...startColumn, tasks: startTasks };
          updatedColumns[finishColumnIndex] = { ...finishColumn, tasks: finishTasks };
        }

        // Renumber tasks in affected columns and identify actual changes
        const taskUpdates: Array<{ id: string; column_id: string; task_order: number }> = [];
        updatedColumns.forEach(col => {
          col.tasks.forEach((task, index) => {
            // Check if order or column actually changed compared to the original state
            const originalColumn = originalColumns.find(oc => oc.id === col.id);
            const originalTask = originalColumn?.tasks.find(ot => ot.id === task.id);

            if (!originalTask || originalTask.task_order !== index || originalTask.column_id !== task.column_id) {
                // Only add to updates if something changed
                taskUpdates.push({ id: task.id, column_id: task.column_id, task_order: index });
            }
             // Ensure local state has correct order regardless of whether it changed
             task.task_order = index;
          });
        });

        // Optimistic UI update with the reordered/moved tasks
        setColumns(updatedColumns);

        // Call server action only if there are actual changes to persist
        if (taskUpdates.length > 0) {
          updateTaskOrder(taskUpdates)
            .then(() => toast.success('Task order saved.'))
            .catch((error) => {
              console.error("Failed to update task order:", error);
              toast.error(`Failed to save task order: ${error.message}`);
              setColumns(originalColumns); // Revert on error
            });
        }
      }
    } catch (error) {
      console.error("Error during drag operation:", error);
      toast.error("An unexpected error occurred during drag.");
      setColumns(originalColumns); // Revert on any processing error
    }
  };

  // --- Handlers for CRUD using Server Actions ---
  const handleAddColumn = async (title: string) => {
    if (!title.trim()) return;
    const originalColumns = columns;
    // Optimistic: Add temporary column (consider adding a loading state)
    const tempId = `temp-${Date.now()}`;
    const optimisticColumn: PlannerColumn & { tasks: PlannerTask[] } = {
        id: tempId,
        title: title,
        column_order: columns.length, // Temporary order
        user_id: 'temp-user', // Placeholder, server will set correct user
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tasks: []
    };
    setColumns([...columns, optimisticColumn]);
    try {
      const newColumn = await addColumn(title);
      // Replace temp column with real one
       setColumns(prev => prev.map(col => col.id === tempId ? { ...newColumn, tasks: [] } : col));
      toast.success(`Column "${newColumn.title}" added.`);
    } catch (error: any) {
      console.error("Failed to add column:", error);
      toast.error(`Failed to add column: ${error.message}`);
      setColumns(originalColumns); // Revert
    }
  };

  const handleUpdateColumnTitle = async (id: string, newTitle: string) => {
     if (!newTitle.trim()) return;
     const originalColumns = columns;
     const optimisticColumns = columns.map(col => col.id === id ? { ...col, title: newTitle } : col);
     setColumns(optimisticColumns);
     try {
        await updateColumnTitle(id, newTitle);
        toast.success('Column title updated.');
     } catch (error: any) {
        console.error("Failed to update column title:", error);
        toast.error(`Failed to update column title: ${error.message}`);
        setColumns(originalColumns); // Revert
     }
  };

  const handleDeleteColumn = async (id: string) => {
      const originalColumns = columns;
      const optimisticColumns = columns.filter(col => col.id !== id);
      setColumns(optimisticColumns);
      try {
         await deleteColumn(id);
         toast.success('Column deleted.');
      } catch (error: any) {
         console.error("Failed to delete column:", error);
         toast.error(`Failed to delete column: ${error.message}`);
         setColumns(originalColumns); // Revert
      }
  };

  const handleAddTask = async (columnId: string, content: string) => {
      if (!content.trim()) return;
      const originalColumns = columns;
      const tempId = `temp-task-${Date.now()}`;
      // Optimistic update
      const optimisticColumns = columns.map(col => {
          if (col.id === columnId) {
              const optimisticTask: PlannerTask = {
                  id: tempId,
                  content,
                  column_id: columnId,
                  task_order: col.tasks.length, // Temp order
                  user_id: 'temp-user',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
              };
              return { ...col, tasks: [...col.tasks, optimisticTask] };
          }
          return col;
      });
      setColumns(optimisticColumns);

      try {
         const newTask = await addTask(columnId, content);
         // Replace temp task
         setColumns(prev => prev.map(col => {
             if (col.id === columnId) {
                 return { ...col, tasks: col.tasks.map(t => t.id === tempId ? newTask : t) };
             }
             return col;
         }));
         toast.success('Task added.');
      } catch (error: any) {
         console.error("Failed to add task:", error);
         toast.error(`Failed to add task: ${error.message}`);
         setColumns(originalColumns); // Revert
      }
  };

  const handleUpdateTaskContent = async (taskId: string, newContent: string) => {
    if (!newContent.trim()) return;
    const originalColumns = columns;
    // Optimistic update
    const optimisticColumns = columns.map(col => ({
        ...col,
        tasks: col.tasks.map(task => task.id === taskId ? { ...task, content: newContent } : task)
    }));
    setColumns(optimisticColumns);

    try {
        await updateTaskContent(taskId, newContent);
        toast.success('Task updated.');
    } catch (error: any) {
        console.error("Failed to update task:", error);
        toast.error(`Failed to update task: ${error.message}`);
        setColumns(originalColumns); // Revert
    }
  };

  const handleDeleteTask = async (taskId: string, columnId: string) => {
     const originalColumns = columns;
     // Optimistic update
     const optimisticColumns = columns.map(col => {
         if (col.id === columnId) {
             return { ...col, tasks: col.tasks.filter(task => task.id !== taskId) };
         }
         return col;
     });
     setColumns(optimisticColumns);

     try {
         await deleteTask(taskId);
         toast.success('Task deleted.');
     } catch (error: any) {
         console.error("Failed to delete task:", error);
         toast.error(`Failed to delete task: ${error.message}`);
         setColumns(originalColumns); // Revert
     }
  };

  // Render only on client after hydration
  if (!isClient) {
    return null; // Or a basic skeleton/loader
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
        {(provided: DroppableProvided) => ( // Add type
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex space-x-4 overflow-x-auto pb-4 h-full"
          >
            {columns.map((column, index) => (
              <ColumnComponent
                key={column.id}
                column={column}
                index={index}
                onUpdateColumnTitle={handleUpdateColumnTitle}
                onDeleteColumn={handleDeleteColumn}
                onAddTask={handleAddTask}
                onUpdateTaskContent={handleUpdateTaskContent}
                onDeleteTask={handleDeleteTask}
              />
            ))}
            {provided.placeholder}
            <AddColumnForm onAddColumn={handleAddColumn} />
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

// --- Column Component ---
interface ColumnComponentProps {
  column: PlannerColumn & { tasks: PlannerTask[] };
  index: number;
  onUpdateColumnTitle: (id: string, title: string) => void;
  onDeleteColumn: (id: string) => void;
  onAddTask: (columnId: string, content: string) => void;
  onUpdateTaskContent: (taskId: string, content: string) => void;
  onDeleteTask: (taskId: string, columnId: string) => void;
}

function ColumnComponent({ column, index, onUpdateColumnTitle, onDeleteColumn, onAddTask, onUpdateTaskContent, onDeleteTask }: ColumnComponentProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState(column.title);

  const handleTitleSave = () => {
    if (newTitle.trim() !== column.title) {
        onUpdateColumnTitle(column.id, newTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setNewTitle(column.title);
    setIsEditingTitle(false);
  };

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided: DraggableProvided) => ( // Add type
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="w-72 flex-shrink-0 bg-muted rounded-lg p-3 flex flex-col h-full max-h-[calc(100vh-12rem)]"
        >
          {/* Column Header */}
          <div {...provided.dragHandleProps} className="flex justify-between items-center mb-3 cursor-grab active:cursor-grabbing">
            {isEditingTitle ? (
               <div className='flex-grow flex items-center space-x-1'>
                 <Input
                    value={newTitle}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value)} // Add type
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleTitleSave()} // Add type
                    autoFocus
                    className='h-8'
                 />
                 <Button variant="ghost" size="icon" className='h-8 w-8 text-green-600 hover:text-green-700' onClick={handleTitleSave}><CheckIcon size={16} /></Button>
                 <Button variant="ghost" size="icon" className='h-8 w-8 text-red-600 hover:text-red-700' onClick={handleTitleCancel}><XIcon size={16} /></Button>
               </div>
            ) : (
               <h2 onClick={() => setIsEditingTitle(true)} className="font-semibold text-lg flex-grow cursor-pointer truncate" title={column.title}>{column.title}</h2>
            )}
            {!isEditingTitle && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive-foreground hover:bg-destructive/80 ml-2 h-8 w-8"
                    onClick={() => onDeleteColumn(column.id)}
                    title="Delete column"
                 >
                    <TrashIcon size={16} />
                </Button>
            )}
          </div>

          {/* Tasks Droppable Area */}
          <Droppable droppableId={column.id} type="TASK">
            {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => ( // Add types
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-grow overflow-y-auto p-1 rounded space-y-2 min-h-[60px] ${snapshot.isDraggingOver ? 'bg-primary/10' : ''}`}
              >
                {column.tasks.map((task, index) => (
                  <TaskComponent
                    key={task.id}
                    task={task}
                    index={index}
                    onUpdateTaskContent={onUpdateTaskContent}
                    onDeleteTask={onDeleteTask}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Add Task Form */}
          <AddTaskForm columnId={column.id} onAddTask={onAddTask} />

        </div>
      )}
    </Draggable>
  );
}

// --- Task Component ---
interface TaskComponentProps {
  task: PlannerTask;
  index: number;
  onUpdateTaskContent: (taskId: string, content: string) => void;
  onDeleteTask: (taskId: string, columnId: string) => void;
}

function TaskComponent({ task, index, onUpdateTaskContent, onDeleteTask }: TaskComponentProps) {
   const [isEditing, setIsEditing] = useState(false);
   const [content, setContent] = useState(task.content);

   const handleSave = () => {
      if (content.trim() && content.trim() !== task.content) {
          onUpdateTaskContent(task.id, content.trim());
      }
      setIsEditing(false);
   };

   const handleCancel = () => {
       setContent(task.content);
       setIsEditing(false);
   };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => ( // Add types
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-card p-3 rounded shadow-sm border ${snapshot.isDragging ? 'border-primary shadow-lg' : 'border-border'}`}
        >
          {isEditing ? (
            <div className='space-y-1'>
                <Textarea
                    value={content}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)} // Add type
                    autoFocus
                    rows={3}
                />
                <div className='flex justify-end space-x-1'>
                    <Button variant="ghost" size="sm" className='text-green-600 hover:text-green-700' onClick={handleSave}>Save</Button>
                    <Button variant="ghost" size="sm" className='text-red-600 hover:text-red-700' onClick={handleCancel}>Cancel</Button>
                </div>
            </div>
          ) : (
             <div className="flex justify-between items-start">
                <p className="text-sm whitespace-pre-wrap break-words flex-grow mr-2" onClick={() => setIsEditing(true)}>{task.content}</p>
                <div className='flex flex-col space-y-1'>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => setIsEditing(true)} title="Edit task"><EditIcon size={12} /></Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive-foreground hover:bg-destructive/80" onClick={() => onDeleteTask(task.id, task.column_id)} title="Delete task"><TrashIcon size={12} /></Button>
                </div>
             </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

// --- Add Column Form ---
interface AddColumnFormProps {
  onAddColumn: (title: string) => void;
}

function AddColumnForm({ onAddColumn }: AddColumnFormProps) {
  const [title, setTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleAdd = () => {
    if (title.trim()) {
      onAddColumn(title.trim());
      setTitle('');
      setIsEditing(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="w-72 flex-shrink-0 pt-1">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setIsEditing(true)}
        >
          <PlusIcon className="mr-2 h-4 w-4" /> Add another list
        </Button>
      </div>
    );
  }

  return (
    <div className="w-72 flex-shrink-0 bg-muted rounded-lg p-2 space-y-2">
      <Input
        placeholder="Enter list title..."
        value={title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} // Add type
        autoFocus
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleAdd()} // Add type
      />
      <div className="flex items-center space-x-2">
        <Button onClick={handleAdd}>Add list</Button>
        <Button variant="ghost" onClick={() => setIsEditing(false)}><XIcon className='h-5 w-5' /></Button>
      </div>
    </div>
  );
}

// --- Add Task Form ---
interface AddTaskFormProps {
  columnId: string;
  onAddTask: (columnId: string, content: string) => void;
}

function AddTaskForm({ columnId, onAddTask }: AddTaskFormProps) {
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) {
        textareaRef.current?.focus();
    }
  }, [isEditing]);

  const handleAdd = () => {
    if (content.trim()) {
      onAddTask(columnId, content.trim());
      setContent('');
      // Keep editing open to add multiple tasks easily, or set setIsEditing(false)
      // setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault(); // Prevent newline
          handleAdd();
      } else if (e.key === 'Escape') {
          setContent('');
          setIsEditing(false);
      }
  };

  if (!isEditing) {
    return (
      <Button
        variant="ghost"
        className="w-full justify-start mt-2 text-muted-foreground hover:text-foreground"
        onClick={() => setIsEditing(true)}
      >
        <PlusIcon className="mr-2 h-4 w-4" /> Add a card
      </Button>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      <Textarea
        ref={textareaRef}
        placeholder="Enter a title for this card..."
        value={content}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)} // Add type
        onKeyDown={handleKeyDown}
        rows={3}
        className="resize-none"
      />
      <div className="flex items-center space-x-2">
        <Button onClick={handleAdd}>Add card</Button>
        <Button variant="ghost" onClick={() => { setContent(''); setIsEditing(false); }}><XIcon className='h-5 w-5' /></Button>
      </div>
    </div>
  );
} 