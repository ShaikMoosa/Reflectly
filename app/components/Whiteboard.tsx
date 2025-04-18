'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { 
  Square, Circle, Type, Pencil, ArrowRight,
  Download, Trash2, Undo, Redo
} from 'lucide-react';
import './Whiteboard.css';

// Element types
type ElementType = 'rectangle' | 'circle' | 'text' | 'arrow' | 'pencil';

// Element interface
interface WhiteboardElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  content?: string;
}

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  
  const [elements, setElements] = useState<WhiteboardElement[]>([]);
  const [selectedTool, setSelectedTool] = useState<ElementType>('rectangle');
  const [selectedColor, setSelectedColor] = useState('#FFC0CB');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{x: number, y: number} | null>(null);
  const [history, setHistory] = useState<WhiteboardElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const pastelColors = [
    '#CDF0EA', // Teal
    '#F9F9F4', // Cream
    '#F9CEEE', // Pink
    '#F2D7EE', // Light Purple
    '#D6F6DD', // Mint
    '#FAF0D7', // Light Yellow
    '#FFCFD2', // Blush
    '#E8DEF8'  // Lavender
  ];
  
  // Generate unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };
  
  // Get mouse position relative to canvas
  const getMousePosition = (e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  // Redraw all elements
  const redrawCanvas = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = theme === 'dark' ? '#1F1F1F' : '#F5F5F5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw dots pattern
    ctx.fillStyle = theme === 'dark' ? '#333333' : '#E0E0E0';
    const spacing = 20;
    
    for (let x = spacing; x < canvas.width; x += spacing) {
      for (let y = spacing; y < canvas.height; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Draw all elements
    elements.forEach(element => {
      ctx.save();
      
      switch (element.type) {
        case 'rectangle':
          ctx.fillStyle = element.color;
          ctx.fillRect(element.x, element.y, element.width, element.height);
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.lineWidth = 1;
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          break;
          
        case 'circle':
          ctx.beginPath();
          ctx.fillStyle = element.color;
          ctx.ellipse(
            element.x + element.width/2, 
            element.y + element.height/2, 
            element.width/2, 
            element.height/2, 
            0, 0, Math.PI * 2
          );
          ctx.fill();
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.lineWidth = 1;
          ctx.stroke();
          break;
          
        case 'text':
          ctx.fillStyle = '#333333';
          ctx.font = '16px sans-serif';
          if (element.content) {
            ctx.fillText(element.content, element.x, element.y + 16);
          }
          break;
          
        case 'arrow':
          // Draw a simple arrow
          ctx.beginPath();
          ctx.moveTo(element.x, element.y);
          ctx.lineTo(element.x + element.width, element.y + element.height);
          ctx.strokeStyle = '#333333';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Draw the arrowhead
          const angle = Math.atan2(element.height, element.width);
          const arrowSize = 10;
          
          ctx.beginPath();
          ctx.moveTo(element.x + element.width, element.y + element.height);
          ctx.lineTo(
            element.x + element.width - arrowSize * Math.cos(angle - Math.PI/7),
            element.y + element.height - arrowSize * Math.sin(angle - Math.PI/7)
          );
          ctx.lineTo(
            element.x + element.width - arrowSize * Math.cos(angle + Math.PI/7),
            element.y + element.height - arrowSize * Math.sin(angle + Math.PI/7)
          );
          ctx.closePath();
          ctx.fillStyle = '#333333';
          ctx.fill();
          break;
          
        case 'pencil':
          // For pencil, we'd need to store points, but we'll draw a simple line for now
          ctx.beginPath();
          ctx.moveTo(element.x, element.y);
          ctx.lineTo(element.x + element.width, element.y + element.height);
          ctx.strokeStyle = element.color;
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.stroke();
          break;
      }
      
      ctx.restore();
    });
  };
  
  // Update redraw when elements or theme changes
  useEffect(() => {
    redrawCanvas();
  }, [elements, theme]);
  
  // Setup canvas size
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Redraw everything
    redrawCanvas();
    
    // Window resize handler
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      
      const canvas = canvasRef.current;
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Redraw everything
      redrawCanvas();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent) => {
    const point = getMousePosition(e);
    setStartPoint(point);
    setIsDrawing(true);
  };
  
  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !startPoint) return;
    
    const currentPoint = getMousePosition(e);
    
    // For previewing the shape being drawn
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Clear and redraw
    redrawCanvas();
    
    // Draw preview shape
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.save();
    
    const width = currentPoint.x - startPoint.x;
    const height = currentPoint.y - startPoint.y;
    
    switch (selectedTool) {
      case 'rectangle':
        ctx.fillStyle = selectedColor;
        ctx.fillRect(
          width >= 0 ? startPoint.x : currentPoint.x,
          height >= 0 ? startPoint.y : currentPoint.y,
          Math.abs(width),
          Math.abs(height)
        );
        break;
        
      case 'circle':
        ctx.beginPath();
        ctx.fillStyle = selectedColor;
        ctx.ellipse(
          startPoint.x + width/2,
          startPoint.y + height/2,
          Math.abs(width/2),
          Math.abs(height/2),
          0, 0, Math.PI * 2
        );
        ctx.fill();
        break;
        
      case 'arrow':
        // Draw a simple arrow
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        ctx.stroke();
        break;
        
      case 'pencil':
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        ctx.strokeStyle = selectedColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();
        break;
    }
    
    ctx.restore();
  };
  
  // Handle mouse up
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDrawing || !startPoint) return;
    
    const currentPoint = getMousePosition(e);
    const width = currentPoint.x - startPoint.x;
    const height = currentPoint.y - startPoint.y;
    
    // Create element only if it has some size
    if (Math.abs(width) > 5 || Math.abs(height) > 5) {
      const newElement: WhiteboardElement = {
        id: generateId(),
        type: selectedTool,
        x: width >= 0 ? startPoint.x : currentPoint.x,
        y: height >= 0 ? startPoint.y : currentPoint.y,
        width: Math.abs(width),
        height: Math.abs(height),
        color: selectedColor,
        content: selectedTool === 'text' ? 'Double click to edit' : undefined
      };
      
      const newElements = [...elements, newElement];
      setElements(newElements);
      
      // Add to history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newElements);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
    
    setIsDrawing(false);
    setStartPoint(null);
  };
  
  // Placeholder for text input
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (selectedTool === 'text') {
      const point = getMousePosition(e);
      const text = prompt('Enter text:');
      
      if (text) {
        const newElement: WhiteboardElement = {
          id: generateId(),
          type: 'text',
          x: point.x,
          y: point.y,
          width: 100,
          height: 20,
          color: selectedColor,
          content: text
        };
        
        setElements([...elements, newElement]);
      }
    }
  };

  // Undo last action
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  };
  
  // Clear canvas
  const handleClear = () => {
    if (confirm('Are you sure you want to clear the canvas?')) {
      setElements([]);
      const newHistory = [...history, []];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };
  
  // Handle tool selection
  const handleToolSelect = (tool: ElementType) => {
    setSelectedTool(tool);
  };
  
  return (
    <div ref={containerRef} className="whiteboard-container h-full w-full relative">
      {/* Top toolbar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 flex items-center justify-center space-x-2 z-10">
        <div className="flex space-x-2 border-r pr-2 dark:border-gray-600">
          <button
            className={`p-2 rounded ${selectedTool === 'rectangle' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => handleToolSelect('rectangle')}
            title="Rectangle"
          >
            <Square size={20} />
          </button>
          <button
            className={`p-2 rounded ${selectedTool === 'circle' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => handleToolSelect('circle')}
            title="Circle"
          >
            <Circle size={20} />
          </button>
          <button
            className={`p-2 rounded ${selectedTool === 'text' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => handleToolSelect('text')}
            title="Text"
          >
            <Type size={20} />
          </button>
          <button
            className={`p-2 rounded ${selectedTool === 'arrow' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => handleToolSelect('arrow')}
            title="Arrow"
          >
            <ArrowRight size={20} />
          </button>
          <button
            className={`p-2 rounded ${selectedTool === 'pencil' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => handleToolSelect('pencil')}
            title="Pencil"
          >
            <Pencil size={20} />
          </button>
        </div>
        
        <div className="flex space-x-2 border-r pr-2 dark:border-gray-600">
          {pastelColors.map(color => (
            <button
              key={color}
              className={`w-6 h-6 rounded-full ${selectedColor === color ? 'ring-2 ring-blue-500' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
              title={color}
            />
          ))}
        </div>
        
        <div className="flex space-x-2">
          <button
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={handleUndo}
            title="Undo"
            disabled={historyIndex <= 0}
          >
            <Undo size={20} className={historyIndex <= 0 ? "opacity-50" : ""} />
          </button>
          <button
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={handleClear}
            title="Clear Canvas"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
      
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="touch-none h-full w-full cursor-crosshair"
        onClick={selectedTool === 'text' ? handleCanvasClick : undefined}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
} 