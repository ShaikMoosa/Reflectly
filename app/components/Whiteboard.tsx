'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import './Whiteboard.css';

interface Point {
  x: number;
  y: number;
}

interface Line {
  points: Point[];
  color: string;
  width: number;
}

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [currentLine, setCurrentLine] = useState<Line | null>(null);
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const { resolvedTheme } = useTheme();

  // Set up canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle resize
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      redrawCanvas();
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Handle theme changes
  useEffect(() => {
    if (!canvasRef.current) return;
    redrawCanvas();
  }, [resolvedTheme]);

  // Draw all lines
  const redrawCanvas = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background based on theme
    ctx.fillStyle = resolvedTheme === 'dark' ? '#333333' : '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all stored lines
    lines.forEach(line => {
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
  };

  // Mouse and touch event handlers
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return;
    
    setIsDrawing(true);
    
    const point = getPointFromEvent(e);
    const newLine: Line = {
      points: [point],
      color: color,
      width: strokeWidth
    };
    
    setCurrentLine(newLine);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !currentLine || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    e.preventDefault();
    
    const point = getPointFromEvent(e);
    const updatedLine = {
      ...currentLine,
      points: [...currentLine.points, point]
    };
    
    setCurrentLine(updatedLine);
    
    // Draw the current line segment
    const lastPoint = currentLine.points[currentLine.points.length - 1];
    
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(point.x, point.y);
    ctx.strokeStyle = currentLine.color;
    ctx.lineWidth = currentLine.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing || !currentLine) return;
    
    setIsDrawing(false);
    setLines([...lines, currentLine]);
    setCurrentLine(null);
  };

  const getPointFromEvent = (e: React.MouseEvent | React.TouchEvent): Point => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
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

  const clearCanvas = () => {
    setLines([]);
    redrawCanvas();
  };

  return (
    <div className="whiteboard-container h-full w-full relative">
      <div className="controls absolute top-2 left-2 z-10 flex gap-2 bg-white dark:bg-gray-800 p-2 rounded-md shadow-md">
        <input 
          type="color" 
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-8 h-8 cursor-pointer"
        />
        <select 
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2"
        >
          <option value="1">Thin</option>
          <option value="3">Medium</option>
          <option value="5">Thick</option>
          <option value="10">Extra Thick</option>
        </select>
        <button 
          onClick={clearCanvas}
          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
        >
          Clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="touch-none h-full w-full"
      />
    </div>
  );
} 