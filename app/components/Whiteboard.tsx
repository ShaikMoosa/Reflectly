'use client';

import React, { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';

// This component will house the tldraw whiteboard
// Once the tldraw package is installed, we'll uncomment and use the actual component
// import { Tldraw } from '@tldraw/tldraw';
// import '@tldraw/tldraw/tldraw.css';

type WhiteboardProps = {
  isDarkMode: boolean;
};

const Whiteboard = ({ isDarkMode }: WhiteboardProps) => {
  const [isTldrawInstalled, setIsTldrawInstalled] = useState(false);

  // Check if tldraw is available - this is a simulated check
  useEffect(() => {
    // In a real implementation, we wouldn't need this check
    try {
      // This is a placeholder - in reality we'd check if the module is available
      // const tldraw = require('@tldraw/tldraw');
      // setIsTldrawInstalled(true);
      setIsTldrawInstalled(false); // Set to false until package is installed
    } catch (error) {
      setIsTldrawInstalled(false);
    }
  }, []);

  return (
    <div className="whiteboard-container">
      {isTldrawInstalled ? (
        // Once tldraw is installed, uncomment this section
        // <Tldraw
        //   theme={isDarkMode ? 'dark' : 'light'}
        //   className="tldraw"
        // />
        <div>tldraw would render here</div>
      ) : (
        <div className="whiteboard-placeholder">
          <Pencil size={48} className="mb-4 text-secondary" />
          <p className="text-center text-secondary">
            Whiteboard functionality will be available once the tldraw package is installed.
            <br />
            <code className="text-sm">npm install @tldraw/tldraw</code>
          </p>
        </div>
      )}
    </div>
  );
};

export default Whiteboard; 