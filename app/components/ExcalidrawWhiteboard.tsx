'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { exportToSvg } from '@excalidraw/excalidraw';
import { supabase } from '@/utils/supabase';
import { v4 as uuidv4 } from 'uuid';

// Use any types to avoid typing issues with the new version of Excalidraw
type ExcalidrawImperativeAPI = any;
type ExcalidrawInitialDataState = any;

// Import Excalidraw with no SSR to prevent hydration errors
const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin h-10 w-10 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    ),
  }
);

interface ExcalidrawWhiteboardProps {
  userId?: string;
}

export default function ExcalidrawWhiteboard({ userId }: ExcalidrawWhiteboardProps) {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [whiteboardId, setWhiteboardId] = useState<string | null>(null);
  const excalidrawRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const [excalidrawData, setExcalidrawData] = useState<ExcalidrawInitialDataState | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  // Set API reference
  const excalidrawAPIRef = useCallback((api: ExcalidrawImperativeAPI) => {
    excalidrawRef.current = api;
  }, []);

  // Load data from Supabase
  const loadDataFromSupabase = async () => {
    if (!userId) {
      // If no userId, try to load from localStorage as fallback
      try {
        const savedData = localStorage.getItem('excalidraw-data');
        if (savedData) {
          setExcalidrawData(JSON.parse(savedData));
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading whiteboard data from localStorage:', error);
        setIsLoading(false);
      }
      return;
    }

    try {
      setIsLoading(true);
      // Check if user has existing whiteboard data
      const { data, error } = await supabase
        .from('whiteboard_data')
        .select('id, data')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // User has existing whiteboard data
        setWhiteboardId(data.id);
        setExcalidrawData(data.data);
      } else {
        // Create a new whiteboard entry
        const newId = uuidv4();
        setWhiteboardId(newId);
        
        // Initialize with empty data
        const initialData = { elements: [], appState: {}, files: {} };
        
        const { error: insertError } = await supabase
          .from('whiteboard_data')
          .insert({
            id: newId,
            user_id: userId,
            data: initialData
          });
          
        if (insertError) throw insertError;
        setExcalidrawData(initialData);
      }
    } catch (error) {
      console.error('Error loading whiteboard data from Supabase:', error);
      // Fallback to localStorage if Supabase fails
      try {
        const savedData = localStorage.getItem('excalidraw-data');
        if (savedData) {
          setExcalidrawData(JSON.parse(savedData));
        }
      } catch (localError) {
        console.error('Error loading fallback whiteboard data:', localError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Set up client-side only rendering
  useEffect(() => {
    setIsClient(true);
    loadDataFromSupabase();
  }, [userId]);
  
  // Auto-save data when it changes
  const handleChange = async (elements: any, appState: any, files: any) => {
    const data = { elements, appState, files };
    
    // Always save to localStorage as backup
    try {
      localStorage.setItem('excalidraw-data', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving whiteboard data to localStorage:', error);
    }
    
    // Save to Supabase if user is authenticated
    if (userId && whiteboardId) {
      setSaveStatus('saving');
      try {
        const { error } = await supabase
          .from('whiteboard_data')
          .update({ 
            data,
            updated_at: new Date().toISOString()
          })
          .eq('id', whiteboardId)
          .eq('user_id', userId);
          
        if (error) throw error;
        setSaveStatus('saved');
      } catch (error) {
        console.error('Error saving whiteboard data to Supabase:', error);
        setSaveStatus('error');
      }
    }
  };
  
  // Handle clear board action
  const handleClearBoard = async () => {
    if (excalidrawRef.current) {
      excalidrawRef.current.resetScene();
      
      // Also clear in database if user is authenticated
      if (userId && whiteboardId) {
        setSaveStatus('saving');
        try {
          const emptyData = { elements: [], appState: {}, files: {} };
          const { error } = await supabase
            .from('whiteboard_data')
            .update({ 
              data: emptyData,
              updated_at: new Date().toISOString()
            })
            .eq('id', whiteboardId)
            .eq('user_id', userId);
            
          if (error) throw error;
          setSaveStatus('saved');
        } catch (error) {
          console.error('Error clearing whiteboard data in Supabase:', error);
          setSaveStatus('error');
        }
      }
    }
  };
  
  // Handle export as SVG
  const handleExportSVG = async () => {
    if (!excalidrawRef.current) return;
    
    const isDarkMode = document.documentElement.classList.contains('dark');
    const currentAppState = excalidrawRef.current.getAppState();
    
    const svg = await exportToSvg({
      elements: excalidrawRef.current.getSceneElements(),
      appState: {
        ...currentAppState,
        exportWithDarkMode: isDarkMode,
        viewBackgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
      },
      files: excalidrawRef.current.getFiles(),
    });
    
    // Create a download link
    const link = document.createElement('a');
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    link.href = URL.createObjectURL(blob);
    link.download = `whiteboard-${new Date().toISOString().slice(0, 10)}.svg`;
    link.click();
  };

  if (!isClient || isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin h-10 w-10 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full w-full">
      <div className="p-4 flex justify-between items-center bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Whiteboard</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            {saveStatus === 'saving' && (
              <span className="text-yellow-500">Saving...</span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-green-500">All changes saved</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-red-500">Error saving</span>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleClearBoard}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded"
            >
              Clear
            </button>
            <button 
              onClick={handleExportSVG}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
            >
              Export as SVG
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden">
        <Excalidraw
          excalidrawAPI={excalidrawAPIRef}
          initialData={{
            appState: {
              ...(excalidrawData?.appState || {}),
              collaborators: Array.isArray(excalidrawData?.appState?.collaborators) 
                ? excalidrawData.appState.collaborators 
                : []
            },
            elements: excalidrawData?.elements || [],
            files: excalidrawData?.files || {}
          }}
          onChange={handleChange}
          theme={document.documentElement.classList.contains('dark') ? "dark" : "light"}
          gridModeEnabled={true}
        />
      </div>
    </div>
  );
} 