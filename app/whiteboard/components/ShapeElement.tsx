'use client';

import { KonvaEventObject } from 'konva/lib/Node';
import { Rect, Ellipse, Line, Text, Group, Transformer } from 'react-konva';
import { useRef, useEffect, useState } from 'react';
import { Shape, useWhiteboardStore } from '../store/useWhiteboardStore';
import { getStroke } from 'perfect-freehand';

interface ShapeElementProps {
  shape: Shape;
  isSelected: boolean;
}

export default function ShapeElement({ shape, isSelected }: ShapeElementProps) {
  const { 
    selectShape, 
    updateShape,
    setIsDrawing,
    currentColor,
  } = useWhiteboardStore();
  
  const shapeRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(shape.text || '');

  // Handle selection and transformer
  useEffect(() => {
    if (isSelected && transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // Update editText when shape text changes
  useEffect(() => {
    if (shape.text !== undefined) {
      setEditText(shape.text);
    }
  }, [shape.text]);

  const handleTransformEnd = (e: KonvaEventObject<Event>) => {
    // Update shape after transformation
    const node = shapeRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Reset scale and apply width/height directly
    node.scaleX(1);
    node.scaleY(1);
    
    updateShape(shape.id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(10, node.width() * scaleX),
      height: Math.max(10, node.height() * scaleY),
    });
  };

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    updateShape(shape.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleSelect = (e: KonvaEventObject<MouseEvent>) => {
    // Don't select if we're already editing text
    if (isEditing) return;
    
    // Multiselect with shift key
    const isMultiSelect = e.evt.shiftKey;
    selectShape(shape.id, isMultiSelect);
  };

  // Function to convert freehand drawing points to SVG path
  const getSvgPathFromStroke = (points: number[][]) => {
    const d = points.reduce(
      (acc, [x0, y0], i, arr) => {
        const [x1, y1] = arr[(i + 1) % arr.length];
        acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
        return acc;
      },
      ['M', ...points[0], 'Q']
    );

    d.push('Z');
    return d.join(' ');
  };

  // Convert points array to Konva Line points
  const getPathPoints = () => {
    if (!shape.points || shape.points.length === 0) return [];
    
    // Convert our points to perfect-freehand format
    const freehandPoints = shape.points.map(pt => [pt.x, pt.y]);
    
    // Get the stroke outline points
    const stroke = getStroke(freehandPoints, {
      size: 4,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
    });

    // Convert to flat array for Konva Line
    const flattenedPoints: number[] = [];
    for (const point of stroke) {
      flattenedPoints.push(point[0], point[1]);
    }
    
    return flattenedPoints;
  };

  // Handle double-click for text editing
  const handleTextDblClick = (e: KonvaEventObject<MouseEvent>) => {
    if (shape.type !== 'text' && shape.type !== 'note') return;
    
    const stage = e.target.getStage();
    if (!stage) return; // Guard against null stage
    
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    
    const stageRect = stage.container().getBoundingClientRect();
    const areaPosition = {
      x: stageRect.left + shape.x * stage.scaleX() + stage.x(),
      y: stageRect.top + shape.y * stage.scaleY() + stage.y(),
    };
    
    textarea.value = shape.text || '';
    textarea.style.position = 'absolute';
    textarea.style.top = `${areaPosition.y}px`;
    textarea.style.left = `${areaPosition.x}px`;
    textarea.style.width = `${(shape.width || 200) * stage.scaleX()}px`;
    textarea.style.height = `${(shape.height || 100) * stage.scaleY()}px`;
    textarea.style.fontSize = `${16 * stage.scaleY()}px`;
    textarea.style.border = '2px solid #0096FF';
    textarea.style.padding = '10px';
    textarea.style.margin = '0px';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'white';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.zIndex = '1000';
    textarea.style.fontFamily = 'Arial';
    
    textarea.focus();
    
    setIsEditing(true);
    
    const handleOutsideClick = (e: MouseEvent) => {
      if (e.target !== textarea) {
        updateShape(shape.id, {
          text: textarea.value
        });
        document.body.removeChild(textarea);
        document.removeEventListener('click', handleOutsideClick);
        setIsEditing(false);
      }
    };
    
    // Give time for double click to register before adding event listener
    setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
    }, 300);
    
    // Handle keyboard events
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        updateShape(shape.id, {
          text: textarea.value
        });
        document.body.removeChild(textarea);
        document.removeEventListener('click', handleOutsideClick);
        setIsEditing(false);
        e.preventDefault();
      }
    });
  };

  // Handle changing the fill color if selected
  const handleColorChange = () => {
    if (isSelected) {
      updateShape(shape.id, {
        fill: currentColor
      });
    }
  };

  // Render appropriate shape based on type
  const renderShape = () => {
    const commonProps = {
      ref: shapeRef,
      onClick: handleSelect,
      onTap: handleSelect,
      onDragEnd: handleDragEnd,
      onTransformEnd: handleTransformEnd,
      draggable: isSelected,
    };

    switch (shape.type) {
      case 'rectangle':
        return (
          <Rect
            {...commonProps}
            x={shape.x}
            y={shape.y}
            width={shape.width || 100}
            height={shape.height || 100}
            fill={shape.fill}
            strokeWidth={2}
            stroke={isSelected ? '#0096FF' : 'transparent'}
            cornerRadius={4}
            shadowColor={isSelected ? 'black' : 'transparent'}
            shadowBlur={isSelected ? 10 : 0}
            shadowOpacity={0.2}
            shadowOffset={{ x: 5, y: 5 }}
            onDblClick={handleColorChange}
          />
        );

      case 'ellipse':
        return (
          <Ellipse
            {...commonProps}
            x={shape.x + (shape.width || 100) / 2}
            y={shape.y + (shape.height || 100) / 2}
            radiusX={(shape.width || 100) / 2}
            radiusY={(shape.height || 100) / 2}
            fill={shape.fill}
            strokeWidth={2}
            stroke={isSelected ? '#0096FF' : 'transparent'}
            shadowColor={isSelected ? 'black' : 'transparent'}
            shadowBlur={isSelected ? 10 : 0}
            shadowOpacity={0.2}
            shadowOffset={{ x: 5, y: 5 }}
            onDblClick={handleColorChange}
          />
        );

      case 'path':
        if (!shape.points) return null;
        return (
          <Line
            {...commonProps}
            points={getPathPoints()}
            x={shape.x}
            y={shape.y}
            fill={shape.fill}
            closed={true}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
            stroke={isSelected ? '#0096FF' : 'transparent'}
            strokeWidth={isSelected ? 2 : 0}
            shadowColor={isSelected ? 'black' : 'transparent'}
            shadowBlur={isSelected ? 10 : 0}
            shadowOpacity={0.1}
            shadowOffset={{ x: 3, y: 3 }}
            onDblClick={handleColorChange}
          />
        );

      case 'text':
        return (
          <Text
            {...commonProps}
            x={shape.x}
            y={shape.y}
            text={shape.text || 'Double click to edit'}
            fontSize={16}
            fontFamily="Arial"
            fill={shape.fill}
            width={shape.width || 200}
            height={shape.height || 100}
            padding={8}
            onDblClick={handleTextDblClick}
            shadowColor={isSelected ? 'black' : 'transparent'}
            shadowBlur={isSelected ? 10 : 0}
            shadowOpacity={0.1}
            shadowOffset={{ x: 3, y: 3 }}
          />
        );

      case 'note':
        return (
          <Group {...commonProps} onDblClick={handleTextDblClick}>
            <Rect
              x={shape.x}
              y={shape.y}
              width={shape.width || 200}
              height={shape.height || 200}
              fill={shape.fill || '#FFFF88'}
              shadowColor="black"
              shadowBlur={10}
              shadowOpacity={isSelected ? 0.3 : 0.2}
              shadowOffset={{ x: 5, y: 5 }}
              cornerRadius={5}
              stroke={isSelected ? '#0096FF' : 'transparent'}
              strokeWidth={2}
            />
            <Text
              x={shape.x + 10}
              y={shape.y + 10}
              text={shape.text || 'Double click to edit'}
              fontSize={16}
              fontFamily="Arial"
              fill="#333333"
              width={(shape.width || 200) - 20}
              height={(shape.height || 200) - 20}
            />
          </Group>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {renderShape()}
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Constrain resize to minimum dimensions
            if (newBox.width < 10 || newBox.height < 10) {
              return oldBox;
            }
            return newBox;
          }}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          rotateEnabled={false}
          borderStroke="#0096FF"
          borderStrokeWidth={2}
          anchorFill="#ffffff"
          anchorStroke="#0096FF"
          anchorSize={8}
        />
      )}
    </>
  );
}

// Add a named export to ensure this component can be imported correctly
export { ShapeElement }; 