'use client';

import { create } from 'zustand';
import { nanoid } from 'nanoid';

export type ShapeType = 'rectangle' | 'ellipse' | 'path' | 'text' | 'note';

export type Point = {
  x: number;
  y: number;
};

export type Color = string;

export interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fill: Color;
  points?: Point[];
  text?: string;
}

interface WhiteboardState {
  shapes: Shape[];
  selectedIds: string[];
  currentTool: ShapeType | 'select';
  currentColor: Color;
  isDrawing: boolean;
  canvasPosition: { x: number; y: number };
  scale: number;
  history: Shape[][];
  historyIndex: number;
  
  // Actions
  setCurrentTool: (tool: ShapeType | 'select') => void;
  setCurrentColor: (color: Color) => void;
  addShape: (shape: Omit<Shape, 'id'>) => string;
  updateShape: (id: string, shape: Partial<Shape>) => void;
  deleteShape: (id: string) => void;
  selectShape: (id: string, isMultiSelect?: boolean) => void;
  clearSelection: () => void;
  setIsDrawing: (isDrawing: boolean) => void;
  setCanvasPosition: (position: { x: number; y: number }) => void;
  setScale: (scale: number) => void;
  duplicateSelectedShapes: () => void;
  undoLastAction: () => void;
}

export const useWhiteboardStore = create<WhiteboardState>((set, get) => ({
  shapes: [],
  selectedIds: [],
  currentTool: 'select',
  currentColor: '#000000',
  isDrawing: false,
  canvasPosition: { x: 0, y: 0 },
  scale: 1,
  history: [[]],
  historyIndex: 0,
  
  setCurrentTool: (tool) => set({ currentTool: tool }),
  setCurrentColor: (color) => set({ currentColor: color }),
  
  addShape: (shapeData) => {
    const id = nanoid();
    set((state) => {
      const newShapes = [...state.shapes, { id, ...shapeData }];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newShapes);
      
      return {
        shapes: newShapes,
        history: newHistory,
        historyIndex: state.historyIndex + 1
      };
    });
    return id;
  },
  
  updateShape: (id, shapeData) => set((state) => {
    const newShapes = state.shapes.map((shape) => 
      shape.id === id ? { ...shape, ...shapeData } : shape
    );
    
    // Only add to history if it's a significant update (not just position changes during drawing)
    const significantUpdate = !state.isDrawing || 
      ('width' in shapeData && typeof shapeData.width === 'number' && shapeData.width > 5) ||
      ('height' in shapeData && typeof shapeData.height === 'number' && shapeData.height > 5);
    
    if (significantUpdate) {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newShapes);
      
      return {
        shapes: newShapes,
        history: newHistory,
        historyIndex: state.historyIndex + 1
      };
    }
    
    return { shapes: newShapes };
  }),
  
  deleteShape: (id) => set((state) => {
    const newShapes = state.shapes.filter((shape) => shape.id !== id);
    const newSelectedIds = state.selectedIds.filter((selectedId) => selectedId !== id);
    
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newShapes);
    
    return {
      shapes: newShapes,
      selectedIds: newSelectedIds,
      history: newHistory,
      historyIndex: state.historyIndex + 1
    };
  }),
  
  selectShape: (id, isMultiSelect = false) => set((state) => ({
    selectedIds: isMultiSelect 
      ? state.selectedIds.includes(id)
        ? state.selectedIds.filter((selectedId) => selectedId !== id)
        : [...state.selectedIds, id]
      : [id]
  })),
  
  clearSelection: () => set({ selectedIds: [] }),
  
  setIsDrawing: (isDrawing) => set({ isDrawing }),
  
  setCanvasPosition: (position) => set({ canvasPosition: position }),
  
  setScale: (scale) => set({ scale }),
  
  duplicateSelectedShapes: () => set((state) => {
    if (state.selectedIds.length === 0) return state;
    
    const selectedShapes = state.shapes.filter(shape => 
      state.selectedIds.includes(shape.id)
    );
    
    const duplicatedShapes = selectedShapes.map(shape => {
      const id = nanoid();
      return {
        ...shape,
        id,
        x: shape.x + 20, // Offset slightly to make it visible
        y: shape.y + 20
      };
    });
    
    const newShapes = [...state.shapes, ...duplicatedShapes];
    const newSelectedIds = duplicatedShapes.map(shape => shape.id);
    
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newShapes);
    
    return {
      shapes: newShapes,
      selectedIds: newSelectedIds,
      history: newHistory,
      historyIndex: state.historyIndex + 1
    };
  }),
  
  undoLastAction: () => set((state) => {
    if (state.historyIndex <= 0) return state;
    
    const newHistoryIndex = state.historyIndex - 1;
    const previousShapes = state.history[newHistoryIndex];
    
    return {
      shapes: previousShapes,
      historyIndex: newHistoryIndex,
      // Clear selection on undo to prevent trying to select deleted shapes
      selectedIds: []
    };
  })
})); 