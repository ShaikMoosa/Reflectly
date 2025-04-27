'use client';

import { useEffect, useRef, useState } from 'react';
import { Stage, Layer } from 'react-konva';
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
  } = useWhiteboardStore();

  const stageRef = useRef<any>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [newShapeId, setNewShapeId] = useState<string | null>(null);

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

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    
    const pointerPos = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };
    
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    setScale(newScale);
    
    const newPos = {
      x: -(pointerPos.x - stage.getPointerPosition().x / newScale) * newScale,
      y: -(pointerPos.y - stage.getPointerPosition().y / newScale) * newScale,
    };
    
    setCanvasPosition(newPos);
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    // Clear selection if clicking on empty canvas
    if (e.target === e.currentTarget) {
      clearSelection();
    }

    // Start drawing if using drawing tools
    if (currentTool !== 'select') {
      setIsDrawing(true);
      const pos = stageRef.current.getPointerPosition();
      const newShape = {
        type: currentTool,
        x: (pos.x - canvasPosition.x) / scale,
        y: (pos.y - canvasPosition.y) / scale,
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
    const point = stage.getPointerPosition();
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
    if (isDrawing) {
      setIsDrawing(false);
      
      // Select the newly created shape
      if (newShapeId) {
        const id = newShapeId;
        clearSelection();
        setTimeout(() => {
          // Small delay to prevent immediate editing
          selectShape(id);
        }, 10);
        setNewShapeId(null);
      }
    }
  };

  return (
    <div className="relative w-full h-full">
      <Toolbar />
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        draggable={currentTool === 'select' && !isDrawing}
        x={canvasPosition.x}
        y={canvasPosition.y}
        scaleX={scale}
        scaleY={scale}
      >
        <Layer>
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
  );
}

// Export named component to ensure import compatibility
export { WhiteboardCanvas }; 