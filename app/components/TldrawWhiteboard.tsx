'use client';

import React, { useRef } from 'react';
import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { useTheme } from 'next-themes';

interface TldrawWhiteboardProps {
  projectId?: string;
}

export const TldrawWhiteboard: React.FC<TldrawWhiteboardProps> = ({ projectId }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);

  // Using localStorage as storage medium
  const storageId = `tldraw-${projectId || 'default'}`;

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden">
      <Tldraw
        showMenu={true}
        showPages={true}
        showTools={true}
        showUI={true}
        darkMode={isDarkMode}
      />
    </div>
  );
};

export default TldrawWhiteboard; 