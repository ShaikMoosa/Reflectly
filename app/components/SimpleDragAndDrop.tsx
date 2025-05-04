'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Minimal example of drag and drop for testing
const SimpleDragAndDrop = () => {
  const [items, setItems] = useState([
    { id: 'item-1', content: 'Item 1' },
    { id: 'item-2', content: 'Item 2' },
    { id: 'item-3', content: 'Item 3' },
  ]);

  const [columns, setColumns] = useState({
    'column-1': {
      id: 'column-1',
      title: 'Column 1',
      itemIds: ['item-1', 'item-2', 'item-3'],
    },
    'column-2': {
      id: 'column-2',
      title: 'Column 2',
      itemIds: [],
    },
  });

  const [columnOrder, setColumnOrder] = useState(['column-1', 'column-2']);

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // If no destination, do nothing
    if (!destination) return;

    // If dropped in same position, do nothing
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    console.log('Moving from', source.droppableId, 'to', destination.droppableId);

    // Get source and destination columns
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];

    // If moving within the same column
    if (sourceColumn.id === destColumn.id) {
      const newItemIds = Array.from(sourceColumn.itemIds);
      newItemIds.splice(source.index, 1);
      newItemIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...sourceColumn,
        itemIds: newItemIds,
      };

      setColumns({
        ...columns,
        [newColumn.id]: newColumn,
      });
      return;
    }

    // Moving from one column to another
    const sourceItemIds = Array.from(sourceColumn.itemIds);
    sourceItemIds.splice(source.index, 1);
    const newSourceColumn = {
      ...sourceColumn,
      itemIds: sourceItemIds,
    };

    const destItemIds = Array.from(destColumn.itemIds);
    destItemIds.splice(destination.index, 0, draggableId);
    const newDestColumn = {
      ...destColumn,
      itemIds: destItemIds,
    };

    setColumns({
      ...columns,
      [newSourceColumn.id]: newSourceColumn,
      [newDestColumn.id]: newDestColumn,
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Simple Drag and Drop Test</h1>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4">
          {columnOrder.map((columnId) => {
            const column = columns[columnId];
            const columnItems = column.itemIds.map(
              (itemId) => items.find((item) => item.id === itemId)
            );

            return (
              <div key={column.id} className="bg-gray-100 p-4 rounded-lg w-64">
                <h2 className="font-bold mb-2">{column.title}</h2>
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[100px] p-2 ${
                        snapshot.isDraggingOver ? 'bg-blue-100' : ''
                      }`}
                    >
                      {columnItems.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-2 mb-2 bg-white rounded border ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                            >
                              {item.content}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
      
      <div className="mt-4 text-sm text-gray-500">
        Open console to see drag events
      </div>
    </div>
  );
};

export default SimpleDragAndDrop; 