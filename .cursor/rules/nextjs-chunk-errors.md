---
description: Solving Next.js ChunkLoadError issues
globs: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"]
alwaysApply: false
---

# Next.js ChunkLoadError Troubleshooting

## Common Error Messages

```
Unhandled Runtime Error
ChunkLoadError: Loading chunk app/layout failed.
(timeout: http://localhost:3000/_next/static/chunks/app/layout.js)
```

```
TypeError: Cannot read properties of null (reading '1')
at Object.name [as getName] (E:\path\to\project\next.config.js:42:95)
```

## Root Causes

The `ChunkLoadError` occurs when Next.js cannot load JavaScript chunks properly. Common causes include:

1. **Build Cache Corruption**: Next.js cache may have incomplete or corrupted files
2. **Network Timeout**: Slow network or large bundle causing timeouts
3. **Memory Constraints**: Server running out of memory during build/development
4. **Resource Conflicts**: Files being used by other processes
5. **Circular Dependencies**: Module dependencies forming loops
6. **Webpack Configuration Issues**: Errors in custom webpack configuration
7. **Port Conflicts**: Multiple processes trying to use the same port

## Quick Solutions (Try in Order)

### 1. Clear Next.js Cache and Restart

```bash
# Stop the development server first, then:
rm -rf .next
# Or on Windows PowerShell:
Remove-Item -Recurse -Force .next

# Restart the development server
npm run dev
```

### 2. Fix Port Conflicts

```bash
# Check for processes using your port (default 3000)
# On Windows:
netstat -ano | findstr :3000
# Kill the process if needed:
taskkill /PID <PID> /F

# Use a different port
npm run dev -- -p 3002
```

### 3. Simplify Webpack Configuration

If you have a custom webpack configuration causing issues:

```javascript
// next.config.js - Safe webpack configuration
webpack: (config, { isServer }) => {
  if (!isServer) {
    // Increase chunk timeout
    config.output.chunkLoadTimeout = 120000;
    
    // Safe chunk naming for libraries
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        lib: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // Safe check for module.context to avoid errors
            if (!module.context) return 'lib';
            
            const contextMatch = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
            if (!contextMatch) return 'lib';
            
            const packageName = contextMatch[1];
            return `npm.${packageName.replace('@', '')}`;
          },
          priority: 30,
          minChunks: 1,
          reuseExistingChunk: true,
        }
      }
    };
  }
  return config;
}
```

### 4. Increase Memory Allocation

```bash
# Increase Node.js memory limit
cross-env NODE_OPTIONS="--max-old-space-size=8192" npm run dev
```

### 5. Implement Client-Side Error Handling

Create a ChunkErrorBoundary component to recover from chunk loading errors:

```typescript
// app/components/ChunkErrorBoundary.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChunkErrorBoundary({ children }) {
  const router = useRouter();
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  useEffect(() => {
    // Track chunk load attempts
    window.__CHUNK_RETRY_COUNT = window.__CHUNK_RETRY_COUNT || {};
    
    const handleChunkError = (event) => {
      const isChunkError = 
        event.error?.message?.includes('ChunkLoadError') || 
        event.message?.includes('ChunkLoadError') || 
        event.error?.message?.includes('Failed to fetch');
        
      if (isChunkError) {
        console.error('Chunk loading error detected:', event);
        setHasError(true);
        setRetryCount(prev => prev + 1);
        
        event.preventDefault();
        
        if (retryCount >= 3) {
          // Hard reload after multiple failures
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          // Try soft refresh first
          setTimeout(() => {
            router.refresh();
          }, 500);
        }
      }
    };
    
    window.addEventListener('error', handleChunkError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);
    
    return () => {
      window.removeEventListener('error', handleChunkError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    };
  }, [router, retryCount]);
  
  if (hasError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Loading content...</h2>
          <p className="mb-4">
            Please wait while we refresh the page. {retryCount > 0 ? `(Attempt ${retryCount})` : ''}
          </p>
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}
```

Then use it in your layout:

```typescript
// app/layout.tsx
import ChunkErrorBoundary from './components/ChunkErrorBoundary';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ChunkErrorBoundary>
          {children}
        </ChunkErrorBoundary>
      </body>
    </html>
  );
}
```

### 6. Implement Enhanced Chunk Retry Script

Create a script to automatically retry loading chunks that fail:

