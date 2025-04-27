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
}

export const useWhiteboardStore = create<WhiteboardState>((set) => ({
  shapes: [],
  selectedIds: [],
  currentTool: 'select',
  currentColor: '#000000',
  isDrawing: false,
  canvasPosition: { x: 0, y: 0 },
  scale: 1,
  
  setCurrentTool: (tool) => set({ currentTool: tool }),
  setCurrentColor: (color) => set({ currentColor: color }),
  
  addShape: (shapeData) => {
    const id = nanoid();
    set((state) => ({
      shapes: [...state.shapes, { id, ...shapeData }]
    }));
    return id;
  },
  
  updateShape: (id, shapeData) => set((state) => ({
    shapes: state.shapes.map((shape) => 
      shape.id === id ? { ...shape, ...shapeData } : shape
    )
  })),
  
  deleteShape: (id) => set((state) => ({
    shapes: state.shapes.filter((shape) => shape.id !== id),
    selectedIds: state.selectedIds.filter((selectedId) => selectedId !== id)
  })),
  
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
})); 