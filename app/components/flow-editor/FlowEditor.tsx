'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FlowData, 
  FlowNode, 
  FlowConnection, 
  ToolType,
  HistoryAction,
  HistoryActionType,
  ValidationWarning
} from './types';
import FlowHeader from './FlowHeader';
import FlowCanvas from './FlowCanvas';
import FlowToolbar from './FlowToolbar';
import FlowNodePanel from './FlowNodePanel';
import FlowPropertyPanel from './FlowPropertyPanel';
import VersionHistoryPanel from './VersionHistoryPanel';

// Default flow data for a new project
const defaultFlowData: FlowData = {
  project: {
    id: 'project-1',
    title: 'New Flow',
    description: 'A new flow project',
    currentVersion: {
      id: 'v-1',
      name: 'V1 - Draft',
      description: 'Initial draft',
      timestamp: new Date().toISOString(),
      isApproved: false
    },
    versions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'Current User'
  },
  nodes: [],
  connections: [],
  canvas: {
    zoom: 1,
    position: { x: 0, y: 0 },
    grid: true,
    snapToGrid: true
  }
};

interface FlowEditorProps {
  initialData?: FlowData;
  readOnly?: boolean;
}

export default function FlowEditor({ 
  initialData = defaultFlowData, 
  readOnly = false 
}: FlowEditorProps) {
  // Main state
  const [flowData, setFlowData] = useState<FlowData>(initialData);
  const [selectedTool, setSelectedTool] = useState<ToolType>('select');
  const [selectedElements, setSelectedElements] = useState<{
    nodes: string[],
    connections: string[]
  }>({ nodes: [], connections: [] });
  const [history, setHistory] = useState<HistoryAction[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [warnings, setWarnings] = useState<ValidationWarning[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showProperties, setShowProperties] = useState(false);

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);

  // Initialize flow with data
  useEffect(() => {
    setFlowData(initialData);
    // Reset history when initializing with new data
    setHistory([]);
    setHistoryIndex(-1);
  }, [initialData]);

  // Add a history entry
  const addHistoryEntry = useCallback((action: HistoryAction) => {
    // If we're not at the end of history, remove future entries
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(action);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex >= 0) {
      const action = history[historyIndex];
      
      // Apply undo action based on type
      // This is simplified - actual implementation would be more complex
      if (action.type === HistoryActionType.ADD_NODE) {
        setFlowData(prev => ({
          ...prev,
          nodes: prev.nodes.filter(node => node.id !== action.payload.id)
        }));
      } else if (action.type === HistoryActionType.REMOVE_NODE && action.undoData) {
        setFlowData(prev => ({
          ...prev,
          nodes: [...prev.nodes, action.undoData]
        }));
      }
      // Add other undo handlers for different action types
      
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const action = history[historyIndex + 1];
      
      // Apply redo action based on type
      // This is simplified - actual implementation would be more complex
      if (action.type === HistoryActionType.ADD_NODE) {
        setFlowData(prev => ({
          ...prev,
          nodes: [...prev.nodes, action.payload]
        }));
      } else if (action.type === HistoryActionType.REMOVE_NODE) {
        setFlowData(prev => ({
          ...prev,
          nodes: prev.nodes.filter(node => node.id !== action.payload.id)
        }));
      }
      // Add other redo handlers for different action types
      
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  // Add node to canvas
  const handleAddNode = useCallback((node: FlowNode) => {
    setFlowData(prev => ({
      ...prev,
      nodes: [...prev.nodes, node]
    }));
    
    addHistoryEntry({
      type: HistoryActionType.ADD_NODE,
      payload: node,
      timestamp: new Date().toISOString()
    });
  }, [addHistoryEntry]);

  // Remove node from canvas
  const handleRemoveNode = useCallback((nodeId: string) => {
    const nodeToRemove = flowData.nodes.find(node => node.id === nodeId);
    
    if (nodeToRemove) {
      setFlowData(prev => ({
        ...prev,
        nodes: prev.nodes.filter(node => node.id !== nodeId),
        // Also remove any connections attached to this node
        connections: prev.connections.filter(
          conn => conn.source !== nodeId && conn.target !== nodeId
        )
      }));
      
      addHistoryEntry({
        type: HistoryActionType.REMOVE_NODE,
        payload: { id: nodeId },
        timestamp: new Date().toISOString(),
        undoData: nodeToRemove
      });
    }
  }, [flowData.nodes, addHistoryEntry]);

  // Add connection between nodes
  const handleAddConnection = useCallback((connection: FlowConnection) => {
    setFlowData(prev => ({
      ...prev,
      connections: [...prev.connections, connection]
    }));
    
    addHistoryEntry({
      type: HistoryActionType.ADD_CONNECTION,
      payload: connection,
      timestamp: new Date().toISOString()
    });
  }, [addHistoryEntry]);

  // Remove connection
  const handleRemoveConnection = useCallback((connectionId: string) => {
    const connectionToRemove = flowData.connections.find(conn => conn.id === connectionId);
    
    if (connectionToRemove) {
      setFlowData(prev => ({
        ...prev,
        connections: prev.connections.filter(conn => conn.id !== connectionId)
      }));
      
      addHistoryEntry({
        type: HistoryActionType.REMOVE_CONNECTION,
        payload: { id: connectionId },
        timestamp: new Date().toISOString(),
        undoData: connectionToRemove
      });
    }
  }, [flowData.connections, addHistoryEntry]);

  // Update node position (after dragging)
  const handleUpdateNodePosition = useCallback((nodeId: string, position: { x: number, y: number }) => {
    setFlowData(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId 
          ? { ...node, position }
          : node
      )
    }));
    
    // We could add this to history but typically we'd want to batch position updates
  }, []);

  // Update node data
  const handleUpdateNodeData = useCallback((nodeId: string, data: any) => {
    setFlowData(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, ...data } }
          : node
      )
    }));
    
    addHistoryEntry({
      type: HistoryActionType.UPDATE_NODE,
      payload: { id: nodeId, data },
      timestamp: new Date().toISOString()
    });
  }, [addHistoryEntry]);

  // Update connection label
  const handleUpdateConnectionLabel = useCallback((connectionId: string, label: string) => {
    setFlowData(prev => ({
      ...prev,
      connections: prev.connections.map(conn => 
        conn.id === connectionId 
          ? { ...conn, label }
          : conn
      )
    }));
    
    addHistoryEntry({
      type: HistoryActionType.UPDATE_CONNECTION,
      payload: { id: connectionId, label },
      timestamp: new Date().toISOString()
    });
  }, [addHistoryEntry]);

  // Select elements
  const handleSelectElements = useCallback((nodes: string[], connections: string[]) => {
    setSelectedElements({ nodes, connections });
    
    // If any elements are selected, show the properties panel
    if (nodes.length > 0 || connections.length > 0) {
      setShowProperties(true);
    }
  }, []);

  // Handle tool selection
  const handleToolSelect = useCallback((tool: ToolType) => {
    setSelectedTool(tool);
  }, []);

  // Validate the flow
  const validateFlow = useCallback(() => {
    const newWarnings: ValidationWarning[] = [];
    
    // Check for nodes without connections
    flowData.nodes.forEach(node => {
      const hasConnections = flowData.connections.some(
        conn => conn.source === node.id || conn.target === node.id
      );
      
      if (!hasConnections) {
        newWarnings.push({
          id: `warning-${node.id}`,
          type: 'warning',
          message: `Node "${node.data.title}" has no connections`,
          elementId: node.id
        });
      }
    });
    
    // Check for other validation issues
    // ... add more validation rules as needed
    
    setWarnings(newWarnings);
  }, [flowData.nodes, flowData.connections]);

  // Run validation when flow changes
  useEffect(() => {
    validateFlow();
  }, [flowData.nodes, flowData.connections, validateFlow]);

  // Render the flow editor
  return (
    <div className="flow-editor-container h-full flex flex-col overflow-hidden">
      {/* Header with project info and version controls */}
      <FlowHeader 
        project={flowData.project}
        warnings={warnings}
        onVersionChange={() => setShowVersionHistory(true)}
        onExport={() => console.log('Export flow data', flowData)}
        readOnly={readOnly}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Side toolbar */}
        <FlowToolbar
          selectedTool={selectedTool}
          onToolSelect={handleToolSelect}
          canUndo={historyIndex >= 0}
          canRedo={historyIndex < history.length - 1}
          onUndo={handleUndo}
          onRedo={handleRedo}
          readOnly={readOnly}
        />
        
        {/* Main canvas area */}
        <div className="flex-1 relative overflow-hidden">
          <FlowCanvas
            ref={canvasRef}
            nodes={flowData.nodes}
            connections={flowData.connections}
            canvasState={flowData.canvas}
            selectedTool={selectedTool}
            selectedElements={selectedElements}
            onSelectElements={handleSelectElements}
            onAddNode={handleAddNode}
            onUpdateNodePosition={handleUpdateNodePosition}
            onRemoveNode={handleRemoveNode}
            onAddConnection={handleAddConnection}
            onUpdateConnectionLabel={handleUpdateConnectionLabel}
            onRemoveConnection={handleRemoveConnection}
            warnings={warnings}
            isSimulating={isSimulating}
            readOnly={readOnly}
          />
        </div>
        
        {/* Properties panel (if element selected) */}
        {showProperties && (
          <FlowPropertyPanel
            selectedNodes={flowData.nodes.filter(node => 
              selectedElements.nodes.includes(node.id)
            )}
            selectedConnections={flowData.connections.filter(conn => 
              selectedElements.connections.includes(conn.id)
            )}
            onUpdateNodeData={handleUpdateNodeData}
            onUpdateConnectionLabel={handleUpdateConnectionLabel}
            onClose={() => setShowProperties(false)}
            readOnly={readOnly}
          />
        )}
      </div>
      
      {/* Version history panel (conditional) */}
      {showVersionHistory && (
        <VersionHistoryPanel
          project={flowData.project}
          onClose={() => setShowVersionHistory(false)}
          onVersionSelect={(versionId) => console.log('Selected version', versionId)}
          readOnly={readOnly}
        />
      )}
    </div>
  );
} 