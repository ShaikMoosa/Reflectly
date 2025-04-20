'use client';

import React, { useEffect } from 'react';
import { useBoardStore, Shape } from '../stores/useBoardStore';
import Board from './whiteboard/Board';
import Toolbar from './whiteboard/Toolbar';
import { supabase } from '../../utils/supabase';

interface CustomWhiteboardProps {
  userId?: string;
}

const CustomWhiteboard: React.FC<CustomWhiteboardProps> = ({ userId }) => {
  const { 
    shapes, 
    loadShapes, 
    clearShapes 
  } = useBoardStore();

  // Initialize and load data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to load from localStorage first
        const savedShapes = localStorage.getItem('whiteboard-shapes');
        let loadedData = false;
        
        if (savedShapes) {
          try {
            const parsedShapes = JSON.parse(savedShapes);
            if (Array.isArray(parsedShapes)) {
              loadShapes(parsedShapes);
              loadedData = true;
            }
          } catch (e) {
            console.error('Failed to parse saved whiteboard shapes:', e);
          }
        }
        
        // Try Supabase only if localStorage failed and userId exists
        if (!loadedData && userId) {
          const { data, error } = await supabase
            .from('whiteboard_data')
            .select('*')
            .eq('user_id', userId)
            .single();
            
          if (data && !error && data.data && data.data.shapes) {
            loadShapes(data.data.shapes);
          }
        }
      } catch (error) {
        console.error('Error loading whiteboard data:', error);
      }
    };

    loadData();
  }, [userId, loadShapes]);

  // Save data to Supabase when shapes change
  useEffect(() => {
    const saveData = async () => {
      if (!userId || shapes.length === 0) return;
      
      try {
        await supabase
          .from('whiteboard_data')
          .upsert({
            id: userId,
            user_id: userId,
            data: { shapes },
            updated_at: new Date().toISOString()
          });
      } catch (err) {
        console.error('Failed to save whiteboard data to Supabase:', err);
      }
    };
    
    const debounce = setTimeout(() => {
      saveData();
    }, 1000);
    
    return () => clearTimeout(debounce);
  }, [shapes, userId]);

  const handleClearBoard = () => {
    if (window.confirm('Are you sure you want to clear the whiteboard?')) {
      clearShapes();
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-white dark:bg-gray-900">
      <Board />
      <Toolbar onClear={handleClearBoard} />
      
      {/* Instructions overlay */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 p-3 rounded shadow-md text-xs opacity-80 hover:opacity-100 transition-opacity">
        <h3 className="font-bold mb-1">Keyboard Shortcuts:</h3>
        <ul className="space-y-1">
          <li>Delete - Remove selected shape</li>
          <li>Pan Tool + Mouse Wheel - Zoom in/out</li>
        </ul>
      </div>
    </div>
  );
};

export default CustomWhiteboard; 