'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Square, Circle, Type, Pencil, Trash2, StickyNote, ArrowRight, Move, Download, Upload } from 'lucide-react';
import './Whiteboard.css';

// Element types
type ElementType = 'rectangle' | 'circle' | 'text' | 'sticky' | 'arrow' | 'freehand';

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
  points?: {x: number, y: number}[];
  rotation?: number;
  zIndex: number;
}

export default function Whiteboard() {
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Theme
  const { resolvedTheme } = useTheme();
  
  // State
  const [elements, setElements] = useState<WhiteboardElement[]>([]);
  const [selectedTool, setSelectedTool] = useState<ElementType | 'select'>('select');
  const [selectedColor, setSelectedColor] = useState('#4A9FFF');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{x: number, y: number} | null>(null);
  const [currentText, setCurrentText] = useState('');
  const [textInputPosition, setTextInputPosition] = useState<{x: number, y: number} | null>(null);
  const [nextZIndex, setNextZIndex] = useState(1);
  
  // Draw all elements on canvas
  const redrawCanvas = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background based on theme
    ctx.fillStyle = resolvedTheme === 'dark' ? '#2D2D2D' : '#F5F5F5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Sort elements by zIndex
    const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    
    // Draw each element
    sortedElements.forEach(element => {
      const isSelected = element.id === selectedElement;
      
      ctx.save();
      
      // Draw selection indicator if element is selected
      if (isSelected) {
        ctx.strokeStyle = '#2684FF';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          element.x - 5, 
          element.y - 5, 
          element.width + 10, 
          element.height + 10
        );
        ctx.setLineDash([]);
      }
      
      switch(element.type) {
        case 'rectangle':
          ctx.fillStyle = element.color;
          ctx.fillRect(element.x, element.y, element.width, element.height);
          ctx.strokeStyle = isSelected ? '#2684FF' : 'rgba(0, 0, 0, 0.3)';
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
          ctx.strokeStyle = isSelected ? '#2684FF' : 'rgba(0, 0, 0, 0.3)';
          ctx.lineWidth = 1;
          ctx.stroke();
          break;
          
        case 'sticky':
          // Draw sticky note background with slight shadow
          ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
          ctx.shadowBlur = 5;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          
          ctx.fillStyle = element.color;
          ctx.fillRect(element.x, element.y, element.width, element.height);
          
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          
          // Draw text inside sticky
          if (element.content) {
            ctx.fillStyle = '#000000';
            ctx.font = '14px Arial';
            
            // Wrap text
            const words = element.content.split(' ');
            let line = '';
            let lineHeight = 18;
            let y = element.y + 20;
            
            words.forEach(word => {
              const testLine = line + word + ' ';
              const metrics = ctx.measureText(testLine);
              const testWidth = metrics.width;
              
              if (testWidth > element.width - 20) {
                ctx.fillText(line, element.x + 10, y);
                line = word + ' ';
                y += lineHeight;
              } else {
                line = testLine;
              }
            });
            
            ctx.fillText(line, element.x + 10, y);
          }
          break;
          
        case 'text':
          ctx.fillStyle = element.color;
          ctx.font = '16px Arial';
          if (element.content) {
            ctx.fillText(element.content, element.x, element.y + 16);
          }
          break;
          
        case 'arrow':
          if (element.points && element.points.length >= 2) {
            const start = element.points[0];
            const end = element.points[element.points.length - 1];
            
            // Draw the line
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.strokeStyle = element.color;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw the arrowhead
            const angle = Math.atan2(end.y - start.y, end.x - start.x);
            const arrowSize = 10;
            
            ctx.beginPath();
            ctx.moveTo(end.x, end.y);
            ctx.lineTo(
              end.x - arrowSize * Math.cos(angle - Math.PI/7),
              end.y - arrowSize * Math.sin(angle - Math.PI/7)
            );
            ctx.lineTo(
              end.x - arrowSize * Math.cos(angle + Math.PI/7),
              end.y - arrowSize * Math.sin(angle + Math.PI/7)
            );
            ctx.closePath();
            ctx.fillStyle = element.color;
            ctx.fill();
          }
          break;
          
        case 'freehand':
          if (element.points && element.points.length >= 2) {
            ctx.beginPath();
            ctx.moveTo(element.points[0].x, element.points[0].y);
            
            for (let i = 1; i < element.points.length; i++) {
              ctx.lineTo(element.points[i].x, element.points[i].y);
            }
            
            ctx.strokeStyle = element.color;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          break;
      }
      
      ctx.restore();
    });
  };
  
  // Handle canvas resize
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      redrawCanvas();
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [elements]);
  
  // Handle theme changes
  useEffect(() => {
    redrawCanvas();
  }, [resolvedTheme]);
  
  // Update canvas when elements change
  useEffect(() => {
    redrawCanvas();
  }, [elements, selectedElement]);
  
  // Get mouse position relative to canvas
  const getMousePosition = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Handle both mouse and touch events
    let clientX, clientY;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };
  
  // Generate unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };
  
  // Handle mouse down on canvas
  const handleMouseDown = (e: React.MouseEvent) => {
    const point = getMousePosition(e);
    setStartPoint(point);
    
    if (selectedTool === 'select') {
      // Check if we clicked on an element
      const clickedElement = findElementAtPosition(point);
      setSelectedElement(clickedElement ? clickedElement.id : null);
      
      if (clickedElement) {
        // Move element to top if clicked
        setElements(prevElements => 
          prevElements.map(el => 
            el.id === clickedElement.id 
              ? { ...el, zIndex: nextZIndex } 
              : el
          )
        );
        setNextZIndex(nextZIndex + 1);
        setIsDrawing(true);
      }
    } else if (selectedTool === 'text') {
      setTextInputPosition(point);
    } else {
      setIsDrawing(true);
      
      if (selectedTool === 'freehand') {
        const newElement: WhiteboardElement = {
          id: generateId(),
          type: 'freehand',
          x: point.x,
          y: point.y,
          width: 0,
          height: 0,
          color: selectedColor,
          points: [point],
          zIndex: nextZIndex
        };
        
        setElements([...elements, newElement]);
        setSelectedElement(newElement.id);
        setNextZIndex(nextZIndex + 1);
      } else if (selectedTool === 'arrow') {
        const newElement: WhiteboardElement = {
          id: generateId(),
          type: 'arrow',
          x: point.x,
          y: point.y,
          width: 0,
          height: 0,
          color: selectedColor,
          points: [point, { ...point }],
          zIndex: nextZIndex
        };
        
        setElements([...elements, newElement]);
        setSelectedElement(newElement.id);
        setNextZIndex(nextZIndex + 1);
      }
    }
  };
  
  // Handle mouse move on canvas
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !startPoint) return;
    
    const currentPoint = getMousePosition(e);
    
    if (selectedTool === 'select' && selectedElement) {
      // Move the selected element
      const dx = currentPoint.x - startPoint.x;
      const dy = currentPoint.y - startPoint.y;
      
      setElements(prevElements => 
        prevElements.map(el => 
          el.id === selectedElement 
            ? { 
                ...el, 
                x: el.x + dx, 
                y: el.y + dy,
                // For arrow and freehand, we need to move all points
                points: el.points 
                  ? el.points.map(pt => ({ 
                      x: pt.x + dx, 
                      y: pt.y + dy 
                    })) 
                  : undefined
              } 
            : el
        )
      );
      
      setStartPoint(currentPoint);
    } else if (selectedTool === 'freehand' && selectedElement) {
      // Add point to freehand drawing
      setElements(prevElements => 
        prevElements.map(el => 
          el.id === selectedElement && el.points
            ? { 
                ...el, 
                points: [...el.points, currentPoint],
                // Update width and height based on bounds
                x: Math.min(el.x, currentPoint.x),
                y: Math.min(el.y, currentPoint.y),
                width: Math.max(
                  el.width, 
                  Math.abs(
                    currentPoint.x - el.points[0].x
                  )
                ),
                height: Math.max(
                  el.height, 
                  Math.abs(
                    currentPoint.y - el.points[0].y
                  )
                )
              } 
            : el
        )
      );
    } else if (selectedTool === 'arrow' && selectedElement) {
      // Update end point of arrow
      setElements(prevElements => 
        prevElements.map(el => 
          el.id === selectedElement && el.points && el.points.length > 1
            ? { 
                ...el, 
                // Update just the endpoint
                points: [
                  el.points[0], 
                  currentPoint
                ],
                // Update width and height based on bounds
                x: Math.min(el.points[0].x, currentPoint.x),
                y: Math.min(el.points[0].y, currentPoint.y),
                width: Math.abs(currentPoint.x - el.points[0].x),
                height: Math.abs(currentPoint.y - el.points[0].y)
              } 
            : el
        )
      );
    } else if (['rectangle', 'circle', 'sticky'].includes(selectedTool)) {
      // Create new shape when starting to drag
      if (elements.length === 0 || 
         !elements.some(el => !el.width && !el.height)) {
        const newElement: WhiteboardElement = {
          id: generateId(),
          type: selectedTool as ElementType,
          x: startPoint.x,
          y: startPoint.y,
          width: 0,
          height: 0,
          color: selectedColor,
          content: selectedTool === 'sticky' ? 'Double click to edit' : undefined,
          zIndex: nextZIndex
        };
        
        setElements([...elements, newElement]);
        setSelectedElement(newElement.id);
        setNextZIndex(nextZIndex + 1);
      } else {
        // Resize the element being created
        const width = currentPoint.x - startPoint.x;
        const height = currentPoint.y - startPoint.y;
        
        setElements(prevElements =>
          prevElements.map(el =>
            el.id === selectedElement
              ? {
                  ...el,
                  x: width >= 0 ? startPoint.x : currentPoint.x,
                  y: height >= 0 ? startPoint.y : currentPoint.y,
                  width: Math.abs(width),
                  height: Math.abs(height)
                }
              : el
          )
        );
      }
    }
  };
  
  // Handle mouse up on canvas
  const handleMouseUp = () => {
    setIsDrawing(false);
    
    // Remove elements with no size
    setElements(elements.filter(el => el.width > 0 || el.height > 0 || 
                               (el.points && el.points.length > 1)));
  };
  
  // Find element at position
  const findElementAtPosition = (point: {x: number, y: number}) => {
    // Search in reverse order (top to bottom visually)
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      
      // Basic bounding box check
      if (point.x >= el.x && 
          point.x <= el.x + el.width &&
          point.y >= el.y && 
          point.y <= el.y + el.height) {
        return el;
      }
    }
    
    return null;
  };
  
  // Handle text input for text tool
  const handleTextInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentText(e.target.value);
  };
  
  // Handle creation of text element
  const handleTextInputBlur = () => {
    if (currentText.trim() && textInputPosition) {
      const newElement: WhiteboardElement = {
        id: generateId(),
        type: 'text',
        x: textInputPosition.x,
        y: textInputPosition.y,
        width: 100, // Approximate width
        height: 20, // Approximate height
        color: selectedColor,
        content: currentText,
        zIndex: nextZIndex
      };
      
      setElements([...elements, newElement]);
      setNextZIndex(nextZIndex + 1);
    }
    
    setTextInputPosition(null);
    setCurrentText('');
  };
  
  // Handle double click on elements for editing
  const handleDoubleClick = (e: React.MouseEvent) => {
    const point = getMousePosition(e);
    const clickedElement = findElementAtPosition(point);
    
    if (clickedElement && clickedElement.type === 'sticky') {
      // Prompt for new content for sticky notes
      const newContent = prompt('Edit sticky note:', clickedElement.content);
      
      if (newContent !== null) {
        setElements(prevElements =>
          prevElements.map(el =>
            el.id === clickedElement.id
              ? { ...el, content: newContent }
              : el
          )
        );
      }
    } else if (clickedElement && clickedElement.type === 'text') {
      // Open text editor at position
      setTextInputPosition({
        x: clickedElement.x,
        y: clickedElement.y
      });
      setCurrentText(clickedElement.content || '');
      
      // Remove the old text element
      setElements(elements.filter(el => el.id !== clickedElement.id));
    }
  };
  
  // Delete selected element
  const handleDeleteElement = () => {
    if (selectedElement) {
      setElements(elements.filter(el => el.id !== selectedElement));
      setSelectedElement(null);
    }
  };
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete/Backspace key for deleting selected element
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
        handleDeleteElement();
      }
      
      // Escape key to deselect
      if (e.key === 'Escape') {
        setSelectedElement(null);
        setTextInputPosition(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElement]);
  
  // Export board as image
  const handleExport = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    
    link.href = image;
    link.download = 'whiteboard.png';
    link.click();
  };
  
  // Save board state
  const handleSave = () => {
    const boardData = JSON.stringify(elements);
    localStorage.setItem('whiteboardData', boardData);
    alert('Whiteboard saved!');
  };
  
  // Load board state
  const handleLoad = () => {
    const boardData = localStorage.getItem('whiteboardData');
    
    if (boardData) {
      try {
        const parsedData = JSON.parse(boardData);
        setElements(parsedData);
        // Find highest zIndex for next elements
        const highestZ = parsedData.reduce(
          (max: number, el: WhiteboardElement) => 
            Math.max(max, el.zIndex), 0
        );
        setNextZIndex(highestZ + 1);
        alert('Whiteboard loaded!');
      } catch (e) {
        alert('Failed to load whiteboard data.');
      }
    } else {
      alert('No saved whiteboard found.');
    }
  };
  
  // Clear board
  const handleClear = () => {
    if (confirm('Are you sure you want to clear the whiteboard?')) {
      setElements([]);
      setSelectedElement(null);
      setNextZIndex(1);
    }
  };
  
  return (
    <div ref={containerRef} className="whiteboard-container h-full w-full relative">
      {/* Toolbar */}
      <div className="whiteboard-toolbar absolute top-2 left-2 z-20 bg-white dark:bg-gray-800 rounded-md shadow-md p-2">
        <div className="tool-group flex flex-col gap-2">
          <button
            className={`tool-btn p-2 rounded ${selectedTool === 'select' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => setSelectedTool('select')}
            title="Select (V)"
          >
            <Move size={20} />
          </button>
          
          <button
            className={`tool-btn p-2 rounded ${selectedTool === 'rectangle' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => setSelectedTool('rectangle')}
            title="Rectangle (R)"
          >
            <Square size={20} />
          </button>
          
          <button
            className={`tool-btn p-2 rounded ${selectedTool === 'circle' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => setSelectedTool('circle')}
            title="Circle (C)"
          >
            <Circle size={20} />
          </button>
          
          <button
            className={`tool-btn p-2 rounded ${selectedTool === 'text' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => setSelectedTool('text')}
            title="Text (T)"
          >
            <Type size={20} />
          </button>
          
          <button
            className={`tool-btn p-2 rounded ${selectedTool === 'sticky' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => setSelectedTool('sticky')}
            title="Sticky Note (S)"
          >
            <StickyNote size={20} />
          </button>
          
          <button
            className={`tool-btn p-2 rounded ${selectedTool === 'arrow' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => setSelectedTool('arrow')}
            title="Arrow (A)"
          >
            <ArrowRight size={20} />
          </button>
          
          <button
            className={`tool-btn p-2 rounded ${selectedTool === 'freehand' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => setSelectedTool('freehand')}
            title="Draw (D)"
          >
            <Pencil size={20} />
          </button>
          
          <div className="border-t my-1 border-gray-200 dark:border-gray-700"></div>
          
          <button
            className="tool-btn p-2 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
            onClick={handleDeleteElement}
            disabled={!selectedElement}
            title="Delete selected (Del)"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
      
      {/* Color selector */}
      <div className="color-toolbar absolute top-2 left-16 z-20 bg-white dark:bg-gray-800 rounded-md shadow-md p-2 flex flex-col gap-2">
        {['#4A9FFF', '#F24822', '#37B76C', '#FFC043', '#9747FF', '#000000'].map(color => (
          <div 
            key={color}
            className={`w-6 h-6 rounded-full cursor-pointer border-2 ${selectedColor === color ? 'border-blue-500 dark:border-blue-400' : 'border-transparent'}`}
            style={{ backgroundColor: color }}
            onClick={() => setSelectedColor(color)}
          />
        ))}
      </div>
      
      {/* File operations */}
      <div className="file-toolbar absolute top-2 right-2 z-20 bg-white dark:bg-gray-800 rounded-md shadow-md p-2">
        <div className="tool-group flex gap-2">
          <button
            className="tool-btn p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={handleSave}
            title="Save"
          >
            <Download size={20} />
          </button>
          
          <button
            className="tool-btn p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={handleLoad}
            title="Load"
          >
            <Upload size={20} />
          </button>
          
          <button
            className="tool-btn p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={handleExport}
            title="Export as PNG"
          >
            <Download size={20} />
          </button>
          
          <button
            className="tool-btn p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
            onClick={handleClear}
            title="Clear board"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
      
      {/* Text input for text tool */}
      {textInputPosition && (
        <textarea
          className="absolute z-30 bg-transparent border-none outline-none resize-none"
          style={{
            left: `${textInputPosition.x}px`,
            top: `${textInputPosition.y - 16}px`,
            color: selectedColor,
            font: '16px Arial'
          }}
          value={currentText}
          onChange={handleTextInput}
          onBlur={handleTextInputBlur}
          autoFocus
          placeholder="Type here..."
        />
      )}
      
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="touch-none cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      />
    </div>
  );
} 