```typescript
// app/components/ChunkRetryScript.tsx
'use client';

import { useEffect } from 'react';

export default function ChunkRetryScript() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.id = 'chunk-retry-script';
    script.innerHTML = `
      (function() {
        if (window.__CHUNK_RETRY_INSTALLED) return;
        window.__CHUNK_RETRY_INSTALLED = true;
        
        window.__CHUNK_RETRY_COUNT = window.__CHUNK_RETRY_COUNT || {};
        
        const MAX_RETRIES = 5;
        const CRITICAL_CHUNKS = ['layout', 'app-layout', 'main', 'webpack'];
        
        // Increase timeout for fetching chunks
        if (window.__webpack_require__) {
          window.__webpack_require__.p = window.__webpack_require__.p || '';
          const originalLoadScript = window.__webpack_require__.l;
          window.__webpack_require__.l = function(url, done, key, chunkId) {
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
        
        // Override webpack chunk load function if available
        if (window.webpackChunk_N_E && window.webpackChunk_N_E[0] && window.webpackChunk_N_E[0][1]) {
          const originalLoad = window.webpackChunk_N_E[0][1];
          
          window.webpackChunk_N_E[0][1] = function(chunkId) {
            window.__CHUNK_RETRY_COUNT[chunkId] = window.__CHUNK_RETRY_COUNT[chunkId] || 0;
            
            return originalLoad(chunkId).catch(error => {
              const isChunkError = error && 
                (error.message?.includes('ChunkLoadError') || 
                 error.toString().includes('ChunkLoadError'));
                
              if (isChunkError && window.__CHUNK_RETRY_COUNT[chunkId] < MAX_RETRIES) {
                window.__CHUNK_RETRY_COUNT[chunkId]++;
                console.log(\`Retrying chunk \${chunkId}, attempt \${window.__CHUNK_RETRY_COUNT[chunkId]}\`);
                
                const delay = 1000 * Math.pow(1.5, window.__CHUNK_RETRY_COUNT[chunkId] - 1);
                return new Promise(resolve => {
                  setTimeout(() => resolve(originalLoad(chunkId)), delay);
                });
              }
              
              return Promise.reject(error);
            });
          };
        }
      })();
    `;
    
    if (!document.getElementById('chunk-retry-script')) {
      document.head.appendChild(script);
    }
    
    return () => {
      const existingScript = document.getElementById('chunk-retry-script');
      if (existingScript) existingScript.remove();
    };
  }, []);
  
  return null;
}
```

Add to your layout:

```typescript
// app/layout.tsx
import ChunkRetryScript from './components/ChunkRetryScript';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <ChunkRetryScript />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
```

### 7. Check for Circular Dependencies

Use the `madge` tool to identify circular dependencies:

```bash
# Install madge
npm install -g madge

# Check for circular dependencies
madge --circular --extensions js,jsx,ts,tsx ./app
```

### 8. Simplify Critical Components

Break down large components in your layout into smaller ones or use dynamic imports:

```typescript
// Simplify layout.tsx by dynamically importing non-critical components
import dynamic from 'next/dynamic';

// Load non-critical component only on client
const NonCriticalComponent = dynamic(
  () => import('./components/NonCriticalComponent'),
  { ssr: false }
);
```

## For Production Builds

For production, consider these additional steps:

1. **Analyze bundle size** to identify large dependencies:
   ```bash
   # Install analyzer
   npm install @next/bundle-analyzer
   
   # Configure in next.config.js
   const withBundleAnalyzer = require('@next/bundle-analyzer')({
     enabled: process.env.ANALYZE === 'true',
   });
   
   module.exports = withBundleAnalyzer({
     // your next config
   });
   
   # Run with analysis
   ANALYZE=true npm run build
   ```

2. **Split larger chunks** into smaller ones using more granular dynamic imports
3. **Preload critical chunks** using `<link rel="preload">` in your layout for essential JavaScript

## Prevention Best Practices

1. **Regularly clear Next.js cache** during development
2. **Monitor bundle sizes** - keep initial payloads small
3. **Use code splitting** strategically - not everything needs to be in a separate chunk
4. **Implement error boundaries** throughout your application
5. **Keep dependencies updated** - especially Next.js itself
6. **Use TypeScript** to catch issues before runtime
7. **Test on slower networks** to identify timeout issues early

## Troubleshooting Specific Issues

### TypeError in webpack configuration

If you see errors related to `module.context` being null, use this safer approach:

```javascript
name(module) {
  // Safe check for module.context
  if (!module.context) return 'lib';
  
  const contextMatch = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
  if (!contextMatch) return 'lib';
  
  const packageName = contextMatch[1];
  return `npm.${packageName.replace('@', '')}`;
}
```

### Port conflicts

Always specify a port explicitly to avoid conflicts:

```json
// package.json
"scripts": {
  "dev": "next dev --port 3000"
}
```

Or use a script to find an available port automatically.

## Complete Solution Approach

For persistent chunk errors, implement this comprehensive approach:

1. Clear cache completely (`rm -rf .next`)
2. Kill any running Next.js processes  
3. Use a simplified webpack configuration with safe chunk naming
4. Add both ChunkErrorBoundary and ChunkRetryScript components
5. Run with increased memory allocation
6. Consider temporarily disabling code splitting for problematic components 