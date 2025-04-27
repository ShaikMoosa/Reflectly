---
description: Solving Next.js ChunkLoadError issues
globs: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"]
alwaysApply: false
---

# Next.js ChunkLoadError Troubleshooting

## Common Error Message

```
Unhandled Runtime Error
ChunkLoadError: Loading chunk app/layout failed.
(timeout: http://localhost:3001/_next/static/chunks/app/layout.js)
```

## Root Causes

The `ChunkLoadError` occurs when Next.js cannot load JavaScript chunks properly. This is often caused by:

1. **Build Cache Corruption**: Next.js cache may have incomplete or corrupted files
2. **Network Timeout**: Slow network or large bundle causing timeouts
3. **Memory Constraints**: Server running out of memory during build/development
4. **Resource Conflicts**: Files being used by other processes
5. **Circular Dependencies**: Module dependencies forming loops

## Quick Solutions

Try these steps in order until the issue is resolved:

### 1. Clear Next.js Cache and Restart

```bash
# Stop the development server first, then:
rm -rf .next
# Or on Windows:
# rd /s /q .next

# Restart the development server
npm run dev
```

### 2. Fix Port Conflicts

```bash
# Use a different port if 3001 is in use
npm run dev -- -p 3002
```

### 3. Increase Memory Allocation

```bash
# Increase Node.js memory limit
cross-env NODE_OPTIONS="--max-old-space-size=8192" npm run dev
```

### 4. Check for Circular Dependencies

Look for imports that might create circular references between components or modules.
For example, if `ComponentA.tsx` imports from `ComponentB.tsx` and vice versa, this creates a circle.

```typescript
// Fix by:
// 1. Using absolute imports with the @/ prefix
import { ComponentB } from '@/app/components/ComponentB';

// 2. Creating shared interfaces/types in separate files
import { SharedType } from '@/app/types/SharedTypes';

// 3. Using named exports alongside default exports
export { ComponentA };
export default ComponentA;
```

### 5. Build for Production to Identify Issues

```bash
npm run build
```
The build output will often show issues that don't appear during development.

### 6. Handle Chunk Loading Errors in Components

```jsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ErrorBoundary({ children }) {
  const router = useRouter();
  
  useEffect(() => {
    const handleError = (error) => {
      if (error.message && error.message.includes('ChunkLoadError')) {
        console.error('Chunk loading error detected, refreshing...');
        router.reload();
      }
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [router]);
  
  return children;
}
```

## Prevention Techniques

1. **Code Splitting**: Use dynamic imports judiciously to reduce initial chunk sizes
2. **Bundle Analysis**: Use `@next/bundle-analyzer` to identify large packages
3. **Regular Cache Clearing**: Add a cache clean step to your development workflow
4. **Error Handling**: Implement error boundaries to catch and handle chunk loading errors
5. **Memory Monitoring**: Watch for memory issues during development and builds
6. **Avoid Complex Circular Dependencies**: Restructure code to prevent circular imports

## Final Note

If the issue persists, it could indicate deeper problems with your project's configuration or dependencies. Consider:

- Updating Next.js to the latest version
- Checking for package conflicts with `npm ls`
- Simplifying your component hierarchy and import structure
- Testing on a different machine or environment to rule out local issues 