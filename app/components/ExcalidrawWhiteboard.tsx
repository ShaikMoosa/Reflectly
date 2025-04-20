'use client';

import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import type { AppState } from '@excalidraw/excalidraw/types/types';
import { supabase } from '../../utils/supabase';

// Dynamically import Excalidraw to prevent SSR issues
const Excalidraw = dynamic(
  async () => {
    const mod = await import('@excalidraw/excalidraw');
    return mod.Excalidraw;
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
          <p className="mt-4">Loading Whiteboard...</p>
        </div>
      </div>
    )
  }
);

interface ExcalidrawWhiteboardProps {
  userId?: string;
}

const ExcalidrawWhiteboard: React.FC<ExcalidrawWhiteboardProps> = ({ userId }) => {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<ExcalidrawElement[]>([]);
  const [appState, setAppState] = useState<AppState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load whiteboard data from Supabase or localStorage
  useEffect(() => {
    const loadWhiteboardData = async () => {
      try {
        setIsLoading(true);
        
        // Try to load from Supabase first if userId is available
        if (userId) {
          const { data, error } = await supabase
            .from('whiteboard_data')
            .select('*')
            .eq('user_id', userId)
            .single();
            
          if (data && !error) {
            const savedData = data.data;
            if (savedData && savedData.elements) {
              // Set elements from Supabase
              setElements(savedData.elements);
              if (savedData.appState) {
                setAppState(savedData.appState);
              }
              setIsLoading(false);
              return;
            }
          }
        }
        
        // Fallback to localStorage
        const savedState = localStorage.getItem('excalidraw-state');
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          if (parsedState.elements) {
            setElements(parsedState.elements);
          }
          if (parsedState.appState) {
            setAppState(parsedState.appState);
          }
        }
      } catch (error) {
        console.error('Error loading whiteboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWhiteboardData();
  }, [userId]);

  // Save whiteboard data to Supabase and localStorage
  const saveWhiteboardData = useCallback(async (elements: readonly ExcalidrawElement[], appState: AppState) => {
    try {
      if (isLoading) return;

      const dataToSave = { elements, appState };
      
      // Always save to localStorage as backup
      localStorage.setItem('excalidraw-state', JSON.stringify(dataToSave));
      
      // Save to Supabase if userId is available
      if (userId) {
        const { error } = await supabase
          .from('whiteboard_data')
          .upsert({
            id: userId, // Use userId as the primary key
            user_id: userId,
            data: dataToSave,
            updated_at: new Date().toISOString()
          });
          
        if (error) {
          console.error('Error saving whiteboard data to Supabase:', error);
        }
      }
    } catch (error) {
      console.error('Error saving whiteboard data:', error);
    }
  }, [isLoading, userId]);

  // Handle changes in elements
  const handleChange = useCallback((elements: readonly ExcalidrawElement[], state: AppState) => {
    setElements([...elements]);
    setAppState(state);
    
    // Debounce saving to avoid excessive API calls
    const timeoutId = setTimeout(() => {
      saveWhiteboardData(elements, state);
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [saveWhiteboardData]);

  // Theme support
  const isDarkMode = document.documentElement.classList.contains('dark');

  return (
    <div ref={containerRef} className="h-full w-full relative">
      {!isLoading && (
        <Excalidraw
          initialData={{
            elements,
            appState: appState || {
              viewBackgroundColor: isDarkMode ? "#1e1e1e" : "#ffffff",
              theme: isDarkMode ? "dark" : "light"
            },
          }}
          onChange={handleChange}
          UIOptions={{
            canvasActions: {
              saveToActiveFile: true,
              toggleTheme: true,
              saveAsImage: true,
              clearCanvas: true,
              changeViewBackgroundColor: true,
            }
          }}
        />
      )}
    </div>
  );
};

// Export as memoized component to prevent unnecessary re-renders
export default memo(ExcalidrawWhiteboard); 