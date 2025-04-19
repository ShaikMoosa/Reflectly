'use client';

import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import { useTheme } from 'next-themes';

// Creating a placeholder for Excalidraw since we couldn't install it yet
// This component will handle the integration once Excalidraw is available
function ExcalidrawWhiteboard() {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>('rectangle');
  const [selectedColor, setSelectedColor] = useState<string>('#f87171'); // Red

  // Simulate loading for now - in reality, this would be replaced with actual
  // Excalidraw loading and initialization code
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Set up the container size
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      // This would update Excalidraw's dimensions when container resizes
    });
    
    resizeObserver.observe(containerRef.current);
    
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  // Handle tool selection
  const handleToolSelect = useCallback((tool: string) => {
    setSelectedTool(tool);
  }, []);

  // Handle color selection
  const handleColorSelect = useCallback((color: string) => {
    setSelectedColor(color);
  }, []);

  // Render toolbar button with memoization
  const ToolbarButton = memo(({ icon, tool }: { icon: React.ReactNode, tool: string }) => (
    <button 
      className={`p-2 rounded transition-all ${
        selectedTool === tool 
          ? 'bg-gray-200 dark:bg-gray-700' 
          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
      onClick={() => handleToolSelect(tool)}
    >
      {icon}
    </button>
  ));

  // Render color button with memoization
  const ColorButton = memo(({ color }: { color: string }) => (
    <button 
      className={`w-6 h-6 rounded-full transition-all ${
        selectedColor === color ? 'ring-2 ring-gray-400 dark:ring-gray-300' : ''
      }`}
      style={{ backgroundColor: color }}
      onClick={() => handleColorSelect(color)}
    />
  ));

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full flex flex-col overflow-hidden bg-white dark:bg-gray-800 rounded-lg"
    >
      {!isLoaded ? (
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-center">
            <div className="animate-spin h-10 w-10 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
            <p className="mt-4">Loading Whiteboard...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Excalidraw placeholder UI that matches Notion's aesthetic */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-2 flex items-center justify-between">
            <div className="flex space-x-2">
              <ToolbarButton 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3h18v18H3z"></path>
                  </svg>
                } 
                tool="rectangle"
              />
              <ToolbarButton 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg>
                } 
                tool="circle"
              />
              <ToolbarButton 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                } 
                tool="line"
              />
              <ToolbarButton 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                } 
                tool="arrow"
              />
              <ToolbarButton 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                } 
                tool="pencil"
              />
              <ToolbarButton 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                } 
                tool="text"
              />
            </div>
            
            <div className="flex space-x-2">
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded p-1">
                <ColorButton color="#f87171" />
                <ColorButton color="#facc15" />
                <ColorButton color="#4ade80" />
                <ColorButton color="#60a5fa" />
                <ColorButton color="#c084fc" />
              </div>
              <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
              </button>
              <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Save as favorite">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
          
          <div className="flex-1 relative bg-gray-50 dark:bg-gray-900">
            {/* This is where the actual Excalidraw canvas would be rendered */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center max-w-md px-4">
                <h3 className="text-xl font-medium mb-2">Excalidraw Whiteboard</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  Once Excalidraw is properly installed, you'll be able to create beautiful drawings and diagrams right here.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="border border-gray-200 dark:border-gray-700 p-3 rounded-lg text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                      <path d="m9 12 2 2 4-4"></path>
                    </svg>
                    <span className="text-sm">Draw shapes</span>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-700 p-3 rounded-lg text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                      <path d="M8 12h8"></path>
                      <path d="M12 8v8"></path>
                    </svg>
                    <span className="text-sm">Add text</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    To install Excalidraw, run:
                    <code className="block mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-left overflow-x-auto">
                      npm install @excalidraw/excalidraw
                    </code>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 p-2 flex justify-between">
            <div className="flex space-x-2">
              <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Download">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </button>
              <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Refresh">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10"></polyline>
                  <polyline points="23 20 23 14 17 14"></polyline>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                </svg>
              </button>
            </div>
            
            <div className="flex space-x-2">
              <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Undo">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Redo">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export as memoized component to prevent unnecessary re-renders
export default memo(ExcalidrawWhiteboard); 