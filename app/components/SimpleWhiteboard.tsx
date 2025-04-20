'use client';

import React, { useRef, useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';

type Shape = {
  id: string;
  type: 'rect' | 'circle';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  fill: string;
  selected?: boolean;
};

interface SimpleWhiteboardProps {
  userId?: string;
}

const SimpleWhiteboard: React.FC<SimpleWhiteboardProps> = ({ userId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [tool, setTool] = useState<'select' | 'rect' | 'circle' | 'pan'>('select');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isClient, setIsClient] = useState(false);

  // Generate a random ID for shapes
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Generate a random color
  const getRandomColor = () => {
    const colors = [
      '#e74c3c', // Red
      '#3498db', // Blue
      '#2ecc71', // Green
      '#f1c40f', // Yellow
      '#9b59b6', // Purple
      '#1abc9c', // Teal
      '#e67e22', // Orange
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Initialize and load data from localStorage or Supabase
  useEffect(() => {
    setIsClient(true);
    
    const loadData = async () => {
      try {
        // Try localStorage first
        const savedShapes = localStorage.getItem('whiteboard-shapes');
        let loaded = false;
        
        if (savedShapes) {
          try {
            const parsed = JSON.parse(savedShapes);
            if (Array.isArray(parsed)) {
              setShapes(parsed);
              loaded = true;
            }
          } catch (e) {
            console.error('Failed to parse saved shapes:', e);
          }
        }
        
        // Try Supabase if localStorage failed and userId exists
        if (!loaded && userId) {
          const { data, error } = await supabase
            .from('whiteboard_data')
            .select('*')
            .eq('user_id', userId)
            .single();
            
          if (data && !error && data.data && data.data.shapes) {
            setShapes(data.data.shapes);
          }
        }
      } catch (error) {
        console.error('Error loading whiteboard data:', error);
      }
    };
    
    loadData();
    
    // Set up keyboard event listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedId) {
        setShapes(prevShapes => prevShapes.filter(shape => shape.id !== selectedId));
        setSelectedId(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userId]);

  // Save data when shapes change
  useEffect(() => {
    if (!isClient || shapes.length === 0) return;
    
    // Save to localStorage
    localStorage.setItem('whiteboard-shapes', JSON.stringify(shapes));
    
    // Save to Supabase with debounce
    const saveTimeout = setTimeout(async () => {
      if (!userId) return;
      
      try {
        await supabase
          .from('whiteboard_data')
          .upsert({
            id: userId,
            user_id: userId,
            data: { shapes },
            updated_at: new Date().toISOString()
          });
      } catch (err) {
        console.error('Failed to save whiteboard data to Supabase:', err);
      }
    }, 1000);
    
    return () => clearTimeout(saveTimeout);
  }, [shapes, userId, isClient]);

  // Draw shapes on canvas
  useEffect(() => {
    if (!canvasRef.current || !isClient) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match container
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply transformations
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);
    
    // Draw all shapes
    shapes.forEach(shape => {
      ctx.beginPath();
      
      if (shape.type === 'rect' && shape.width && shape.height) {
        ctx.rect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === 'circle' && shape.radius) {
        ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
      }
      
      ctx.fillStyle = shape.fill;
      ctx.fill();
      
      // Draw selection outline
      if (shape.id === selectedId) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
    
    // Restore context
    ctx.restore();
  }, [shapes, selectedId, offset, scale, isClient]);

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = (x: number, y: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Adjust for canvas position and scaling
    const canvasX = (x - rect.left - offset.x) / scale;
    const canvasY = (y - rect.top - offset.y) / scale;
    
    return { x: canvasX, y: canvasY };
  };

  // Find shape at given coordinates
  const getShapeAt = (x: number, y: number) => {
    // Check shapes in reverse order (top to bottom)
    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i];
      
      if (shape.type === 'rect' && shape.width && shape.height) {
        if (
          x >= shape.x && 
          x <= shape.x + shape.width && 
          y >= shape.y && 
          y <= shape.y + shape.height
        ) {
          return shape;
        }
      } else if (shape.type === 'circle' && shape.radius) {
        const distance = Math.sqrt(
          Math.pow(x - shape.x, 2) + Math.pow(y - shape.y, 2)
        );
        if (distance <= shape.radius) {
          return shape;
        }
      }
    }
    
    return null;
  };

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = screenToCanvas(e.clientX, e.clientY);
    setStartPoint({ x, y });
    
    if (tool === 'pan') {
      setIsPanning(true);
      return;
    }
    
    if (tool === 'select') {
      const shape = getShapeAt(x, y);
      
      if (shape) {
        setSelectedId(shape.id);
        setIsDragging(true);
      } else {
        setSelectedId(null);
      }
    } else if (tool === 'rect') {
      const newShape: Shape = {
        id: generateId(),
        type: 'rect',
        x,
        y,
        width: 0,
        height: 0,
        fill: getRandomColor()
      };
      
      setShapes([...shapes, newShape]);
      setSelectedId(newShape.id);
      setIsDragging(true);
    } else if (tool === 'circle') {
      const newShape: Shape = {
        id: generateId(),
        type: 'circle',
        x,
        y,
        radius: 0,
        fill: getRandomColor()
      };
      
      setShapes([...shapes, newShape]);
      setSelectedId(newShape.id);
      setIsDragging(true);
    }
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = screenToCanvas(e.clientX, e.clientY);
    
    if (isPanning) {
      setOffset({
        x: offset.x + (e.clientX - startPoint.x * scale - offset.x),
        y: offset.y + (e.clientY - startPoint.y * scale - offset.y)
      });
      return;
    }
    
    if (!isDragging || selectedId === null) return;
    
    setShapes(shapes.map(shape => {
      if (shape.id !== selectedId) return shape;
      
      if (tool === 'select') {
        // Move the shape
        return {
          ...shape,
          x: x - (startPoint.x - shape.x),
          y: y - (startPoint.y - shape.y)
        };
      } else if (tool === 'rect' && shape.type === 'rect') {
        // Resize the rectangle
        return {
          ...shape,
          width: Math.abs(x - shape.x),
          height: Math.abs(y - shape.y),
          x: x < shape.x ? x : shape.x,
          y: y < shape.y ? y : shape.y
        };
      } else if (tool === 'circle' && shape.type === 'circle') {
        // Resize the circle
        const distance = Math.sqrt(
          Math.pow(x - shape.x, 2) + Math.pow(y - shape.y, 2)
        );
        
        return {
          ...shape,
          radius: distance
        };
      }
      
      return shape;
    }));
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsPanning(false);
    
    if (tool === 'rect' || tool === 'circle') {
      // Switch back to select tool after creating a shape
      setTool('select');
    }
  };

  // Handle mouse wheel for zooming
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    // Only zoom in pan mode
    if (tool !== 'pan') return;
    
    const { x, y } = screenToCanvas(e.clientX, e.clientY);
    const delta = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = scale * delta;
    
    // Limit zoom range
    if (newScale < 0.1 || newScale > 10) return;
    
    // Adjust offset to zoom towards cursor position
    setScale(newScale);
    setOffset({
      x: e.clientX - x * newScale,
      y: e.clientY - y * newScale
    });
  };

  // Add a new shape
  const addShape = (type: 'rect' | 'circle') => {
    if (!isClient || !containerRef.current) return;
    
    const { width, height } = containerRef.current.getBoundingClientRect();
    const centerX = width / 2;
    const centerY = height / 2;
    
    if (type === 'rect') {
      const newShape: Shape = {
        id: generateId(),
        type: 'rect',
        x: (centerX - 50 - offset.x) / scale,
        y: (centerY - 35 - offset.y) / scale,
        width: 100 / scale,
        height: 70 / scale,
        fill: getRandomColor()
      };
      
      setShapes([...shapes, newShape]);
    } else if (type === 'circle') {
      const newShape: Shape = {
        id: generateId(),
        type: 'circle',
        x: (centerX - offset.x) / scale,
        y: (centerY - offset.y) / scale,
        radius: 40 / scale,
        fill: getRandomColor()
      };
      
      setShapes([...shapes, newShape]);
    }
  };

  // Delete selected shape
  const deleteSelectedShape = () => {
    if (selectedId) {
      setShapes(shapes.filter(shape => shape.id !== selectedId));
      setSelectedId(null);
    }
  };

  // Clear all shapes
  const clearCanvas = () => {
    if (window.confirm('Are you sure you want to clear the whiteboard?')) {
      setShapes([]);
      setSelectedId(null);
    }
  };

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin h-10 w-10 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full" ref={containerRef}>
      {/* Toolbar */}
      <div className="absolute top-4 left-4 flex flex-col space-y-2 bg-white dark:bg-gray-800 p-3 rounded shadow z-10">
        <div className="flex flex-col space-y-1">
          <button
            className={`px-4 py-2 rounded text-sm ${
              tool === 'select' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            onClick={() => setTool('select')}
          >
            Select
          </button>
          <button
            className={`px-4 py-2 rounded text-sm ${
              tool === 'pan' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            onClick={() => setTool('pan')}
          >
            Pan & Zoom
          </button>
          <button
            className={`px-4 py-2 rounded text-sm ${
              tool === 'rect' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            onClick={() => setTool('rect')}
          >
            Rectangle
          </button>
          <button
            className={`px-4 py-2 rounded text-sm ${
              tool === 'circle' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            onClick={() => setTool('circle')}
          >
            Circle
          </button>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
          {(tool === 'rect' || tool === 'circle') && (
            <button
              className="w-full px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600"
              onClick={() => addShape(tool)}
            >
              Add {tool === 'rect' ? 'Rectangle' : 'Circle'}
            </button>
          )}
          
          {tool === 'select' && (
            <button
              className={`w-full px-4 py-2 rounded text-sm ${
                selectedId 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={deleteSelectedShape}
              disabled={!selectedId}
            >
              Delete Selected
            </button>
          )}
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
          <button
            className="w-full px-4 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            onClick={clearCanvas}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-white dark:bg-gray-900 touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      
      {/* Instructions overlay */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 p-3 rounded shadow-md text-xs opacity-80 hover:opacity-100 transition-opacity">
        <h3 className="font-bold mb-1">Keyboard Shortcuts:</h3>
        <ul className="space-y-1">
          <li>Delete - Remove selected shape</li>
          <li>Pan Mode + Mouse Wheel - Zoom in/out</li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleWhiteboard; 