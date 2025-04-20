'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Circle, Transformer } from 'react-konva';
import { useBoardStore, Shape } from '../../stores/useBoardStore';
import { KonvaEventObject } from 'konva/lib/Node';

export default function Board() {
  const {
    shapes,
    selectedId,
    updateShape,
    selectShape,
    deleteShape,
    tool,
    viewportTransform,
    updateViewport
  } = useBoardStore();
  
  const stageRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  const [stageSize, setStageSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1000,
    height: typeof window !== 'undefined' ? window.innerHeight - 64 : 700, // Adjust for header
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setStageSize({
        width: window.innerWidth,
        height: window.innerHeight - 64, // Adjust for header
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update transformer on selection change
  useEffect(() => {
    if (!transformerRef.current || !layerRef.current) return;

    if (selectedId) {
      // Find the selected node
      const node = layerRef.current.findOne(`#${selectedId}`);
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer().batchDraw();
      } else {
        transformerRef.current.nodes([]);
      }
    } else {
      transformerRef.current.nodes([]);
    }
  }, [selectedId, shapes]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedId) {
        deleteShape(selectedId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, deleteShape]);

  // Zoom on wheel
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    if (tool !== 'pan') return;
    
    const scaleBy = 1.05;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    
    const pointerPos = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointerPos.x - stage.x()) / oldScale,
      y: (pointerPos.y - stage.y()) / oldScale,
    };
    
    // Calculate new scale
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    // Update the stage position and scale
    stage.scale({ x: newScale, y: newScale });
    stage.position({
      x: pointerPos.x - mousePointTo.x * newScale,
      y: pointerPos.y - mousePointTo.y * newScale,
    });
    
    // Update the state
    updateViewport({
      x: stage.x(),
      y: stage.y(),
      scale: newScale
    });
    
    stage.batchDraw();
  };

  // Handle stage click (deselect when clicking on empty area)
  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    // Check if clicked on stage but not on a shape
    if (e.target === e.currentTarget) {
      selectShape(null);
    }
  };

  // Handle stage drag (panning)
  const handleStageDrag = (e: KonvaEventObject<DragEvent>) => {
    if (tool !== 'pan') return;
    
    updateViewport({
      x: e.target.x(),
      y: e.target.y()
    });
  };

  // Helper function to get a config object for a shape
  const getShapeProps = (shape: Shape) => {
    const isSelected = shape.id === selectedId;
    
    const commonProps = {
      id: shape.id,
      x: shape.x,
      y: shape.y,
      fill: shape.fill,
      stroke: isSelected ? '#000000' : undefined,
      strokeWidth: isSelected ? 2 : 0,
      draggable: tool === 'select',
      onClick: (e: KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true;
        if (tool === 'select') {
          selectShape(shape.id);
        }
      },
      onTap: (e: KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true;
        if (tool === 'select') {
          selectShape(shape.id);
        }
      },
      onDragEnd: (e: KonvaEventObject<DragEvent>) => {
        updateShape(shape.id, {
          x: e.target.x(),
          y: e.target.y()
        });
      },
      onTransformEnd: (e: KonvaEventObject<Event>) => {
        const node = e.target;
        
        // Get properties depending on shape type
        if (shape.type === 'rect') {
          updateShape(shape.id, {
            x: node.x(),
            y: node.y(),
            width: node.width() * node.scaleX(),
            height: node.height() * node.scaleY()
          });
        } else if (shape.type === 'circle') {
          updateShape(shape.id, {
            x: node.x(),
            y: node.y(),
            radius: shape.radius! * node.scaleX()
          });
        }
        
        // Reset scale
        node.scaleX(1);
        node.scaleY(1);
      }
    };
    
    if (shape.type === 'rect') {
      return {
        ...commonProps,
        width: shape.width,
        height: shape.height
      };
    } else if (shape.type === 'circle') {
      return {
        ...commonProps,
        radius: shape.radius
      };
    }
    
    return commonProps;
  };

  return (
    <Stage
      ref={stageRef}
      width={stageSize.width}
      height={stageSize.height}
      draggable={tool === 'pan'}
      onWheel={handleWheel}
      onClick={handleStageClick}
      onDragEnd={handleStageDrag}
      x={viewportTransform.x}
      y={viewportTransform.y}
      scaleX={viewportTransform.scale}
      scaleY={viewportTransform.scale}
    >
      <Layer ref={layerRef}>
        {shapes.map((shape) => {
          if (shape.type === 'rect') {
            return <Rect key={shape.id} {...getShapeProps(shape)} />;
          } else if (shape.type === 'circle') {
            return <Circle key={shape.id} {...getShapeProps(shape)} />;
          }
          return null;
        })}
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit minimum size
            if (newBox.width < 10 || newBox.height < 10) {
              return oldBox;
            }
            return newBox;
          }}
        />
      </Layer>
    </Stage>
  );
} 