'use client';

import React, { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import type { Editor, Tldraw as TldrawType } from '@tldraw/tldraw';

// Import TLDraw dynamically with SSR disabled
const TldrawComponent = dynamic(
  () => import('@tldraw/tldraw').then(mod => ({ default: mod.Tldraw })),
  { ssr: false }
);

// Simple loading component
const LoadingPlaceholder = () => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="text-center p-8">
      <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
      <p className="mt-4">Loading Whiteboard...</p>
    </div>
  </div>
);

const Whiteboard = () => {
  const { resolvedTheme } = useTheme();
  const [editor, setEditor] = useState<Editor | null>(null);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Ensure we're on client side before rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update editor theme when theme changes
  useEffect(() => {
    if (editor && mounted) {
      try {
        editor.user.updateUserPreferences({
          colorScheme: resolvedTheme === 'dark' ? 'dark' : 'light'
        });
      } catch (err) {
        console.error('Error updating TLDraw theme:', err);
      }
    }
  }, [editor, resolvedTheme, mounted]);

  // Remove watermarks
  useEffect(() => {
    if (!mounted) return;

    const removeWatermarks = () => {
      const watermarks = document.querySelectorAll('[data-watermark="true"]');
      watermarks.forEach(watermark => watermark.remove());
    };

    // Initial removal
    removeWatermarks();

    // Setup MutationObserver to continuously remove watermarks
    const observer = new MutationObserver(removeWatermarks);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, [mounted]);

  // Don't render anything on server or if not mounted
  if (!mounted) return null;

  // Show error state if something went wrong
  if (error) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center p-8">
          <h3 className="text-xl mb-4">Unable to load whiteboard</h3>
          <p className="mb-4">Please refresh the page or check your connection.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
      <React.Suspense fallback={<LoadingPlaceholder />}>
        <ErrorBoundary onError={(err: Error) => setError(err)}>
          <TldrawComponent 
            onMount={(editor: Editor) => setEditor(editor)}
            className="h-full w-full"
          />
        </ErrorBoundary>
      </React.Suspense>
    </div>
  );
};

// Error boundary component with proper types
interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    console.error("TLDraw error:", error);
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-center p-8">
            <h3 className="text-xl mb-4">Something went wrong</h3>
            <p>We encountered an error while loading the whiteboard.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default Whiteboard; 