'use client';

import React, { useState } from 'react';
import { FlowConnection, FlowNode } from './types';

interface ConnectionProps {
  connection: FlowConnection;
  sourceNode?: FlowNode;
  targetNode?: FlowNode;
  selected: boolean;
  showWarning?: boolean;
  isAnimated?: boolean;
  readOnly?: boolean;
  onSelect: (connectionId: string, isMultiSelect: boolean) => void;
  onLabelChange: (connectionId: string, label: string) => void;
}

const FlowCanvasConnection: React.FC<ConnectionProps> = ({
  connection,
  sourceNode,
  targetNode,
  selected,
  showWarning = false,
  isAnimated = false,
  readOnly = false,
  onSelect,
  onLabelChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [labelValue, setLabelValue] = useState(connection.label || '');

  // If source or target nodes are missing, don't render
  if (!sourceNode || !targetNode) {
    return null;
  }

  // Calculate source and target points
  const sourceX = sourceNode.position.x + (sourceNode.width || 200);
  const sourceY = sourceNode.position.y + (sourceNode.height || 100) / 2;
  const targetX = targetNode.position.x;
  const targetY = targetNode.position.y + (targetNode.height || 100) / 2;

  // Calculate path 
  const midX = (sourceX + targetX) / 2;
  
  // Create a curved path between nodes
  const path = `M ${sourceX},${sourceY} C ${sourceX + 50},${sourceY} ${targetX - 50},${targetY} ${targetX},${targetY}`;
  
  // Handle connection click
  const handleClick = (e: React.MouseEvent) => {
    if (readOnly) return;
    
    e.stopPropagation();
    onSelect(connection.id, e.ctrlKey || e.metaKey);
  };
  
  // Handle label double click to edit
  const handleLabelDoubleClick = (e: React.MouseEvent) => {
    if (readOnly) return;
    
    e.stopPropagation();
    setIsEditing(true);
  };
  
  // Handle label change
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabelValue(e.target.value);
  };
  
  // Handle label input blur
  const handleLabelBlur = () => {
    setIsEditing(false);
    if (labelValue !== connection.label) {
      onLabelChange(connection.id, labelValue);
    }
  };
  
  // Handle label key down
  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      onLabelChange(connection.id, labelValue);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setLabelValue(connection.label || '');
    }
  };

  return (
    <g className="flow-connection" onClick={handleClick}>
      {/* Connection line */}
      <path
        d={path}
        fill="none"
        strokeWidth={selected ? 3 : 2}
        stroke={selected ? '#6366F1' : showWarning ? '#F59E0B' : '#94A3B8'}
        strokeDasharray={connection.type === 'dashed' ? '5,5' : 'none'}
        className={isAnimated ? 'animate-pulse' : ''}
        pointerEvents="stroke"
      />
      
      {/* Arrow head */}
      <marker
        id={`arrowhead-${connection.id}`}
        viewBox="0 0 10 10"
        refX="8"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill={selected ? '#6366F1' : showWarning ? '#F59E0B' : '#94A3B8'} />
      </marker>
      
      {/* Label area */}
      <g transform={`translate(${midX - 15}, ${(sourceY + targetY) / 2 - 10})`}>
        {/* Label background */}
        <rect
          x="0"
          y="0"
          width="30"
          height="20"
          rx="4"
          fill="white"
          stroke={selected ? '#6366F1' : '#E2E8F0'}
          strokeWidth="1"
          pointerEvents="all"
          onDoubleClick={handleLabelDoubleClick}
        />
        
        {/* Label text or input */}
        {isEditing ? (
          <foreignObject x="0" y="0" width="30" height="20">
            <input
              className="w-full h-full text-xs border-none outline-none text-center bg-transparent"
              value={labelValue}
              onChange={handleLabelChange}
              onBlur={handleLabelBlur}
              onKeyDown={handleLabelKeyDown}
              autoFocus
            />
          </foreignObject>
        ) : (
          <text
            x="15"
            y="14"
            textAnchor="middle"
            fontSize="10"
            fontFamily="sans-serif"
            fill="#64748B"
            pointerEvents="none"
          >
            {connection.label || ''}
          </text>
        )}
      </g>
    </g>
  );
};

export default FlowCanvasConnection; 