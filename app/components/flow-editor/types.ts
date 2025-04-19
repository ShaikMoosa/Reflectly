// Flow types for the Whiteboard Flow Editor

// Node Interface
export interface FlowNode {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: {
    title: string;
    icon?: string;
    properties?: Record<string, any>;
    metadata?: Record<string, any>;
  };
  width?: number;
  height?: number;
  selected?: boolean;
  dragging?: boolean;
  zIndex?: number;
}

// Connection (Edge) Interface
export interface FlowConnection {
  id: string;
  source: string; // Node ID
  sourceHandle?: string;
  target: string; // Node ID
  targetHandle?: string;
  label?: string;
  type?: string;
  selected?: boolean;
  animated?: boolean;
  style?: React.CSSProperties;
}

// Project Version Information
export interface FlowVersion {
  id: string;
  name: string;
  description?: string;
  timestamp: string;
  approvedBy?: string;
  isApproved: boolean;
}

// Project Information
export interface FlowProject {
  id: string;
  title: string;
  description?: string;
  currentVersion: FlowVersion;
  versions: FlowVersion[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Canvas State
export interface CanvasState {
  zoom: number;
  position: { x: number; y: number };
  grid: boolean;
  snapToGrid: boolean;
}

// Complete Flow Data
export interface FlowData {
  project: FlowProject;
  nodes: FlowNode[];
  connections: FlowConnection[];
  canvas: CanvasState;
}

// Tool types
export type ToolType = 
  | 'select' 
  | 'pan' 
  | 'node' 
  | 'connect' 
  | 'text' 
  | 'delete'
  | 'lasso';

// History Action Types
export enum HistoryActionType {
  ADD_NODE = 'ADD_NODE',
  REMOVE_NODE = 'REMOVE_NODE',
  UPDATE_NODE = 'UPDATE_NODE',
  ADD_CONNECTION = 'ADD_CONNECTION',
  REMOVE_CONNECTION = 'REMOVE_CONNECTION',
  UPDATE_CONNECTION = 'UPDATE_CONNECTION',
  MOVE_NODES = 'MOVE_NODES',
  MULTI_CHANGE = 'MULTI_CHANGE',
}

// History Action
export interface HistoryAction {
  type: HistoryActionType;
  payload: any;
  timestamp: string;
  undoData?: any;
}

// Validation Warning
export interface ValidationWarning {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  elementId?: string; // Reference to node or connection
}

// Simulation State
export interface SimulationState {
  isActive: boolean;
  currentNodeId?: string;
  data?: Record<string, any>;
  path: string[];
  isComplete: boolean;
} 