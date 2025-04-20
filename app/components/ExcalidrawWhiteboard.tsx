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
  async () => {
    // Wait 100ms to ensure window is fully initialized
    await new Promise(resolve => setTimeout(resolve, 100));
    // Only import in client environment
    if (typeof window !== 'undefined') {
      try {
        // Try to import excalidraw
        const { Excalidraw } = await import('@excalidraw/excalidraw');
        return Excalidraw;
      } catch (err) {
        console.error('Failed to load Excalidraw:', err);
        return ExcalidrawPlaceholder;
      }
    }
    return ExcalidrawPlaceholder;
  },
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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
    };
  }, []);

  // Don't render anything on server
  if (!isClient) {
    return null;
  }

  // Get current theme from document
  const isDarkTheme = document.documentElement.classList.contains('dark');

  // Excalidraw props
  const excalidrawProps: any = {
    initialData: {
      elements: elements,
      appState: appState || {
        viewBackgroundColor: isDarkTheme ? "#1e1e1e" : "#ffffff",
        theme: isDarkTheme ? "dark" : "light"
      }
    },
    onChange: (els: any[], state: any) => {
      setElements([...els]);
      setAppState(state);
      saveData(els, state);
    },
    UIOptions: {
      canvasActions: {
        toggleTheme: true,
        saveAsImage: true,
        clearCanvas: true,
        changeViewBackgroundColor: true,
      }
    }
  };

  return (
    <div className="h-full w-full relative">
      {!isLoading && isClient && React.createElement(Excalidraw, excalidrawProps)}
    </div>
  );
};

export default memo(ExcalidrawWhiteboard); 