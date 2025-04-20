import { create } from 'zustand';
import { v4 as uuid } from 'uuid';

export type Shape = {
  id: string;
  type: 'rect' | 'circle';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  fill: string;
};

interface BoardState {
  shapes: Shape[];
  selectedId: string | null;
  tool: 'rect' | 'circle' | 'select' | 'pan';
  viewportTransform: {
    x: number;
    y: number;
    scale: number;
  };
  addShape: (shape: Omit<Shape, 'id'>) => void;
  updateShape: (id: string, props: Partial<Shape>) => void;
  deleteShape: (id: string) => void;
  selectShape: (id: string | null) => void;
  setTool: (tool: 'rect' | 'circle' | 'select' | 'pan') => void;
  updateViewport: (transform: { x?: number; y?: number; scale?: number }) => void;
  loadShapes: (shapes: Shape[]) => void;
  clearShapes: () => void;
}

// Function to save state to localStorage with debounce
let saveTimeout: NodeJS.Timeout | null = null;
const saveStateToStorage = (shapes: Shape[]) => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      localStorage.setItem('whiteboard-shapes', JSON.stringify(shapes));
    } catch (err) {
      console.error('Failed to save whiteboard state:', err);
    }
  }, 500);
};

export const useBoardStore = create<BoardState>((set) => ({
  shapes: [],
  selectedId: null,
  tool: 'select',
  viewportTransform: {
    x: 0,
    y: 0,
    scale: 1
  },

  addShape: (shape) =>
    set((state) => {
      const shapes = [...state.shapes, { ...shape, id: uuid() }];
      saveStateToStorage(shapes);
      return { shapes };
    }),

  updateShape: (id, props) =>
    set((state) => {
      const shapes = state.shapes.map((sh) => (sh.id === id ? { ...sh, ...props } : sh));
      saveStateToStorage(shapes);
      return { shapes };
    }),

  deleteShape: (id) =>
    set((state) => {
      const shapes = state.shapes.filter((sh) => sh.id !== id);
      saveStateToStorage(shapes);
      return {
        shapes,
        selectedId: state.selectedId === id ? null : state.selectedId
      };
    }),

  selectShape: (id) => set({ selectedId: id }),

  setTool: (tool) => set({ tool }),

  updateViewport: (transform) =>
    set((state) => ({
      viewportTransform: {
        ...state.viewportTransform,
        ...transform
      }
    })),

  loadShapes: (shapes) => set({ shapes }),

  clearShapes: () => {
    saveStateToStorage([]);
    return set({ shapes: [], selectedId: null });
  }
})); 