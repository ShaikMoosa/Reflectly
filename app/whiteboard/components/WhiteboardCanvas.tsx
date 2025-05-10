'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { useWhiteboardStore } from '../store/useWhiteboardStore';
import { Toolbar } from '@/app/whiteboard/components/Toolbar';
import { ShapeElement } from '@/app/whiteboard/components/ShapeElement';

export default function WhiteboardCanvas() {
  const {
    shapes,
    selectedIds,
    currentTool,
    currentColor,
    isDrawing,
    canvasPosition,
    scale,
    setCanvasPosition,
    setScale,
    addShape,
    updateShape,
    clearSelection,
    setIsDrawing,
    selectShape,
    deleteShape,
    duplicateSelectedShapes,
    undoLastAction,
    setCurrentTool,
  } = useWhiteboardStore();

  const stageRef = useRef<any>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [newShapeId, setNewShapeId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [cursorStyle, setCursorStyle] = useState('default');

  // Set up canvas size based on container size
  useEffect(() => {
    const updateSize = () => {
      setStageSize({
        width: window.innerWidth,
        height: window.innerHeight - 80, // Adjusting for toolbar height
      });
    };

    window.addEventListener('resize', updateSize);
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete/Backspace to delete selected shapes
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        e.preventDefault();
        selectedIds.forEach(id => deleteShape(id));
      }
      
      // Undo with Ctrl+Z
      if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        undoLastAction();
      }
      
      // Duplicate with Ctrl+D
      if (e.key === 'd' && (e.ctrlKey || e.metaKey) && selectedIds.length > 0) {
        e.preventDefault();
        duplicateSelectedShapes();
      }
      
      // Escape to deselect
      if (e.key === 'Escape') {
        e.preventDefault();
        clearSelection();
        // Also switch to select tool if we're drawing
        if (currentTool !== 'select') {
          setCurrentTool('select');
        }
      }
      
      // Spacebar for panning (when held down)
      if (e.key === ' ' && !isPanning) {
        e.preventDefault();
        setIsPanning(true);
        setCursorStyle('grabbing');
      }
      
      // Number shortcuts for tools
      if (e.key === '1') setCurrentTool('select');
      if (e.key === '2') setCurrentTool('rectangle');
      if (e.key === '3') setCurrentTool('ellipse');
      if (e.key === '4') setCurrentTool('path');
      if (e.key === '5') setCurrentTool('text');
      if (e.key === '6') setCurrentTool('note');
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      // Release spacebar panning
      if (e.key === ' ') {
        e.preventDefault();
        setIsPanning(false);
        setCursorStyle('default');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    selectedIds, 
    deleteShape, 
    undoLastAction, 
    duplicateSelectedShapes, 
    clearSelection, 
    currentTool, 
    setCurrentTool,
    isPanning
  ]);

  // Update cursor based on current tool
  useEffect(() => {
    if (isPanning) {
      setCursorStyle('grabbing');
    } else {
      switch (currentTool) {
        case 'select':
          setCursorStyle('default');
          break;
        case 'rectangle':
        case 'ellipse':
        case 'note':
          setCursorStyle('crosshair');
          break;
        case 'path':
          setCursorStyle('pencil');
          break;
        case 'text':
          setCursorStyle('text');
          break;
        default:
          setCursorStyle('default');
      }
    }
  }, [currentTool, isPanning]);

  const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;
    const stage = stageRef.current;
    if (!stage) return;
    
    const oldScale = stage.scaleX();
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;
    
    const mousePointTo = {
      x: (pointerPos.x - stage.x()) / oldScale,
      y: (pointerPos.y - stage.y()) / oldScale,
    };
    
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    // Limit scale to reasonable values
    if (newScale < 0.1 || newScale > 5) return;
    
    setScale(newScale);
    
    const newPos = {
      x: pointerPos.x - mousePointTo.x * newScale,
      y: pointerPos.y - mousePointTo.y * newScale,
    };
    
    setCanvasPosition(newPos);
  }, [setScale, setCanvasPosition]);

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    if (!stage) return;
    
    // If panning (spacebar held), don't do anything else
    if (isPanning) return;
    
    // Clear selection if clicking on empty canvas
    if (e.target === e.currentTarget) {
      clearSelection();
    }

    // Start drawing if using drawing tools
    if (currentTool !== 'select') {
      setIsDrawing(true);
      const pos = stage.getPointerPosition();
      if (!pos) return;
      
      const relativePos = {
        x: (pos.x - canvasPosition.x) / scale,
        y: (pos.y - canvasPosition.y) / scale
      };
      
      const newShape = {
        type: currentTool,
        x: relativePos.x,
        y: relativePos.y,
        width: 0,
        height: 0,
        fill: currentColor,
        points: currentTool === 'path' ? [{ x: 0, y: 0 }] : undefined,
      };
      
      const newId = addShape(newShape);
      setNewShapeId(newId);
    }
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || !newShapeId) return;
    
    const stage = stageRef.current;
    if (!stage) return;
    
    const point = stage.getPointerPosition();
    if (!point) return;
    
    const startPos = shapes.find(shape => shape.id === newShapeId);
    if (!startPos) return;
    
    // Calculate position considering scale and canvas position
    const x = (point.x - canvasPosition.x) / scale;
    const y = (point.y - canvasPosition.y) / scale;
    
    switch (currentTool) {
      case 'rectangle':
      case 'ellipse':
      case 'note':
        // For shapes with width/height, calculate dimensions
        const width = Math.abs(x - startPos.x);
        const height = Math.abs(y - startPos.y);
        
        // Ensure the shape's top-left is correct even when drawing from right to left
        const newX = x < startPos.x ? x : startPos.x;
        const newY = y < startPos.y ? y : startPos.y;
        
        updateShape(newShapeId, {
          x: newX,
          y: newY,
          width: width,
          height: height,
        });
        break;
        
      case 'path':
        // For path, add points relative to the starting position
        const newPoint = {
          x: x - startPos.x,
          y: y - startPos.y,
        };
        
        updateShape(newShapeId, {
          points: [...(startPos.points || []), newPoint],
        });
        break;
        
      case 'text':
        // For text, just update size
        updateShape(newShapeId, {
          width: Math.max(100, Math.abs(x - startPos.x)),
          height: Math.max(50, Math.abs(y - startPos.y)),
        });
        break;
    }
  };

  const handleMouseUp = () => {
    // Return if we're panning - don't end the panning until spacebar is released
    if (isPanning) return;
    
    if (isDrawing) {
      setIsDrawing(false);
      
      // Select the newly created shape
      if (newShapeId) {
        const id = newShapeId;
        
        // Only select if the shape has a meaningful size
        const shape = shapes.find(s => s.id === id);
        if (shape && ((shape.width && shape.width > 5) || 
            (shape.height && shape.height > 5) || 
            (shape.points && shape.points.length > 2))) {
          clearSelection();
          setTimeout(() => {
            selectShape(id);
          }, 10);
        } else {
          // Delete too small shapes
          deleteShape(id);
        }
        
        setNewShapeId(null);
      }
    }
  };

  return (
    <div className="relative w-full h-full">
      <Toolbar />
      <div 
        style={{ cursor: cursorStyle }}
        className="w-full h-full overflow-hidden"
      >
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          draggable={currentTool === 'select' || isPanning}
          x={canvasPosition.x}
          y={canvasPosition.y}
          scaleX={scale}
          scaleY={scale}
        >
          <Layer>
            {/* Grid background */}
            <Rect
              width={5000}
              height={5000}
              x={-2500}
              y={-2500}
              fill="#f9f9f9"
              stroke="#eeeeee"
              strokeWidth={1}
            />
            {shapes.map((shape) => (
              <ShapeElement 
                key={shape.id} 
                shape={shape} 
                isSelected={selectedIds.includes(shape.id)} 
              />
            ))}
          </Layer>
        </Stage>
      </div>
      {/* Keyboard shortcuts helper - visible on pressing Alt key */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg text-xs text-gray-700 dark:text-gray-200 opacity-60 hover:opacity-100 transition-opacity">
        <div>Shortcuts: 1-6=Tools, Del=Delete, Ctrl+Z=Undo, Ctrl+D=Duplicate, Space=Pan, Esc=Cancel</div>
      </div>
    </div>
  );
}

// Export named component to ensure import compatibility
export { WhiteboardCanvas }; 