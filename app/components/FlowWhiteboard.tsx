'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  type Node as ReactFlowNode,
  NodeTypes,
  Panel,
  useReactFlow,
  BackgroundVariant,
  ReactFlowProvider,
  ControlButton
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTheme } from 'next-themes';
import { HexColorPicker } from 'react-colorful';
import useUndoable from 'use-undoable';
import { getStroke } from 'perfect-freehand';
import { ResizableBox, ResizableBoxProps } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { 
  Square2StackIcon, 
  CircleStackIcon, 
  PencilIcon, 
  ArrowsPointingOutIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  LinkIcon,
  PhotoIcon,
  DocumentTextIcon,
  HandRaisedIcon,
  ArrowPathIcon,
  ArrowUpIcon,
  BackspaceIcon
} from '@heroicons/react/24/outline';

// Define custom node types
const CustomRectangleNode = ({ id, data, selected, style }: any) => {
  const color = data.color || '#ffffff';
  const textColor = getContrastColor(color);
  const borderColor = selected ? 'var(--rf-node-selected)' : 'var(--rf-node-border)';
  const borderWidth = selected ? '2px' : '1px';

  // Get current dimensions or default from sizeOptions if not set
  const width = style?.width ?? sizeOptions.M.width;
  const height = style?.height ?? sizeOptions.M.height;

  const onResizeStop: ResizableBoxProps['onResizeStop'] = (e, resizeData) => {
    e.stopPropagation(); // Prevent interference
    if (data.onResizeStop) {
      data.onResizeStop(id, resizeData.size);
    }
  };

  return (
    <ResizableBox
      width={width}
      height={height}
      onResizeStop={onResizeStop}
      minConstraints={[30, 30]} // Minimum size
      // Add handles - customize as needed
      handle={<span className="react-resizable-handle" />}
      // Important: Prevent dragging node while resizing handle
      draggableOpts={{ enableUserSelectHack: false }}
      // Pass node's selected state to potentially style handles differently
      className={selected ? 'nowheel nodrag' : 'nowheel'} // Prevent zoom/drag while resizing
    >
      {/* Ensure inner div fills the resizable box */}
      <div
        className={`px-4 py-2 rounded-md flex items-center justify-center w-full h-full ${selected ? 'shadow-md' : ''}`}
        style={{ 
          backgroundColor: color,
          color: textColor,
          border: `${borderWidth} solid ${borderColor}`,
          // Let ResizableBox control width/height
        }}
      > 
        {data.label}
      </div>
    </ResizableBox>
  );
};

const CustomCircleNode = ({ id, data, selected, style }: any) => {
  const color = data.color || '#ffffff';
  const textColor = getContrastColor(color);
  const borderColor = selected ? 'var(--rf-node-selected)' : 'var(--rf-node-border)';
  const borderWidth = selected ? '2px' : '1px';

  // Use width for both dimensions, default to M size width
  const size = style?.width ?? sizeOptions.M.width;

  const onResizeStop: ResizableBoxProps['onResizeStop'] = (e, resizeData) => {
    e.stopPropagation(); 
    if (data.onResizeStop) {
       // For circle, pass width as both width and height
      data.onResizeStop(id, { width: resizeData.size.width, height: resizeData.size.width });
    }
  };

  return (
    <ResizableBox
      width={size}
      height={size} // Keep height same as width
      onResizeStop={onResizeStop}
      minConstraints={[30, 30]}
      lockAspectRatio={true} // Maintain aspect ratio for circle
      handle={<span className="react-resizable-handle" />}
      draggableOpts={{ enableUserSelectHack: false }}
      className={selected ? 'nowheel nodrag' : 'nowheel'} 
    >
      <div
        className={`rounded-full flex items-center justify-center w-full h-full ${selected ? 'shadow-md' : ''}`}
        style={{ 
          backgroundColor: color,
          color: textColor,
          border: `${borderWidth} solid ${borderColor}`,
        }}
      >
        {data.label}
      </div>
    </ResizableBox>
  );
};

const CustomTextNode = ({ data, selected }: any) => {
  const borderColor = selected ? 'var(--rf-node-selected)' : 'transparent';
  const borderWidth = selected ? '2px' : '1px';
  const textColor = data.color || 'inherit';

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (data.onLabelChange) {
      data.onLabelChange(e.currentTarget.textContent || '');
    }
    // Prevent React Flow node drag/selection interfering with text input
    e.stopPropagation(); 
  };

  return (
    <div
      className={`px-2 py-1 rounded ${
        selected ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-transparent'
      }`}
      style={{ border: `${borderWidth} solid ${borderColor}` }}
    >
      <div
        contentEditable
        suppressContentEditableWarning
        className="outline-none nodrag" // Added 'nodrag' class if needed, depends on React Flow setup
        style={{ color: textColor }}
        onInput={handleInput} // Changed from onBlur to onInput
        // Stop keydown events like Delete/Backspace from triggering React Flow handlers when editing
        onKeyDown={(e) => e.stopPropagation()} 
      >
        {data.label}
      </div>
    </div>
  );
};

