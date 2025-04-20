'use client';

import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../../utils/supabase';

interface Position {
  x: number;
  y: number;
}

interface DrawLine {
  points: Position[];
  color: string;
  width: number;
}

interface WhiteboardState {
  lines: DrawLine[];
  currentLine?: DrawLine;
}

interface CustomWhiteboardProps {
  userId?: string;
}

const CustomWhiteboard: React.FC<CustomWhiteboardProps> = ({ userId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [whiteboardState, setWhiteboardState] = useState<WhiteboardState>({ lines: [] });
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize on client-side only
  useEffect(() => {
    setIsClient(true);
    
    const loadData = async () => {
      // Try to load from localStorage first
      const savedState = localStorage.getItem('custom-whiteboard-state');
      let loadedData = false;
      
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          setWhiteboardState(parsedState);
          loadedData = true;
        } catch (e) {
          console.error('Failed to parse saved whiteboard state:', e);
        }
      }
      
      // Try Supabase only if localStorage failed and userId exists
      if (!loadedData && userId) {
        try {
          const { data, error } = await supabase
            .from('whiteboard_data')
            .select('*')
            .eq('user_id', userId)
            .single();
            
          if (data && !error && data.data) {
            setWhiteboardState(data.data);
          }
        } catch (error) {
          console.error('Error loading whiteboard data from Supabase:', error);
        }
      }
    };

    loadData();
    
    // Set up resize observer
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setCanvasSize({ width, height });
      }
    };
    
    updateCanvasSize();
    
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      resizeObserver.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [userId]);
  
  // Save data with debounce
  const saveData = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(async () => {
      try {
        // Always save to localStorage
        localStorage.setItem('custom-whiteboard-state', JSON.stringify(whiteboardState));
        
        // Save to Supabase if userId available
        if (userId) {
          await supabase
            .from('whiteboard_data')
            .upsert({
              id: userId,
              user_id: userId,
              data: whiteboardState,
              updated_at: new Date().toISOString()
            });
        }
      } catch (err) {
        console.error('Failed to save whiteboard data:', err);
      }
    }, 1000);
  };
  
  // Redraw canvas when state changes
  useEffect(() => {
    if (!canvasRef.current || canvasSize.width === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas size to match container
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    
    // Draw existing lines
    whiteboardState.lines.forEach(line => {
      if (line.points.length < 2) return;
      
      ctx.beginPath();
      ctx.moveTo(line.points[0].x, line.points[0].y);
      
      for (let i = 1; i < line.points.length; i++) {
        ctx.lineTo(line.points[i].x, line.points[i].y);
      }
      
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    });
    
    // Draw current line if it exists
    if (whiteboardState.currentLine && whiteboardState.currentLine.points.length > 0) {
      const { currentLine } = whiteboardState;
      ctx.beginPath();
      ctx.moveTo(currentLine.points[0].x, currentLine.points[0].y);
      
      for (let i = 1; i < currentLine.points.length; i++) {
        ctx.lineTo(currentLine.points[i].x, currentLine.points[i].y);
      }
      
      ctx.strokeStyle = currentLine.color;
      ctx.lineWidth = currentLine.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
  }, [whiteboardState, canvasSize]);
  
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    let position: Position;
    
    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0];
      const canvas = canvasRef.current as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();
      position = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      // Mouse event
      const canvas = canvasRef.current as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();
      position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
    
    setIsDrawing(true);
    
    const actualColor = isEraser ? '#ffffff' : color;
    const actualWidth = isEraser ? 20 : strokeWidth;
    
    setWhiteboardState(prev => ({
      ...prev,
      currentLine: {
        points: [position],
        color: actualColor,
        width: actualWidth
      }
    }));
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !whiteboardState.currentLine) return;
    
    let position: Position;
    
    if ('touches' in e) {
      // Touch event
      e.preventDefault(); // Prevent scrolling on touch devices
      const touch = e.touches[0];
      const canvas = canvasRef.current as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();
      position = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      // Mouse event
      const canvas = canvasRef.current as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();
      position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
    
    setWhiteboardState(prev => ({
      ...prev,
      currentLine: {
        ...prev.currentLine!,
        points: [...prev.currentLine!.points, position]
      }
    }));
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
    
    if (whiteboardState.currentLine) {
      setWhiteboardState(prev => ({
        lines: [...prev.lines, prev.currentLine!],
        currentLine: undefined
      }));
      
      // Save data when a line is completed
      saveData();
    }
  };
  
  const clearCanvas = () => {
    if (window.confirm('Are you sure you want to clear the whiteboard?')) {
      setWhiteboardState({ lines: [] });
      saveData();
    }
  };
  
  const undoLastLine = () => {
    setWhiteboardState(prev => ({
      ...prev,
      lines: prev.lines.slice(0, -1)
    }));
    saveData();
  };
  
  const toggleEraser = () => {
    setIsEraser(!isEraser);
  };
  
  // Don't render anything on server
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin h-10 w-10 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  return (
    <div className="h-full w-full flex flex-col" ref={containerRef}>
      <div className="p-2 bg-gray-100 dark:bg-gray-800 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="color-picker" className="sr-only">Color</label>
            <input
              id="color-picker"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 border-0 p-0 cursor-pointer rounded"
              disabled={isEraser}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <label htmlFor="stroke-width" className="sr-only">Stroke Width</label>
            <input
              id="stroke-width"
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
              className="w-24"
              disabled={isEraser}
            />
          </div>
          
          <button
            onClick={toggleEraser}
            className={`px-3 py-1 text-sm rounded ${
              isEraser
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {isEraser ? 'Drawing' : 'Eraser'}
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={undoLastLine}
            disabled={whiteboardState.lines.length === 0}
            className={`px-3 py-1 text-sm rounded ${
              whiteboardState.lines.length === 0
                ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Undo
          </button>
          
          <button
            onClick={clearCanvas}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            Clear
          </button>
        </div>
      </div>
      
      <div className="flex-grow relative">
        <canvas
          ref={canvasRef}
          className={`absolute top-0 left-0 touch-none ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
    </div>
  );
};

export default CustomWhiteboard; 