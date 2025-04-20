'use client';

import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '../../utils/supabase';

// Create a placeholder component for when Excalidraw is loading or fails
const ExcalidrawPlaceholder = () => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="text-center">
      <div className="animate-spin h-10 w-10 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
      <p className="mt-4">Loading Whiteboard...</p>
    </div>
  </div>
);

// Import Excalidraw with noSSR to prevent module issues at build time
const Excalidraw = dynamic(
  () => import('@excalidraw/excalidraw').then((mod) => mod.Excalidraw),
  {
    ssr: false,
    loading: () => <ExcalidrawPlaceholder />
  }
);

const ExcalidrawWhiteboard = ({ userId }: { userId?: string }) => {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [elements, setElements] = useState<any[]>([]);
  const [appState, setAppState] = useState<any | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  
  // Initialize ResizeObserver to handle container size changes
  useEffect(() => {
    if (typeof window !== 'undefined' && containerRef.current) {
      const updateDimensions = () => {
        if (containerRef.current) {
          const { width, height } = containerRef.current.getBoundingClientRect();
          setDimensions({ width, height });
        }
      };

      // Initial dimensions
      updateDimensions();

      // Set up ResizeObserver
      resizeObserverRef.current = new ResizeObserver(updateDimensions);
      resizeObserverRef.current.observe(containerRef.current);

      // Clean up
      return () => {
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
        }
      };
    }
  }, [isClient]);
  
  // Only run after client-side hydration
  useEffect(() => {
    setIsClient(true);
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Try to load from localStorage first as it's more reliable
        const savedState = localStorage.getItem('excalidraw-state');
        let loadedData = false;
        
        if (savedState) {
          try {
            const parsedState = JSON.parse(savedState);
            if (parsedState.elements) {
              setElements(parsedState.elements);
              loadedData = true;
            }
            if (parsedState.appState) {
              setAppState(parsedState.appState);
            }
          } catch (e) {
            console.error('Failed to parse saved state:', e);
          }
        }
        
        // Try Supabase only if localStorage failed and userId exists
        if (!loadedData && userId) {
          const { data, error } = await supabase
            .from('whiteboard_data')
            .select('*')
            .eq('user_id', userId)
            .single();
            
          if (data && !error) {
            const savedData = data.data;
            if (savedData && savedData.elements) {
              setElements(savedData.elements);
              if (savedData.appState) {
                setAppState(savedData.appState);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading whiteboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isClient) {
      loadData();
    }
  }, [userId, isClient]);

  // Save data function with debounce
  const saveData = useCallback((elements: any[], state: any) => {
    // Debounce saving
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(async () => {
      try {
        const dataToSave = { elements, appState: state };
        
        // Always save to localStorage
        localStorage.setItem('excalidraw-state', JSON.stringify(dataToSave));
        
        // Save to Supabase if userId available
        if (userId) {
          await supabase
            .from('whiteboard_data')
            .upsert({
              id: userId,
              user_id: userId,
              data: dataToSave,
              updated_at: new Date().toISOString()
            });
        }
      } catch (err) {
        console.error('Failed to save whiteboard data:', err);
      }
    }, 1000);
  }, [userId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, []);

  // Don't render anything on server
  if (!isClient) {
    return null;
  }

  // Get current theme from document
  const isDarkTheme = document.documentElement.classList.contains('dark');

  // Function to handle updates from Excalidraw
  const handleChange = (els: readonly any[], state: any, files?: any) => {
    setElements([...els]);
    setAppState(state);
    saveData([...els], state);
  };

  return (
    <div ref={containerRef} className="h-full w-full relative">
      {!isLoading && isClient && dimensions.width > 0 && dimensions.height > 0 && (
        <div style={{ width: '100%', height: '100%' }}>
          <CustomErrorBoundary>
            <Excalidraw
              initialData={{
                elements: elements,
                appState: appState || {
                  viewBackgroundColor: isDarkTheme ? "#1e1e1e" : "#ffffff",
                  theme: isDarkTheme ? "dark" : "light"
                }
              }}
              onChange={handleChange}
              UIOptions={{
                canvasActions: {
                  toggleTheme: true,
                  saveAsImage: true,
                  clearCanvas: true,
                  changeViewBackgroundColor: true,
                }
              }}
            />
          </CustomErrorBoundary>
        </div>
      )}
    </div>
  );
};

// Simple error boundary component
class CustomErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean, error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Excalidraw whiteboard error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full p-4">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
            <h3 className="text-red-800 dark:text-red-400 font-medium">Error loading whiteboard</h3>
            <p className="text-red-600 dark:text-red-300 text-sm">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
          </div>
          <textarea 
            className="w-full h-[calc(100%-5rem)] p-4 border rounded-lg dark:bg-gray-800 dark:text-white resize-none"
            placeholder="Use this temporary whiteboard until the issue is fixed. Your content will be saved locally."
            onChange={(e) => localStorage.setItem('fallback-notes', e.target.value)}
            defaultValue={localStorage.getItem('fallback-notes') || ''}
          />
        </div>
      );
    }
    return this.props.children;
  }
}

export default memo(ExcalidrawWhiteboard); 