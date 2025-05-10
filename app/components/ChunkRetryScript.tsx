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
        // Check if already installed
        if (window.__CHUNK_RETRY_INSTALLED) return;
        window.__CHUNK_RETRY_INSTALLED = true;
        
        // Track retry attempts
        window.__CHUNK_RETRY_COUNT = window.__CHUNK_RETRY_COUNT || {};
        
        // Maximum retry attempts per chunk
        const MAX_RETRIES = 5;
        
        // Critical chunks that need special handling
        const CRITICAL_CHUNKS = ['layout', 'app-layout', 'main', 'webpack'];
        
        // Increase timeout for fetching chunks
        if (window.__webpack_require__) {
          window.__webpack_require__.p = window.__webpack_require__.p || '';
          const originalLoadScript = window.__webpack_require__.l;
          window.__webpack_require__.l = function(url, done, key, chunkId) {
            // Increase timeout for layout chunks
            const timeout = CRITICAL_CHUNKS.some(c => chunkId && chunkId.includes(c)) ? 30000 : 120000;
            const script = document.createElement('script');
            script.src = url;
            script.onerror = script.onload = function() {
              script.onerror = script.onload = null;
              done(key);
            };
            document.head.appendChild(script);
            setTimeout(() => {
              if (script.onerror) {
                console.error('Chunk load timeout exceeded:', url);
                script.onerror();
              }
            }, timeout);
          };
        }
        
        // Store original webpack chunk load function
        let originalLoad = null;
        
        // Find the webpack chunk loader
        if (window.webpackChunk_N_E && window.webpackChunk_N_E[0] && window.webpackChunk_N_E[0][1]) {
          originalLoad = window.webpackChunk_N_E[0][1];
          
          // Override the webpack chunk load function
          window.webpackChunk_N_E[0][1] = function(chunkId) {
            console.log('Attempting to load chunk:', chunkId);
            
            // Initialize retry count for this chunk
            window.__CHUNK_RETRY_COUNT[chunkId] = window.__CHUNK_RETRY_COUNT[chunkId] || 0;
            
            return originalLoad(chunkId)
              .catch(error => {
                // Check if error is ChunkLoadError
                if (error && 
                    ((typeof error === 'object' && 'message' in error && 
                      typeof error.message === 'string' && 
                      (error.message.includes('ChunkLoadError') || 
                       error.message.includes('Loading chunk') || 
                       error.message.includes('Failed to fetch'))) ||
                     (typeof error === 'string' && 
                      (error.includes('ChunkLoadError') || 
                       error.includes('Loading chunk') || 
                       error.includes('Failed to fetch'))))) {
                  
                  console.error('Chunk load error for:', chunkId, error);
                  
                  // Special handling for critical chunks
                  const isCriticalChunk = CRITICAL_CHUNKS.some(c => chunkId.includes(c));
                  const maxRetries = isCriticalChunk ? MAX_RETRIES : 3;
                  
                  if (window.__CHUNK_RETRY_COUNT[chunkId] < maxRetries) {
                    window.__CHUNK_RETRY_COUNT[chunkId]++;
                    console.log(\`Retrying chunk \${chunkId}, attempt \${window.__CHUNK_RETRY_COUNT[chunkId]}\`);
                    
                    // Clean webpack chunk cache for this chunk
                    if (window.__webpack_require__) {
                      // Clean modules cache
                      if (window.__webpack_require__.c) {
                        Object.keys(window.__webpack_require__.c).forEach(moduleId => {
                          if (moduleId.includes(chunkId)) {
                            delete window.__webpack_require__.c[moduleId];
                          }
                        });
                      }
                      
                      // Clean chunks cache
                      if (window.__webpack_require__.m) {
                        Object.keys(window.__webpack_require__.m).forEach(moduleId => {
                          if (moduleId.includes(chunkId)) {
                            delete window.__webpack_require__.m[moduleId];
                          }
                        });
                      }
                    }
                    
                    // For critical chunks with multiple failures, take more drastic actions
                    if (isCriticalChunk && window.__CHUNK_RETRY_COUNT[chunkId] >= 3) {
                      console.log('Critical chunk failed multiple times, will refresh page soon...');
                      // Set a flag to indicate a critical failure
                      window.__CRITICAL_CHUNK_FAILURE = true;
                      
                      // On last attempt before page reload, try clearing more aggressively
                      if (window.__CHUNK_RETRY_COUNT[chunkId] === maxRetries - 1) {
                        // Clear localStorage cache
                        try {
                          const cacheKeys = Object.keys(localStorage).filter(k => 
                            k.includes('next-') || k.includes('_N_')
                          );
                          cacheKeys.forEach(k => localStorage.removeItem(k));
                          console.log('Cleared localStorage cache items:', cacheKeys.length);
                        } catch (e) {
                          console.error('Error clearing localStorage:', e);
                        }
                      }
                      
                      // On final retry, reload the page
                      if (window.__CHUNK_RETRY_COUNT[chunkId] === maxRetries) {
                        console.log('Max retries reached for critical chunk, refreshing page...');
                        setTimeout(() => {
                          window.location.reload();
                        }, 1000);
                        return Promise.reject(error);
                      }
                    }
                    
                    // Retry the chunk load after a delay that increases with retry count
                    return new Promise(resolve => {
                      const delay = 1000 * Math.pow(1.5, window.__CHUNK_RETRY_COUNT[chunkId] - 1);
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
          
          console.log('Enhanced chunk retry handler installed');
        } else {
          console.warn('Could not find webpack chunk loader to override');
        }
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