const CustomDiamondNode = ({ id, data, selected, style }: any) => {
  const color = data.color || '#ffffff';
  const textColor = getContrastColor(color);
  const borderColor = selected ? 'var(--rf-node-selected)' : 'var(--rf-node-border)';
  const borderWidth = selected ? '2px' : '1px';

  const width = style?.width ?? sizeOptions.M.width;
  const height = style?.height ?? sizeOptions.M.height;

  const onResizeStop: ResizableBoxProps['onResizeStop'] = (e, resizeData) => {
    e.stopPropagation();
    if (data.onResizeStop) {
      data.onResizeStop(id, resizeData.size);
    }
  };

  return (
    <ResizableBox
      width={width}
      height={height}
      onResizeStop={onResizeStop}
      minConstraints={[40, 40]} // Diamond needs a bit more space
      handle={<span className="react-resizable-handle" />}
      draggableOpts={{ enableUserSelectHack: false }}
      className={selected ? 'nowheel nodrag' : 'nowheel'} 
    >
      {/* Outer div is now ResizableBox, inner div needs to adapt */}
      <div
        className={`flex items-center justify-center w-full h-full ${selected ? 'shadow-md' : ''}`}
      >
        <div
          style={{
            width: '100%', // Make inner diamond fill the container
            height: '100%',
            backgroundColor: color,
            color: textColor,
            border: `${borderWidth} solid ${borderColor}`,
            transform: 'rotate(45deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ transform: 'rotate(-45deg)' }}>
            {data.label}
          </div>
        </div>
      </div>
    </ResizableBox>
  );
};

const CustomStickyNote = ({ id, data, selected, style }: any) => {
  const color = data.color || '#FFEAA7';
  const textColor = getContrastColor(color);
  const borderColor = selected ? 'var(--rf-node-selected)' : 'rgba(0,0,0,0.1)';
  const borderWidth = selected ? '2px' : '1px';

  const width = style?.width ?? sizeOptions.M.width * 1.2;
  const height = style?.height ?? sizeOptions.M.height * 1.5;

  const onResizeStop: ResizableBoxProps['onResizeStop'] = (e, resizeData) => {
    e.stopPropagation();
    if (data.onResizeStop) {
      data.onResizeStop(id, resizeData.size);
    }
  };

  return (
    <ResizableBox
      width={width}
      height={height}
      onResizeStop={onResizeStop}
      minConstraints={[80, 80]} // Min size for sticky
      handle={<span className="react-resizable-handle" />}
      draggableOpts={{ enableUserSelectHack: false }}
      className={selected ? 'nowheel nodrag' : 'nowheel'} 
    >
      <div
        className={`p-3 rounded w-full h-full flex flex-col ${selected ? 'shadow-md' : 'shadow-sm'}`}
        style={{ 
          backgroundColor: color,
          color: textColor,
          border: `${borderWidth} solid ${borderColor}`,
          // Let ResizableBox control width/height
        }}
      >
        {/* Use overflow auto in case text exceeds resized bounds */}
        <div
          contentEditable
          suppressContentEditableWarning
          className="outline-none font-medium mb-1 text-sm overflow-auto"
          style={{ flexShrink: 0 }} // Prevent title from shrinking too much
          onBlur={(e) => {
            if (data.onTitleChange) {
              data.onTitleChange(e.currentTarget.textContent);
            }
          }}
        >
          {data.title || 'Note Title'}
        </div>
        <div
          contentEditable
          suppressContentEditableWarning
          className="outline-none text-sm flex-1 overflow-auto"
          onBlur={(e) => {
            if (data.onLabelChange) {
              data.onLabelChange(e.currentTarget.textContent);
            }
          }}
        >
          {data.label}
        </div>
      </div>
    </ResizableBox>
  );
};

// Helper function to determine text color based on background
const getContrastColor = (hexColor: string) => {
  // Remove the # if it exists
  hexColor = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

// Node types registry
const nodeTypes: NodeTypes = {
  rectangle: CustomRectangleNode,
  circle: CustomCircleNode,
  text: CustomTextNode,
  diamond: CustomDiamondNode,
  sticky: CustomStickyNote,
};

// Size options for nodes
const sizeOptions = {
  S: { width: 80, height: 40, fontSize: '12px' },
  M: { width: 150, height: 60, fontSize: '14px' },
  L: { width: 240, height: 80, fontSize: '16px' },
  XL: { width: 320, height: 120, fontSize: '18px' },
};

// Map size options to stroke widths for pencil tool
const strokeSizeMapping = {
  S: 2,
  M: 5,
  L: 8,
  XL: 12,
};

// Available colors in the toolbar (matching TLDraw image)
const colorOptions = [
  '#000000', // Black
  '#9CA3AF', // Gray
  '#D8B4FE', // Light Purple
  '#8B5CF6', // Purple
  '#3B82F6', // Blue
  '#60A5FA', // Light Blue
  '#FB923C', // Orange
  '#EF4444', // Red
  '#10B981', // Green
  '#4ADE80', // Light Green
  '#F472B6', // Pink
  '#F87171', // Light Red
];

// Define type for a single stroke
interface Stroke {
  id: string;
  points: number[][];
  color: string;
  size: number; 
  pathData?: string; // Store the generated SVG path data
  selected?: boolean; // Add selected flag
}

// Define type for a single line/arrow element
interface LineElement {
  id: string;
  start: { x: number, y: number };
  end: { x: number, y: number };
  color: string;
  size: number;
  type: 'line' | 'arrow';
  selected?: boolean;
}

// Initial nodes and edges
const initialNodes: ReactFlowNode[] = [];
const initialEdges: Edge[] = [];

interface FlowWhiteboardProps {
  userId?: string;
}

// Define our toolbar button component for consistency
interface ToolbarButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
  onClick: () => void;
  className?: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ 
  label, 
  icon, 
  isActive, 
  onClick,
  className = ''
}) => {
  return (
    <button
      className={`group flex items-center justify-center rounded-md p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
        isActive ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
      } ${className}`}
      onClick={onClick}
      title={label}
    >
      <span className="w-5 h-5">{icon}</span>
    </button>
  );
};

function FlowEditor({ userId }: { userId?: string }) {
  const { theme } = useTheme();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  // Integrate undo/redo functionality with useUndoable hook
  const [
    nodesPresent, 
    setNodesState, 
    { 
      undo: undoNodes, 
      redo: redoNodes, 
      reset: resetNodes, 
      canUndo: canUndoNodes, 
      canRedo: canRedoNodes 
    }
  ] = useUndoable<ReactFlowNode[]>(initialNodes);
  const [
    edgesPresent, 
    setEdgesState, 
    { 
      undo: undoEdges, 
      redo: redoEdges, 
      reset: resetEdges, 
      canUndo: canUndoEdges, 
      canRedo: canRedoEdges 
    }
  ] = useUndoable<Edge[]>(initialEdges);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(nodesPresent);
  const [edges, setEdges, onEdgesChange] = useEdgesState(edgesPresent);
  
  // State for freehand drawing - now using useUndoable
  const [
    strokesPresent, 
    setStrokesState, 
    { 
      undo: undoStrokes, 
      redo: redoStrokes, 
      reset: resetStrokes, 
      canUndo: canUndoStrokes, 
      canRedo: canRedoStrokes 
    }
  ] = useUndoable<Stroke[]>([]); // Initialize with empty array
  const strokes = strokesPresent; // Use the present state for rendering

  // State for line/arrow elements - using useUndoable
  const [
    linesPresent,
    setLinesState,
    {
      undo: undoLines,
      redo: redoLines,
      reset: resetLines,
      canUndo: canUndoLines,
      canRedo: canRedoLines
    }
  ] = useUndoable<LineElement[]>([]);
  const lines = linesPresent;

  // State for current drawing action (pencil)
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // State for current drawing action (line/arrow)
  const [isDrawingLine, setIsDrawingLine] = useState(false);
  const [lineStartPos, setLineStartPos] = useState<{ x: number, y: number } | null>(null);
  const [currentLineEndPos, setCurrentLineEndPos] = useState<{ x: number, y: number } | null>(null);

  // State for drag selection box (using Flow coordinates)
  const [isSelectingBox, setIsSelectingBox] = useState(false);
  const [selectionStartPos, setSelectionStartPos] = useState<{ x: number, y: number } | null>(null);
  const [selectionEndPos, setSelectionEndPos] = useState<{ x: number, y: number } | null>(null);

  // UI State
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('#000000');
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL'>('M');
  const [isClient, setIsClient] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPanMode, setIsPanMode] = useState(false);
  
  const reactFlow = useReactFlow();
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // Handle light/dark mode
  useEffect(() => {
    setIsClient(true);
    setIsDarkMode(theme === 'dark');
  }, [theme]);

  // Handle clicks outside the color picker to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the target is a Node (DOM Node) and if the click is outside the color picker ref
      if (
        colorPickerRef.current && 
        event.target instanceof Node && // This refers to the global DOM Node
        !colorPickerRef.current.contains(event.target)
      ) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sync React Flow state changes back to useUndoable state history
  useEffect(() => {
    // Avoid adding duplicate states if the react flow state hasn't changed from the present undoable state
    if (nodes !== nodesPresent) {
       setNodesState(nodes);
    }
  }, [nodes, nodesPresent, setNodesState]);

  useEffect(() => {
    if (edges !== edgesPresent) {
      setEdgesState(edges);
    }
  }, [edges, edgesPresent, setEdgesState]);

  // Load data from localStorage 
  useEffect(() => {
    if (!isClient) return;
    
    try {
      const savedData = localStorage.getItem('flowWhiteboardData');
      if (savedData) {
        const { nodes: savedNodes, edges: savedEdges, strokes: savedStrokes, lines: savedLines } = JSON.parse(savedData);
        if (Array.isArray(savedNodes) && Array.isArray(savedEdges) && Array.isArray(savedStrokes) && Array.isArray(savedLines)) {
          setNodes(savedNodes); 
          resetNodes(savedNodes); 
          setEdges(savedEdges); 
          resetEdges(savedEdges); 
          setStrokesState(savedStrokes); 
          resetStrokes(savedStrokes); // Reset history as well
          setLinesState(savedLines);
          resetLines(savedLines);
        }
      }
    } catch (error) {
      console.error('Error loading flow data:', error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, setNodes, setEdges, resetNodes, resetEdges, resetStrokes, resetLines]); // Added resetLines

  // Save data to localStorage
  useEffect(() => {
    // Include strokes and lines in saved data
    if (!isClient || (!nodes.length && !edges.length && !strokes.length && !lines.length)) return; 
    
    try {
      localStorage.setItem('flowWhiteboardData', JSON.stringify({ nodes, edges, strokes, lines })); // Added lines
    } catch (error) {
      console.error('Error saving flow data:', error);
    }
  }, [nodes, edges, strokes, lines, isClient]); // Added lines to dependencies

  // Handle edge connections
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ 
        ...connection, 
        animated: true, 
        style: { stroke: selectedColor, strokeWidth: 2 } 
      }, eds));
    },
    [setEdges, selectedColor]
  );

  // Generate a unique ID for nodes and strokes
  const getId = (prefix: string = 'node') => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

  // Handle undo and redo
  const handleUndo = useCallback(() => {
    undoNodes();
    undoEdges();
    undoStrokes();
    undoLines(); // Add line undo
  }, [undoNodes, undoEdges, undoStrokes, undoLines]); // Updated dependencies

  const handleRedo = useCallback(() => {
    redoNodes();
    redoEdges();
    redoStrokes();
    redoLines(); // Add line redo
  }, [redoNodes, redoEdges, redoStrokes, redoLines]); // Updated dependencies

  // Create a node with the current settings
  const createNode = useCallback((position: { x: number, y: number }, type: string): ReactFlowNode | null => {
    const sizeProps = sizeOptions[selectedSize];
    let newNode: ReactFlowNode;
    
    const handleNodeResize = (nodeId: string, size: { width: number, height: number }) => {
       // For circle, ensure height matches width after resize
      const finalSize = type === 'circle' ? { width: size.width, height: size.width } : size;
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return { 
              ...node, 
              style: { ...node.style, width: finalSize.width, height: finalSize.height }
            };
          }
          return node;
        })
      );
    };

    switch (type) {
      case 'rectangle':
        newNode = {
          id: getId(),
          type: 'rectangle',
          position,
          data: { 
            label: 'Rectangle',
            color: selectedColor,
            onLabelChange: (newLabel: string) => {
              setNodes((nds) =>
                nds.map((node) => (node.id === newNode.id ? { ...node, data: { ...node.data, label: newLabel } } : node))
              );
            },
            onResizeStop: handleNodeResize // Pass resize handler
          },
          style: { ...sizeProps }, // Start with selected size
        };
        break;
        
      case 'circle':
        newNode = {
          id: getId(),
          type: 'circle',
          position,
          data: { 
            label: 'Circle',
            color: selectedColor,
            onLabelChange: (newLabel: string) => {
              setNodes((nds) =>
                nds.map((node) => (node.id === newNode.id ? { ...node, data: { ...node.data, label: newLabel } } : node))
              );
            },
            onResizeStop: handleNodeResize // Pass resize handler
          },
          style: { 
            width: sizeProps.width,
            height: sizeProps.width, // Keep it square for circle
            fontSize: sizeProps.fontSize,
          },
        };
        break;
        
      case 'text':
        newNode = {
          id: getId(),
          type: 'text',
          position,
          data: { 
            label: 'Text',
            color: selectedColor,
            onLabelChange: (newLabel: string) => {
              setNodes((nds) =>
                nds.map((node) => (node.id === newNode.id ? { ...node, data: { ...node.data, label: newLabel } } : node))
              );
            }
          },
          style: { fontSize: sizeProps.fontSize },
        };
        break;
      
      case 'diamond':
        newNode = {
          id: getId(),
          type: 'diamond',
          position,
          data: { 
            label: 'Diamond',
            color: selectedColor,
            onLabelChange: (newLabel: string) => {
              setNodes((nds) =>
                nds.map((node) => (node.id === newNode.id ? { ...node, data: { ...node.data, label: newLabel } } : node))
              );
            },
            onResizeStop: handleNodeResize // Pass resize handler
          },
          style: { ...sizeProps },
        };
        break;
        
      case 'sticky':
        newNode = {
          id: getId(),
          type: 'sticky',
          position,
          data: { 
            label: 'Add your notes here...',
            title: 'Note',
            color: '#FFEAA7',
            onLabelChange: (newLabel: string) => {
              setNodes((nds) =>
                nds.map((node) => (node.id === newNode.id ? { ...node, data: { ...node.data, label: newLabel } } : node))
              );
            },
            onTitleChange: (newTitle: string) => {
              setNodes((nds) =>
                nds.map((node) => (node.id === newNode.id ? { ...node, data: { ...node.data, title: newTitle } } : node))
              );
            },
            onResizeStop: handleNodeResize // Pass resize handler
          },
          style: { 
            width: sizeProps.width * 1.2, 
            height: sizeProps.height * 1.5,
            fontSize: sizeProps.fontSize,
          },
        };
        break;
        
      default:
        return null;
    }
    
    return newNode;
  }, [selectedColor, selectedSize, setNodes]);

  // Add a new node when clicking on canvas
  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (isPanMode || !selectedTool || !reactFlowWrapper.current) return;

      // Get the position where to place the new node
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlow.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Create node based on selected tool
      const newNode = createNode(position, selectedTool);
      if (newNode) {
        setNodes((nds) => [...nds, newNode]);
      }
    },
    [selectedTool, reactFlow, setNodes, isPanMode, createNode]
  );

  // --- Event Handlers --- 

  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    if (!reactFlowWrapper.current) return;

    const flowPos = reactFlow.screenToFlowPosition({
      x: event.clientX - reactFlowWrapper.current.getBoundingClientRect().left,
      y: event.clientY - reactFlowWrapper.current.getBoundingClientRect().top,
    });
    const isPaneClick = (event.target as HTMLElement).classList.contains('react-flow__pane');

    // Tool-specific logic
    switch (selectedTool) {
      case 'pencil':
      case 'line':
      case 'arrow':
        if (!isPaneClick) return; 
        // Start drawing specific element (existing logic)
        // ... (pencil start logic) ...
        if (selectedTool === 'line' || selectedTool === 'arrow') {
            setIsDrawingLine(true);
            setLineStartPos(flowPos);
            setCurrentLineEndPos(flowPos);
        }
        // Deselect others
        setNodes((nds) => nds.map(n => ({ ...n, selected: false })));
        setEdges((eds) => eds.map(e => ({ ...e, selected: false })));
        setStrokesState(strokes.map(s => ({ ...s, selected: false })));
        setLinesState(lines.map(l => ({ ...l, selected: false })));
        break;

      case 'eraser':
        // Eraser doesn't start anything on pointer down
        break;

      default: // Select tool or no tool
        if (!isPanMode) {
          const isShiftPressed = event.shiftKey;
          let elementClicked = false; 

          // --- Check for clicked element --- 
          const clickTolerance = 10 * (1 / reactFlow.getViewport().zoom);
          let clickedStroke: Stroke | null = null;
          let clickedLine: LineElement | null = null;
          // ... (stroke/line hit testing logic - find clickedStroke/clickedLine) ...
          if (clickedStroke || clickedLine) {
             elementClicked = true;
          }
          if (!isPaneClick && !elementClicked) {
             elementClicked = true; // Assume node/edge click if not pane and no stroke/line hit
          }

          // --- Update Selection States OR Start Drag Select --- 
          if (elementClicked) {
             // Handle Shift+Click or Single Click on an existing element
             // ... (existing multi-select logic based on isShiftPressed, clickedStroke, clickedLine) ...
          } else if (isPaneClick) {
             // Clicked on Pane: Start Drag Select OR Deselect All
             if (!isShiftPressed) {
                 // Deselect All
                 setNodes((nds) => nds.map(n => ({ ...n, selected: false })));
                 setEdges((eds) => eds.map(e => ({ ...e, selected: false })));
                 setStrokesState(strokes.map(s => ({ ...s, selected: false }))); 
                 setLinesState(lines.map(l => ({ ...l, selected: false })));
             }
             // Start Drag Selection Box (only if not shift-clicking background)
             if (!isShiftPressed) { 
                setIsSelectingBox(true);
                setSelectionStartPos(flowPos); // Use flow coordinates
                setSelectionEndPos(flowPos);
             }
          }
        }
        break;
    }
  }, [
    selectedTool, isPanMode, reactFlow, selectedColor, selectedSize, 
    setNodes, setEdges, 
    strokes, setStrokesState, 
    lines, setLinesState 
    // Dependencies for drawing start logic might be needed here too
  ]);

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    if (!reactFlowWrapper.current) return;
    
    const flowPos = reactFlow.screenToFlowPosition({
      x: event.clientX - reactFlowWrapper.current.getBoundingClientRect().left,
      y: event.clientY - reactFlowWrapper.current.getBoundingClientRect().top,
    });

    // --- Handle Drag Select Box --- 
    if (isSelectingBox) { // Check only isSelectingBox flag
      setSelectionEndPos(flowPos); // Update flow coordinate end position
      return; // Prevent other tool move logic during drag select
    }

    // --- Handle Tool-Specific Drawing --- 
    switch (selectedTool) {
      case 'pencil':
        if (!isDrawing) return;
        setCurrentStroke(prev => prev ? { ...prev, points: [...prev.points, [flowPos.x, flowPos.y, event.pressure ?? 0.5]] } : null);
        break;
        
      case 'line':
      case 'arrow':
        if (!isDrawingLine) return;
        setCurrentLineEndPos(flowPos); // Update the end position
        break;

      case 'eraser':
        // ... (existing eraser move logic using flowPos) ...
         if (event.buttons === 1) { 
          const eraseTolerance = 10 * (1 / reactFlow.getViewport().zoom);
          let strokeToDelete: string | null = null;
          for (const stroke of strokes) {
             if (isPointNearStroke([flowPos.x, flowPos.y], stroke.points, eraseTolerance)) {
               strokeToDelete = stroke.id;
               break; 
             }
          }
          if (strokeToDelete) {
            setStrokesState(prevStrokes => prevStrokes.filter(s => s.id !== strokeToDelete));
          }
        }
        break;

      default:
        break;
    }
  }, [
    selectedTool, isDrawing, isDrawingLine, reactFlow, strokes, setStrokesState, 
    isSelectingBox // Added selection box flag dep
    // selectionStartPos, selectionEndPos are not needed here
  ]);

  const handlePointerUp = useCallback((event: React.PointerEvent) => {
    
    // --- Finalize Drag Select Box --- 
    if (isSelectingBox && selectionStartPos && selectionEndPos) {
      const isShiftPressed = event.shiftKey;

      // Determine selection rectangle bounds in flow coordinates
      const selectionRect = {
          x: Math.min(selectionStartPos.x, selectionEndPos.x),
          y: Math.min(selectionStartPos.y, selectionEndPos.y),
          x2: Math.max(selectionStartPos.x, selectionEndPos.x),
          y2: Math.max(selectionStartPos.y, selectionEndPos.y),
      };
      
      // Prevent tiny boxes from selecting anything on just a click
      const dragThreshold = 5;
      const boxWidth = Math.abs(selectionStartPos.x - selectionEndPos.x);
      const boxHeight = Math.abs(selectionStartPos.y - selectionEndPos.y);

      if (boxWidth > dragThreshold || boxHeight > dragThreshold) {
          // Select Nodes within the box
          const selectedNodeIds = nodes
              .filter(node => {
                  const nodeWidth = parseFloat(node.style?.width as string || '') || sizeOptions.M.width; // Parse width, fallback to default
                  const nodeHeight = parseFloat(node.style?.height as string || '') || sizeOptions.M.height; // Parse height, fallback to default
                  const nodeX2 = node.position.x + nodeWidth;
                  const nodeY2 = node.position.y + nodeHeight;
                  // Check for overlap
                  return node.position.x < selectionRect.x2 && nodeX2 > selectionRect.x &&
                         node.position.y < selectionRect.y2 && nodeY2 > selectionRect.y;
              })
              .map(node => node.id);

          setNodes(nds => nds.map(n => ({ 
              ...n, 
              // Add to selection if shift pressed, otherwise replace selection
              selected: isShiftPressed ? (n.selected || selectedNodeIds.includes(n.id)) : selectedNodeIds.includes(n.id)
          })));

          // Select Strokes within the box (check bounding box overlap)
          const selectedStrokeIds = strokes
             .filter(stroke => {
                const bbox = getStrokeBoundingBox(stroke.points);
                // Ensure bbox calculation succeeded
                return bbox && 
                       bbox.minX < selectionRect.x2 && bbox.maxX > selectionRect.x &&
                       bbox.minY < selectionRect.y2 && bbox.maxY > selectionRect.y;
             })
             .map(stroke => stroke.id);
          
          setStrokesState(prevStrokes => prevStrokes.map(s => ({ 
              ...s, 
              selected: isShiftPressed ? (s.selected || selectedStrokeIds.includes(s.id)) : selectedStrokeIds.includes(s.id)
          })));
          
          // Select Lines within the box (check if either endpoint is within)
          const selectedLineIds = lines
             .filter(line => {
                const startIn = line.start.x >= selectionRect.x && line.start.x <= selectionRect.x2 && line.start.y >= selectionRect.y && line.start.y <= selectionRect.y2;
                const endIn = line.end.x >= selectionRect.x && line.end.x <= selectionRect.x2 && line.end.y >= selectionRect.y && line.end.y <= selectionRect.y2;
                // Basic check: Select if either endpoint is inside the box.
                // More robust check would involve line-rectangle intersection.
                return startIn || endIn; 
             })
             .map(line => line.id);

          setLinesState(prevLines => prevLines.map(l => ({ 
              ...l, 
              selected: isShiftPressed ? (l.selected || selectedLineIds.includes(l.id)) : selectedLineIds.includes(l.id)
          })));

          // TODO: Select Edges whose source AND target nodes are selected?
      } 
      // If the box was too small (likely a click), the deselect-all logic
      // from handlePointerDown should have already handled it if shift wasn't pressed.
      
      // Reset selection box state AFTER processing
      setIsSelectingBox(false);
      setSelectionStartPos(null);
      setSelectionEndPos(null);
      return; // Stop processing pointer up here
    }

    // --- Finalize Tool-Specific Drawing --- 
    switch (selectedTool) {
      case 'pencil':
        if (!isDrawing || !currentStroke) break;
        if (currentStroke.points.length > 1) {
          const strokePathData = getSvgPathFromStroke(
            getStroke(currentStroke.points, {
              size: currentStroke.size,
              thinning: 0.5,
              smoothing: 0.5,
              streamline: 0.5,
            })
          );
          setStrokesState([...strokes, { ...currentStroke, pathData: strokePathData }]);
        }
        break;
        
      case 'line':
      case 'arrow':
        if (!isDrawingLine || !lineStartPos || !currentLineEndPos || !selectedTool) break;
        // Finalize line/arrow data and add to state
        const newLine: LineElement = { 
          id: getId(selectedTool), // Use tool type in ID prefix
          start: lineStartPos, 
          end: currentLineEndPos, 
          type: selectedTool as 'line' | 'arrow', 
          color: selectedColor,
          size: strokeSizeMapping[selectedSize],
          selected: false
        };
        setLinesState([...lines, newLine]); // Add to line history
        break;

      default:
        break;
    }

    // Reset drawing states 
    setIsDrawing(false);
    setCurrentStroke(null);
    setIsDrawingLine(false);
    setLineStartPos(null);
    setCurrentLineEndPos(null);
    // Reset selection box state just in case
    setIsSelectingBox(false);
    setSelectionStartPos(null);
    setSelectionEndPos(null);

  }, [
    selectedTool, isDrawing, currentStroke, strokes, setStrokesState, 
    isDrawingLine, lineStartPos, currentLineEndPos, selectedColor, selectedSize, lines, setLinesState,
    isSelectingBox, selectionStartPos, selectionEndPos, reactFlow, nodes, setNodes // Added selection box state deps
    // No need for setEdges here yet
  ]);

  // Delete selected nodes/edges/strokes/lines
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete') {
        // Remove selected nodes
        setNodes((nds) => nds.filter((node) => !node.selected));
        // Remove selected edges
        setEdges((eds) => eds.filter((edge) => !edge.selected));
        // Remove selected strokes
        setStrokesState(strokes.filter((stroke) => !stroke.selected));
        // Remove selected lines
        setLinesState(lines.filter((line) => !line.selected));
      } else if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
        if (event.shiftKey) {
          // Ctrl/Cmd + Shift + Z = Redo
          handleRedo();
        } else {
          // Ctrl/Cmd + Z = Undo
          handleUndo();
        }
      } else if (event.key === 'y' && (event.ctrlKey || event.metaKey)) {
        // Ctrl/Cmd + Y = Redo
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // Add strokes state and setter to dependencies
  }, [setNodes, setEdges, handleUndo, handleRedo, strokes, setStrokesState, lines, setLinesState]); 

  // Clear all nodes, edges, strokes, lines
  const handleClearCanvas = () => {
    if (window.confirm('Are you sure you want to clear the whiteboard?')) {
      setNodes([]);
      setEdges([]);
      resetNodes([]); 
      resetEdges([]); 
      resetStrokes([]); 
      resetLines([]); // Reset line history
    }
  };

  // Duplicate selected nodes
  const handleDuplicateSelected = () => {
    const selectedNodes = nodes.filter(node => node.selected);
    if (selectedNodes.length === 0) return;
    
    const newNodes = selectedNodes.map(node => {
      const newNode = { 
        ...node, 
        id: getId(),
        selected: false,
        position: { 
          x: node.position.x + 20, 
          y: node.position.y + 20 
        }
      };
      return newNode;
    });
    
    setNodes(nodes => [...nodes, ...newNodes]);
  };

  const canUndo = canUndoNodes || canUndoEdges || canUndoStrokes || canUndoLines; // Include lines
  const canRedo = canRedoNodes || canRedoEdges || canRedoStrokes || canRedoLines; // Include lines

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin h-10 w-10 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        defaultEdgeOptions={{
          style: { strokeWidth: 2 },
          animated: false,
        }}
        proOptions={{ hideAttribution: true }}
        className={`${isDarkMode ? 'react-flow-dark-theme' : ''}`}
        panOnScroll={isPanMode}
        zoomOnScroll={isPanMode}
        panOnDrag={isPanMode || !selectedTool}
        // Add pointer event handlers for drawing
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp} // Stop drawing if pointer leaves
      >
        {/* Tools Panel - Modified Color Buttons */}
        <Panel position="top-center" className="p-1 rounded-lg bg-white dark:bg-gray-800 shadow-lg z-10 flex flex-col gap-1 items-center mt-4">
          <div className="flex gap-1 p-1">
            {colorOptions.map((color) => (
              <button
                key={color}
                className={`w-6 h-6 rounded-full transition-all border-2 ${ 
                  selectedColor === color 
                    ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-800 border-transparent' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => {
                  // Set default color for next element
                  setSelectedColor(color);
                  
                  // Update selected nodes
                  setNodes(prevNodes => prevNodes.map(node => 
                    node.selected ? { ...node, data: { ...node.data, color: color } } : node
                  ));

                  // Update selected strokes
                  setStrokesState(prevStrokes => prevStrokes.map(stroke => 
                    stroke.selected ? { ...stroke, color: color } : stroke
                  ));

                  // Update selected lines
                  setLinesState(prevLines => prevLines.map(line => 
                    line.selected ? { ...line, color: color } : line
                  ));
                }}
                title={`Set color: ${color}`}
              />
            ))}
          </div>
        </Panel>

        {/* Bottom Toolbar - Similar to TLDraw */}
        <Panel position="bottom-center" className="p-1 rounded-lg bg-white dark:bg-gray-800 shadow-lg z-10 flex gap-1 mb-4">
          <ToolbarButton 
            label="Select"
            icon={<ArrowsPointingOutIcon />}
            isActive={!selectedTool && !isPanMode}
            onClick={() => { 
              setSelectedTool(null);
              setIsPanMode(false);
            }}
          />
          <ToolbarButton 
            label="Hand Tool"
            icon={<HandRaisedIcon />}
            isActive={isPanMode}
            onClick={() => { 
              setIsPanMode(!isPanMode);
              setSelectedTool(null);
            }}
          />
          <div className="border-r border-gray-300 dark:border-gray-600 mx-1" />
          <ToolbarButton 
            label="Rectangle"
            icon={<Square2StackIcon />}
            isActive={selectedTool === 'rectangle'}
            onClick={() => {
              setSelectedTool(selectedTool === 'rectangle' ? null : 'rectangle');
              setIsPanMode(false);
            }}
          />
          <ToolbarButton 
            label="Circle"
            icon={<CircleStackIcon />}
            isActive={selectedTool === 'circle'}
            onClick={() => {
              setSelectedTool(selectedTool === 'circle' ? null : 'circle');
              setIsPanMode(false);
            }}
          />
          <ToolbarButton 
            label="Diamond"
            icon={<div className="w-5 h-5 flex items-center justify-center">
              <div className="w-4 h-4 bg-current transform rotate-45" />
            </div>}
            isActive={selectedTool === 'diamond'}
            onClick={() => {
              setSelectedTool(selectedTool === 'diamond' ? null : 'diamond');
              setIsPanMode(false);
            }}
          />
          <ToolbarButton 
            label="Text"
            icon={<DocumentTextIcon />}
            isActive={selectedTool === 'text'}
            onClick={() => {
              setSelectedTool(selectedTool === 'text' ? null : 'text');
              setIsPanMode(false);
            }}
          />
          <ToolbarButton 
            label="Sticky Note"
            icon={<DocumentDuplicateIcon />}
            isActive={selectedTool === 'sticky'}
            onClick={() => {
              setSelectedTool(selectedTool === 'sticky' ? null : 'sticky');
              setIsPanMode(false);
            }}
          />
          <div className="border-r border-gray-300 dark:border-gray-600 mx-1" />
          <ToolbarButton 
            label="Line"
            icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="16" x2="16" y2="4" /></svg>}
            isActive={selectedTool === 'line'}
            onClick={() => {
              setSelectedTool(selectedTool === 'line' ? null : 'line');
              setIsPanMode(false);
            }}
          />
          <ToolbarButton 
            label="Arrow"
            icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="16" x2="16" y2="4" /><polyline points="11,4 16,4 16,9" /></svg>}
            isActive={selectedTool === 'arrow'}
            onClick={() => {
              setSelectedTool(selectedTool === 'arrow' ? null : 'arrow');
              setIsPanMode(false);
            }}
          />
          <ToolbarButton 
            label="Pencil"
            icon={<PencilIcon />}
            isActive={selectedTool === 'pencil'}
            onClick={() => {
              setSelectedTool(selectedTool === 'pencil' ? null : 'pencil');
              setIsPanMode(false);
            }}
          />
          <ToolbarButton 
            label="Eraser"
            icon={<BackspaceIcon />}
            isActive={selectedTool === 'eraser'}
            onClick={() => {
              setSelectedTool(selectedTool === 'eraser' ? null : 'eraser');
              setIsPanMode(false);
            }}
          />
          <ToolbarButton 
            label="Undo"
            icon={<ArrowUturnLeftIcon />}
            onClick={handleUndo}
            className={`${!canUndo ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          <ToolbarButton 
            label="Redo"
            icon={<ArrowUturnRightIcon />}
            onClick={handleRedo}
            className={`${!canRedo ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          <div className="border-r border-gray-300 dark:border-gray-600 mx-1" />
          <ToolbarButton 
            label="Clear Canvas"
            icon={<TrashIcon />}
            onClick={handleClearCanvas}
          />
        </Panel>

        {/* Size options - Similar to TLDraw */}
        <Panel position="bottom-right" className="p-1 rounded-lg bg-white dark:bg-gray-800 shadow-lg z-10 mr-4 mb-20">
          <div className="flex flex-col gap-1">
            {Object.keys(sizeOptions).map((size) => (
              <button
                key={size}
                className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
                  selectedSize === size 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setSelectedSize(size as 'S' | 'M' | 'L' | 'XL')}
                title={`Size: ${size}`}
              >
                {size}
              </button>
            ))}
          </div>
        </Panel>

        {/* Instructions Panel */}
        <Panel position="bottom-right" className="p-3 rounded-md bg-white dark:bg-gray-800 shadow-lg text-xs opacity-80 hover:opacity-100 transition-opacity mr-12 mb-16">
          <h3 className="font-bold mb-1 text-gray-700 dark:text-gray-300">Keyboard Shortcuts:</h3>
          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
            <li>Delete - Remove selected</li>
            <li>Ctrl+Z - Undo</li>
            <li>Ctrl+Y - Redo</li>
            <li>Shift+Click - Multi-select</li>
          </ul>
        </Panel>

        <Controls>
          <ControlButton
            onClick={() => reactFlow.fitView({ padding: 0.2, includeHiddenNodes: false })}
            title="Fit view"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </ControlButton>
        </Controls>
        
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} color={isDarkMode ? '#444' : '#eee'} />
        <MiniMap 
          style={{ 
            height: 120,
            width: 160,
            backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
            borderRadius: '0.375rem',
          }}
          nodeColor={isDarkMode ? '#475569' : '#cbd5e1'} 
          maskColor={isDarkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(248, 250, 252, 0.7)'}
        />

        {/* Render Strokes */}
        <svg
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          className="react-flow__renderer"
        >
          <g className="react-flow__viewport react-flow__container" 
             transform={`translate(${reactFlow.getViewport().x}px, ${reactFlow.getViewport().y}px) scale(${reactFlow.getViewport().zoom})`}
          >
            {/* Render saved strokes */}
            {strokes.map(stroke => {
              // Calculate bbox only if selected
              const bbox = stroke.selected ? getStrokeBoundingBox(stroke.points) : null;
              return (
                // Use stroke.id as the key for the fragment
                <React.Fragment key={stroke.id}>
                  <path 
                    d={stroke.pathData} 
                    fill={stroke.color} 
                    stroke={stroke.color} 
                    strokeWidth={stroke.size} // Use actual stroke size
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  {/* Conditionally render bbox only if it exists (stroke is selected) */}
                  {bbox && (
                    <rect
                      x={bbox.minX - 5} 
                      y={bbox.minY - 5}
                      width={bbox.maxX - bbox.minX + 10}
                      height={bbox.maxY - bbox.minY + 10}
                      fill="none"
                      stroke="#007bff" 
                      strokeWidth={1 / reactFlow.getViewport().zoom} 
                      strokeDasharray={`4 ${4 / reactFlow.getViewport().zoom}`}
                    />
                  )}
                </React.Fragment>
              );
            })}

            {/* Render saved lines/arrows */}
            {lines.map(line => {
              const isSelected = line.selected;
              const selectionColor = "#007bff"; // Consistent selection color
              const strokeWidth = isSelected ? line.size + (2 / reactFlow.getViewport().zoom) : line.size; // Thicker when selected, adjust thickness by zoom
              const currentLineColor = isSelected ? selectionColor : line.color;
              const markerId = `arrowhead-${currentLineColor.replace('#','')}`;

              return (
                <g key={line.id}>
                  <line
                    x1={line.start.x}
                    y1={line.start.y}
                    x2={line.end.x}
                    y2={line.end.y}
                    stroke={currentLineColor}
                    strokeWidth={strokeWidth}
                    markerEnd={line.type === 'arrow' ? `url(#${markerId})` : undefined}
                    strokeLinecap="round"
                  />
                  {/* Add small circles at ends when selected */}
                  {isSelected && (
                    <>
                      <circle cx={line.start.x} cy={line.start.y} r={4 / reactFlow.getViewport().zoom} fill={selectionColor} />
                      <circle cx={line.end.x} cy={line.end.y} r={4 / reactFlow.getViewport().zoom} fill={selectionColor} />
                    </>
                  )}
                </g>
              );
            })}

            {/* Render the current stroke being drawn */}
            {currentStroke && currentStroke.points.length > 0 && (
              <path 
                d={getSvgPathFromStroke(
                  getStroke(currentStroke.points, {
                    size: currentStroke.size,
                    thinning: 0.5,
                    smoothing: 0.5,
                    streamline: 0.5,
                  })
                )}
                fill={currentStroke.color}
                stroke={currentStroke.color}
                strokeWidth={currentStroke.size} 
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Render the current line/arrow being drawn */} 
            {isDrawingLine && lineStartPos && currentLineEndPos && (
              <line
                x1={lineStartPos.x}
                y1={lineStartPos.y}
                x2={currentLineEndPos.x}
                y2={currentLineEndPos.y}
                stroke={selectedColor}
                strokeWidth={strokeSizeMapping[selectedSize]}
                markerEnd={selectedTool === 'arrow' ? `url(#arrowhead-${selectedColor.replace('#','')})` : undefined}
                strokeLinecap="round"
              />
            )}
          </g>
          
          {/* Define arrowheads for different colors */}
          <defs>
            {[...colorOptions, "#007bff"].map(color => { // Use the actual selection color hex directly
              const markerId = `arrowhead-${color.replace('#','')}`;
              return (
                <marker
                  key={markerId} // Use a unique key
                  id={markerId}
                  markerWidth="10"
                  markerHeight="7"
                  refX={5 + strokeSizeMapping.M / 2} 
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill={color} />
                </marker>
              );
            })}
          </defs>
        </svg>

      </ReactFlow>
    </div>
  );
}

// Helper function to check if a point is near a line segment
function isPointNearLine(point: { x: number, y: number }, start: { x: number, y: number }, end: { x: number, y: number }, tolerance: number): boolean {
  const { x: px, y: py } = point;
  const { x: x1, y: y1 } = start;
  const { x: x2, y: y2 } = end;

  const lenSq = Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
  if (lenSq === 0) { 
    return Math.sqrt(Math.pow(px - x1, 2) + Math.pow(py - y1, 2)) <= tolerance;
  }

  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / lenSq;
  t = Math.max(0, Math.min(1, t)); 

  const closestX = x1 + t * (x2 - x1);
  const closestY = y1 + t * (y2 - y1);

  const distSq = Math.pow(px - closestX, 2) + Math.pow(py - closestY, 2);

  return distSq <= tolerance * tolerance;
}

// Helper function to check if a point is near any point in a stroke
function isPointNearStroke(point: number[], strokePoints: number[][], tolerance: number): boolean {
  const [px, py] = point;
  for (const [sx, sy] of strokePoints) {
    const distance = Math.sqrt(Math.pow(px - sx, 2) + Math.pow(py - sy, 2));
    if (distance <= tolerance) {
      return true;
    }
  }
  return false;
}

// Helper function to calculate the bounding box of stroke points
function getStrokeBoundingBox(points: number[][]): { minX: number, minY: number, maxX: number, maxY: number } | null {
  if (points.length === 0) return null;

  let minX = points[0][0];
  let minY = points[0][1];
  let maxX = points[0][0];
  let maxY = points[0][1];

  for (let i = 1; i < points.length; i++) {
    minX = Math.min(minX, points[i][0]);
    minY = Math.min(minY, points[i][1]);
    maxX = Math.max(maxX, points[i][0]);
    maxY = Math.max(maxY, points[i][1]);
  }

  return { minX, minY, maxX, maxY };
}

// Helper function to convert stroke points to an SVG path string
// (Source: perfect-freehand documentation)
function getSvgPathFromStroke(stroke: number[][]): string {
  if (!stroke.length) return '';

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(`M ${x0},${y0} Q ${x0},${y0} ${x1},${y1}`);
      return acc;
    },
    ['']
  );

  return d.join(' ');
}

// Wrap with ReactFlowProvider
const FlowWhiteboard: React.FC<FlowWhiteboardProps> = ({ userId }) => {
  return (
    <ReactFlowProvider>
      <div className="h-full w-full">
        <FlowEditor userId={userId} />
      </div>
    </ReactFlowProvider>
  );
};

export default FlowWhiteboard; 