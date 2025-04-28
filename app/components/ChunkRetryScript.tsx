'use client';

import { useEffect } from 'react';

export default function ChunkRetryScript() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Create and inject the retry script
    const script = document.createElement('script');
    script.id = 'chunk-retry-script';
    script.innerHTML = `
      (function() {
        // Track retry attempts
        window.__CHUNK_RETRY_COUNT = window.__CHUNK_RETRY_COUNT || {};
        
        // Maximum retry attempts per chunk
        const MAX_RETRIES = 3;
        
        // Store original webpack chunk load function
        const originalLoad = window.webpackChunk_N_E[0][1];
        
        // Override the webpack chunk load function
        window.webpackChunk_N_E[0][1] = function(chunkId) {
          console.log('Attempting to load chunk:', chunkId);
          
          return originalLoad(chunkId)
            .catch(error => {
              // Check if error is ChunkLoadError
              if (error && error.message && error.message.includes('ChunkLoadError')) {
                console.error('Chunk load error for:', chunkId, error);
                
                // Initialize retry count for this chunk
                window.__CHUNK_RETRY_COUNT[chunkId] = window.__CHUNK_RETRY_COUNT[chunkId] || 0;
                
                // Special handling for critical chunks like layout.js
                const isLayoutChunk = chunkId.includes('layout');
                const maxRetries = isLayoutChunk ? 5 : MAX_RETRIES;
                
                if (window.__CHUNK_RETRY_COUNT[chunkId] < maxRetries) {
                  window.__CHUNK_RETRY_COUNT[chunkId]++;
                  console.log(\`Retrying chunk \${chunkId}, attempt \${window.__CHUNK_RETRY_COUNT[chunkId]}\`);
                  
                  // Clean webpack chunk cache for this chunk
                  Object.keys(__webpack_require__.m).forEach(moduleId => {
                    if (moduleId.includes(chunkId)) {
                      delete __webpack_require__.m[moduleId];
                    }
                  });
                  
                  // For layout chunks, reload the page if multiple retries fail
                  if (isLayoutChunk && window.__CHUNK_RETRY_COUNT[chunkId] >= 3) {
                    console.log('Critical layout chunk failed multiple times, refreshing page...');
                    setTimeout(() => {
                      window.location.reload();
                    }, 1000);
                    return Promise.reject(error);
                  }
                  
                  // Retry the chunk load after a short delay
                  return new Promise(resolve => {
                    const delay = 1000 * window.__CHUNK_RETRY_COUNT[chunkId];
                    setTimeout(() => {
                      resolve(originalLoad(chunkId));
                    }, delay);
                  });
                }
              }
              
              // If not a chunk error or max retries exceeded, propagate the error
              return Promise.reject(error);
            });
        };
        
        console.log('Chunk retry handler installed');
      })();
    `;
    
    // Add the script to the document head
    if (!document.getElementById('chunk-retry-script')) {
      document.head.appendChild(script);
    }
    
    return () => {
      // Clean up script when component unmounts
      const existingScript = document.getElementById('chunk-retry-script');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);
  
  return null;
} 