'use client';

import React, { useState, useRef, forwardRef, useEffect, useImperativeHandle, useCallback } from 'react';
import { 
  FlowNode, 
  FlowConnection, 
  CanvasState, 
  ToolType, 
  ValidationWarning 
} from './types';
import FlowCanvasNode from './FlowCanvasNode';
import FlowCanvasConnection from './FlowCanvasConnection';

interface FlowCanvasProps {
  nodes: FlowNode[];
  connections: FlowConnection[];
  canvasState: CanvasState;
  selectedTool: ToolType;
  selectedElements: {
    nodes: string[];
    connections: string[];
  };
  warnings: ValidationWarning[];
  isSimulating: boolean;
  readOnly?: boolean;
  onSelectElements: (nodes: string[], connections: string[]) => void;
  onAddNode: (node: FlowNode) => void;
  onUpdateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  onRemoveNode: (nodeId: string) => void;
  onAddConnection: (connection: FlowConnection) => void;
  onUpdateConnectionLabel: (connectionId: string, label: string) => void;
  onRemoveConnection: (connectionId: string) => void;
}

// Generate unique IDs
const generateId = () => `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const FlowCanvas = forwardRef<HTMLDivElement, FlowCanvasProps>(({
  nodes,
  connections,
  canvasState,
  selectedTool,
  selectedElements,
  warnings,
  isSimulating,
  readOnly = false,
  onSelectElements,
  onAddNode,
  onUpdateNodePosition,
  onRemoveNode,
  onAddConnection,
  onUpdateConnectionLabel,
  onRemoveConnection
}, ref) => {
  // Canvas state
  const [isPanning, setIsPanning] = useState(false);
  const [zoom, setZoom] = useState(canvasState.zoom);
  const [position, setPosition] = useState(canvasState.position);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [connectionDraft, setConnectionDraft] = useState<{
    sourceId: string;
    sourceHandle?: string;
    points: [number, number, number, number]; // [x1, y1, x2, y2]
  } | null>(null);
  
  // Rectangle selection
  const [selectionRect, setSelectionRect] = useState<{
    start: { x: number; y: number };
    end: { x: number; y: number };
  } | null>(null);
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<Map<string, HTMLDivElement>>(new Map());
  
  // Expose the canvas ref to parent
  useImperativeHandle(ref, () => canvasRef.current as HTMLDivElement);
  
  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (screenX - rect.left - position.x) / zoom;
    const y = (screenY - rect.top - position.y) / zoom;
    
    return { x, y };
  }, [position, zoom]);
  
  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Prevent default behaviors
    e.preventDefault();
    e.stopPropagation();
    
    // When tools like pan, select, etc. are active
    if (readOnly) return;
    
    // Clear selection if clicking on empty canvas with select tool
    if (selectedTool === 'select') {
      onSelectElements([], []);
      return;
    }
    
    // Add a new node when node tool is selected
    if (selectedTool === 'node') {
      const coords = screenToCanvas(e.clientX, e.clientY);
      
      // Create new node at click position
      const newNode: FlowNode = {
        id: `node-${generateId()}`,
        type: 'default',
        position: {
          x: coords.x,
          y: coords.y
        },
        data: {
          title: 'New Node',
          icon: '📦'
        },
        width: 200,
        height: 100
      };
      
      onAddNode(newNode);
      
      // Switch back to select tool after adding a node
      // (This would be handled by the parent component)
      return;
    }
  }, [selectedTool, readOnly, screenToCanvas, onAddNode, onSelectElements]);
  
  // Handle canvas mouse down
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    // Prevent default behaviors
    e.preventDefault();
    
    if (readOnly) return;
    
    // Start panning with spacebar + drag or with the pan tool
    if ((e.buttons === 1 && (e.nativeEvent as any).getModifierState('Space')) || 
        (e.buttons === 1 && selectedTool === 'pan')) {
      setIsPanning(true);
      setDragStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
      return;
    }
    
    // Start selection rectangle with select tool
    if (e.buttons === 1 && selectedTool === 'select') {
      const coords = screenToCanvas(e.clientX, e.clientY);
      setSelectionRect({
        start: coords,
        end: coords
      });
      return;
    }
    
    // Start lasso selection with lasso tool
    if (e.buttons === 1 && selectedTool === 'lasso') {
      const coords = screenToCanvas(e.clientX, e.clientY);
      // Implementation for lasso would go here
      return;
    }
  }, [readOnly, selectedTool, position, screenToCanvas]);
  
  // Handle canvas mouse move
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    // Pan the canvas
    if (isPanning && dragStartPos) {
      setPosition({
        x: e.clientX - dragStartPos.x,
        y: e.clientY - dragStartPos.y
      });
      return;
    }
    
    // Update selection rectangle
    if (selectionRect) {
      const coords = screenToCanvas(e.clientX, e.clientY);
      setSelectionRect({
        ...selectionRect,
        end: coords
      });
      return;
    }
    
    // Draw connection line draft
    if (connectionDraft) {
      // Update the end point of the draft connection line
      const coords = screenToCanvas(e.clientX, e.clientY);
      setConnectionDraft({
        ...connectionDraft,
        points: [
          connectionDraft.points[0],
          connectionDraft.points[1],
          coords.x,
          coords.y
        ]
      });
      return;
    }
  }, [isPanning, dragStartPos, selectionRect, connectionDraft, screenToCanvas]);
  
  // Handle canvas mouse up
  const handleCanvasMouseUp = useCallback((e: React.MouseEvent) => {
    // End panning
    if (isPanning) {
      setIsPanning(false);
      setDragStartPos(null);
      return;
    }
    
    // Apply selection rectangle
    if (selectionRect) {
      // Calculate which nodes are inside the selection rectangle
      // This is a simple bounding box calculation - more complex shapes would need different logic
      const selectedNodeIds = nodes
        .filter(node => {
          const nodeLeft = node.position.x;
          const nodeRight = node.position.x + (node.width || 200);
          const nodeTop = node.position.y;
          const nodeBottom = node.position.y + (node.height || 100);
          
          const rectLeft = Math.min(selectionRect.start.x, selectionRect.end.x);
          const rectRight = Math.max(selectionRect.start.x, selectionRect.end.x);
          const rectTop = Math.min(selectionRect.start.y, selectionRect.end.y);
          const rectBottom = Math.max(selectionRect.start.y, selectionRect.end.y);
          
          // Check if the node is inside or intersects with the selection rectangle
          return (
            nodeRight >= rectLeft &&
            nodeLeft <= rectRight &&
            nodeBottom >= rectTop &&
            nodeTop <= rectBottom
          );
        })
        .map(node => node.id);
      
      // Similarly for connections (simplified)
      const selectedConnectionIds: string[] = [];
      
      // Update the selected elements
      onSelectElements(selectedNodeIds, selectedConnectionIds);
      
      // Clear the selection rectangle
      setSelectionRect(null);
      return;
    }
    
    // Complete connection draft
    if (connectionDraft) {
      // Logic to find the target node/handle at mouse position
      // and complete the connection
      setConnectionDraft(null);
      return;
    }
  }, [isPanning, selectionRect, connectionDraft, nodes, onSelectElements]);
  
  // Handle zoom with mouse wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    // Zoom in/out with ctrl+wheel
    if (e.ctrlKey) {
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(0.1, Math.min(2, zoom + delta));
      
      // Calculate zoom center point
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Adjust position to keep the point under the mouse fixed
      const zoomFactor = newZoom / zoom;
      const newPositionX = mouseX - (mouseX - position.x) * zoomFactor;
      const newPositionY = mouseY - (mouseY - position.y) * zoomFactor;
      
      setZoom(newZoom);
      setPosition({ x: newPositionX, y: newPositionY });
      return;
    }
    
    // Pan with wheel
    const newPosition = {
      x: position.x - e.deltaX,
      y: position.y - e.deltaY
    };
    
    setPosition(newPosition);
  }, [zoom, position]);
  
  // Handle node selection
  const handleNodeSelect = useCallback((nodeId: string, isMultiSelect: boolean) => {
    if (readOnly) return;
    
    if (isMultiSelect) {
      // Add/remove from selection
      const newSelection = selectedElements.nodes.includes(nodeId)
        ? selectedElements.nodes.filter(id => id !== nodeId)
        : [...selectedElements.nodes, nodeId];
      
      onSelectElements(newSelection, selectedElements.connections);
    } else {
      // Select only this node
      onSelectElements([nodeId], []);
    }
  }, [readOnly, selectedElements, onSelectElements]);
  
  // Handle connection selection
  const handleConnectionSelect = useCallback((connectionId: string, isMultiSelect: boolean) => {
    if (readOnly) return;
    
    if (isMultiSelect) {
      // Add/remove from selection
      const newSelection = selectedElements.connections.includes(connectionId)
        ? selectedElements.connections.filter(id => id !== connectionId)
        : [...selectedElements.connections, connectionId];
      
      onSelectElements(selectedElements.nodes, newSelection);
    } else {
      // Select only this connection
      onSelectElements([], [connectionId]);
    }
  }, [readOnly, selectedElements, onSelectElements]);
  
  // Handle node drag
  const handleNodeDrag = useCallback((nodeId: string, position: { x: number; y: number }) => {
    if (readOnly) return;
    
    onUpdateNodePosition(nodeId, position);
    
    // If multiple nodes are selected, move them all together
    if (selectedElements.nodes.includes(nodeId) && selectedElements.nodes.length > 1) {
      // This would require tracking the initial positions and offsets
      // for all nodes in a more complex implementation
    }
  }, [readOnly, selectedElements.nodes, onUpdateNodePosition]);
  
  // Handle connection start
  const handleConnectionStart = useCallback((nodeId: string, handle?: string, x?: number, y?: number) => {
    if (readOnly || selectedTool !== 'connect') return;
    
    if (x !== undefined && y !== undefined) {
      setConnectionDraft({
        sourceId: nodeId,
        sourceHandle: handle,
        points: [x, y, x, y] // Starting with points at same position
      });
    }
  }, [readOnly, selectedTool]);
  
  // Handle connection end
  const handleConnectionEnd = useCallback((targetNodeId: string, targetHandle?: string) => {
    if (readOnly || !connectionDraft) return;
    
    // Create new connection
    if (connectionDraft.sourceId !== targetNodeId) { // Prevent self-connections
      const newConnection: FlowConnection = {
        id: `conn-${generateId()}`,
        source: connectionDraft.sourceId,
        sourceHandle: connectionDraft.sourceHandle,
        target: targetNodeId,
        targetHandle: targetHandle,
        label: 'Ok'
      };
      
      onAddConnection(newConnection);
    }
    
    setConnectionDraft(null);
  }, [readOnly, connectionDraft, onAddConnection]);
  
  // Handle delete key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (readOnly) return;
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Delete selected nodes
        selectedElements.nodes.forEach(nodeId => {
          onRemoveNode(nodeId);
        });
        
        // Delete selected connections
        selectedElements.connections.forEach(connectionId => {
          onRemoveConnection(connectionId);
        });
        
        // Clear selection
        onSelectElements([], []);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [readOnly, selectedElements, onRemoveNode, onRemoveConnection, onSelectElements]);
  
  // Register node refs
  const registerNodeRef = useCallback((nodeId: string, element: HTMLDivElement | null) => {
    if (element) {
      nodesRef.current.set(nodeId, element);
    } else {
      nodesRef.current.delete(nodeId);
    }
  }, []);
  
  return (
    <div
      ref={canvasRef}
      className="flow-canvas w-full h-full overflow-hidden bg-gray-50 dark:bg-gray-900"
      onClick={handleCanvasClick}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isPanning ? 'grab' : 'default' }}
      tabIndex={0} // Make div focusable for keyboard events
    >
      {/* Transformation container */}
      <div
        className="transform-container w-full h-full"
        style={{
          transformOrigin: '0 0',
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
        }}
      >
        {/* Grid */}
        {canvasState.grid && (
          <div className="grid-pattern absolute inset-0 pointer-events-none" />
        )}
        
        {/* Connections */}
        <svg
          className="connections-layer absolute inset-0 pointer-events-none"
          width="100%"
          height="100%"
        >
          {connections.map(connection => (
            <FlowCanvasConnection
              key={connection.id}
              connection={connection}
              selected={selectedElements.connections.includes(connection.id)}
              sourceNode={nodes.find(n => n.id === connection.source)}
              targetNode={nodes.find(n => n.id === connection.target)}
              onSelect={handleConnectionSelect}
              onLabelChange={onUpdateConnectionLabel}
              showWarning={warnings.some(w => w.elementId === connection.id)}
              isAnimated={isSimulating}
              readOnly={readOnly}
            />
          ))}
          
          {/* Draft connection line */}
          {connectionDraft && (
            <path
              d={`M ${connectionDraft.points[0]},${connectionDraft.points[1]} L ${connectionDraft.points[2]},${connectionDraft.points[3]}`}
              stroke="#888"
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
              pointerEvents="none"
            />
          )}
        </svg>
        
        {/* Nodes */}
        {nodes.map(node => (
          <FlowCanvasNode
            key={node.id}
            node={node}
            registerRef={(el) => registerNodeRef(node.id, el)}
            selected={selectedElements.nodes.includes(node.id)}
            onSelect={handleNodeSelect}
            onDrag={handleNodeDrag}
            onConnectionStart={handleConnectionStart}
            onConnectionEnd={handleConnectionEnd}
            showWarning={warnings.some(w => w.elementId === node.id)}
            isActive={isSimulating}
            readOnly={readOnly}
          />
        ))}
        
        {/* Selection rectangle */}
        {selectionRect && (
          <div
            className="selection-rect border-2 border-blue-500 bg-blue-100 bg-opacity-20 absolute pointer-events-none"
            style={{
              left: Math.min(selectionRect.start.x, selectionRect.end.x),
              top: Math.min(selectionRect.start.y, selectionRect.end.y),
              width: Math.abs(selectionRect.end.x - selectionRect.start.x),
              height: Math.abs(selectionRect.end.y - selectionRect.start.y)
            }}
          />
        )}
      </div>
      
      {/* Zoom controls (always visible) */}
      <div className="zoom-controls absolute bottom-4 right-4 flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-md shadow-md">
        <button
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
          aria-label="Zoom out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 10H9M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18ZM22 22l-3-3"/></svg>
        </button>
        
        <span className="text-sm">
          {Math.round(zoom * 100)}%
        </span>
        
        <button
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => setZoom(Math.min(2, zoom + 0.1))}
          aria-label="Zoom in"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 10h-6M12 7v6M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18ZM22 22l-3-3"/></svg>
        </button>
        
        <button
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => {
            setZoom(1);
            setPosition({ x: 0, y: 0 });
          }}
          aria-label="Reset view"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 8v8M8 12h8"/></svg>
        </button>
      </div>
    </div>
  );
});

FlowCanvas.displayName = 'FlowCanvas';

export default FlowCanvas; 