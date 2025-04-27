import { useState, useRef } from 'react';
import { Palette } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { useWhiteboardStore } from '../store/useWhiteboardStore';
import { useOnClickOutside } from '../hooks/useOnClickOutside';

const DEFAULT_COLORS = [
  '#000000', // Black
  '#ffffff', // White
  '#ff0000', // Red
  '#00ff00', // Green
  '#0000ff', // Blue
  '#ffff00', // Yellow
  '#ff00ff', // Magenta
  '#00ffff', // Cyan
  '#ff8000', // Orange
  '#8000ff', // Purple
];

export default function ColorPicker() {
  const { currentColor, setCurrentColor } = useWhiteboardStore();
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useOnClickOutside(pickerRef, () => setIsOpen(false));

  const togglePicker = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={pickerRef}>
      <button
        className="flex items-center justify-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg m-1 transition-colors"
        onClick={togglePicker}
        style={{ backgroundColor: isOpen ? 'rgba(0,0,0,0.05)' : undefined }}
        title="Color Picker"
      >
        <div 
          className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600" 
          style={{ backgroundColor: currentColor }}
        />
        <Palette size={20} className="ml-2 text-gray-700 dark:text-gray-200" />
      </button>
      
      {isOpen && (
        <div className="absolute top-14 left-0 z-20 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
          <HexColorPicker 
            color={currentColor} 
            onChange={setCurrentColor} 
          />
          
          <div className="mt-3 flex flex-wrap gap-2">
            {DEFAULT_COLORS.map((color) => (
              <button
                key={color}
                className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 cursor-pointer hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => {
                  setCurrentColor(color);
                  setIsOpen(false);
                }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 