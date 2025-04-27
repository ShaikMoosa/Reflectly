'use client';

import { KonvaEventObject } from 'konva/lib/Node';
import { Rect, Ellipse, Line, Text, Group, Transformer } from 'react-konva';
import { useRef, useEffect } from 'react';
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
  } = useWhiteboardStore();
  
  const shapeRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  // Handle selection and transformer
  useEffect(() => {
    if (isSelected && transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

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
      width: node.width() * scaleX,
      height: node.height() * scaleY,
    });
  };

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    updateShape(shape.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleSelect = (e: KonvaEventObject<MouseEvent>) => {
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
            cornerRadius={2}
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
            padding={4}
            onDblClick={() => {
              // Implement text editing on double click
              // This would involve switching to an input or textarea
            }}
          />
        );

      case 'note':
        return (
          <Group {...commonProps}>
            <Rect
              x={shape.x}
              y={shape.y}
              width={shape.width || 200}
              height={shape.height || 200}
              fill={shape.fill || '#FFFF88'}
              shadowColor="black"
              shadowBlur={10}
              shadowOpacity={0.2}
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
              onDblClick={() => {
                // Implement note editing on double click
              }}
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
        />
      )}
    </>
  );
}

// Add a named export to ensure this component can be imported correctly
export { ShapeElement }; 