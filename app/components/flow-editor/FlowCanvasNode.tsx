'use client';

import React, { useRef, useState, useEffect } from 'react';
import { FlowNode } from './types';

interface NodeProps {
  node: FlowNode;
  selected: boolean;
  showWarning?: boolean;
  isActive?: boolean;
  readOnly?: boolean;
  registerRef: (element: HTMLDivElement | null) => void;
  onSelect: (nodeId: string, isMultiSelect: boolean) => void;
  onDrag: (nodeId: string, position: { x: number; y: number }) => void;
  onConnectionStart: (nodeId: string, handle?: string, x?: number, y?: number) => void;
  onConnectionEnd: (targetNodeId: string, targetHandle?: string) => void;
}

const FlowCanvasNode: React.FC<NodeProps> = ({
  node,
  selected,
  showWarning = false,
  isActive = false,
  readOnly = false,
  registerRef,
  onSelect,
  onDrag,
  onConnectionStart,
  onConnectionEnd
}) => {
  // Node refs
  const nodeRef = useRef<HTMLDivElement>(null);
  
  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Register the node ref with parent component
  useEffect(() => {
    registerRef(nodeRef.current);
    return () => registerRef(null);
  }, [registerRef]);
  
  // Handle node mouse down
  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly) return;
    
    // Prevent event propagation to canvas
    e.stopPropagation();
    
    // Select node
    onSelect(node.id, e.ctrlKey || e.metaKey);
    
    // Start dragging
    if (e.button === 0) {
      const rect = nodeRef.current?.getBoundingClientRect();
      if (rect) {
        setIsDragging(true);
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };
  
  // Handle node drag
  useEffect(() => {
    if (!isDragging || readOnly) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate new position
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Update node position
      onDrag(node.id, { x: newX, y: newY });
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, node.id, onDrag, readOnly]);
  
  // Handle connection port mouse down
  const handlePortMouseDown = (e: React.MouseEvent, portType: 'input' | 'output', portId?: string) => {
    if (readOnly) return;
    
    e.stopPropagation();
    
    if (portType === 'output') {
      // Start connection from this port
      const rect = e.currentTarget.getBoundingClientRect();
      const portX = rect.left + rect.width / 2;
      const portY = rect.top + rect.height / 2;
      
      onConnectionStart(node.id, portId, portX, portY);
    }
  };
  
  // Handle connection port mouse up
  const handlePortMouseUp = (e: React.MouseEvent, portType: 'input' | 'output', portId?: string) => {
    if (readOnly) return;
    
    e.stopPropagation();
    
    if (portType === 'input') {
      // End connection at this port
      onConnectionEnd(node.id, portId);
    }
  };

  return (
    <div
      ref={nodeRef}
      className={`flow-node absolute flex flex-col rounded-md shadow-md transition-shadow ${
        selected 
          ? 'ring-2 ring-indigo-500 dark:ring-indigo-400'
          : showWarning
          ? 'ring-2 ring-yellow-500 dark:ring-yellow-400'
          : ''
      } ${
        isActive ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'bg-white dark:bg-gray-800'
      }`}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: node.width || 200,
        height: node.height || 100,
        zIndex: selected ? 10 : node.zIndex || 1,
        cursor: readOnly ? 'default' : 'move'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Node header */}
      <div className="px-3 py-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <span className="mr-2 text-lg">{node.data.icon || '📦'}</span>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {node.data.title}
          </h3>
        </div>
        
        {/* Node menu button */}
        {!readOnly && (
          <button
            className="w-5 h-5 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Node content */}
      <div className="flex-grow p-3 text-xs text-gray-600 dark:text-gray-300">
        {node.data.properties ? (
          <div className="space-y-1">
            {Object.entries(node.data.properties).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="font-medium">{key}:</span>
                <span>{String(value)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="italic text-gray-400 dark:text-gray-500">No properties</p>
        )}
      </div>
      
      {/* Connection ports */}
      <div 
        className="input-port absolute w-3 h-3 bg-blue-400 dark:bg-blue-500 rounded-full top-1/2 -left-1.5 transform -translate-y-1/2 cursor-crosshair"
        onMouseDown={(e) => handlePortMouseDown(e, 'input')}
        onMouseUp={(e) => handlePortMouseUp(e, 'input')}
      />
      <div 
        className="output-port absolute w-3 h-3 bg-green-400 dark:bg-green-500 rounded-full top-1/2 -right-1.5 transform -translate-y-1/2 cursor-crosshair"
        onMouseDown={(e) => handlePortMouseDown(e, 'output')}
        onMouseUp={(e) => handlePortMouseUp(e, 'output')}
      />
    </div>
  );
};

export default FlowCanvasNode; 