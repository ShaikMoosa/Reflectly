'use client';

import { 
  Square, 
  Circle, 
  Pen, 
  Type, 
  StickyNote, 
  Pointer, 
  Trash2,
  Palette
} from 'lucide-react';
import { ShapeType, useWhiteboardStore } from '../store/useWhiteboardStore';
// We'll create an inline color picker to avoid circular dependencies
// import ColorPicker from './ColorPicker';

const tools = [
  { 
    name: 'select', 
    icon: Pointer, 
    label: 'Select'
  },
  { 
    name: 'rectangle', 
    icon: Square, 
    label: 'Rectangle'
  },
  { 
    name: 'ellipse', 
    icon: Circle, 
    label: 'Circle'
  },
  { 
    name: 'path', 
    icon: Pen, 
    label: 'Draw'
  },
  { 
    name: 'text', 
    icon: Type, 
    label: 'Text'
  },
  { 
    name: 'note', 
    icon: StickyNote, 
    label: 'Note'
  }
];

// Simple inline color picker to avoid circular imports
function SimpleColorPicker() {
  const { currentColor, setCurrentColor } = useWhiteboardStore();
  
  const colors = [
    '#000000', // Black
    '#ffffff', // White
    '#ff0000', // Red
    '#00ff00', // Green
    '#0000ff', // Blue
    '#ffff00', // Yellow
    '#ff00ff', // Magenta
  ];
  
  return (
    <div className="flex items-center gap-1 mx-2">
      <Palette size={18} className="text-gray-700 dark:text-gray-200 mr-1" />
      {colors.map(color => (
        <button
          key={color}
          className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600 cursor-pointer hover:scale-110 transition-transform"
          style={{ 
            backgroundColor: color,
            boxShadow: currentColor === color ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none'
          }}
          onClick={() => setCurrentColor(color)}
          title={color}
        />
      ))}
    </div>
  );
}

export default function Toolbar() {
  const { 
    currentTool, 
    setCurrentTool,
    selectedIds,
    deleteShape
  } = useWhiteboardStore();

  const handleToolClick = (tool: ShapeType | 'select') => {
    setCurrentTool(tool);
  };

  const handleDelete = () => {
    selectedIds.forEach(id => deleteShape(id));
  };

  const isDeleteActive = selectedIds.length > 0;

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center">
      <div className="flex items-center">
        {tools.map(tool => (
          <button
            key={tool.name}
            className={`p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg m-1 transition-colors ${
              currentTool === tool.name ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
            onClick={() => handleToolClick(tool.name as ShapeType | 'select')}
            title={tool.label}
          >
            <tool.icon size={20} className="text-gray-700 dark:text-gray-200" />
          </button>
        ))}
        
        <div className="h-8 mx-2 w-px bg-gray-300 dark:bg-gray-600" />
        
        <SimpleColorPicker />
        
        <div className="h-8 mx-2 w-px bg-gray-300 dark:bg-gray-600" />
        
        <button
          className={`p-3 rounded-lg m-1 transition-colors ${
            isDeleteActive 
              ? 'hover:bg-red-100 dark:hover:bg-red-900 text-red-500 dark:text-red-400' 
              : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
          }`}
          onClick={handleDelete}
          disabled={!isDeleteActive}
          title="Delete"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}

// Add a named export as well to ensure it can be imported properly
export { Toolbar }; 