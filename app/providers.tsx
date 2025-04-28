'use client';

import { ThemeProvider } from 'next-themes';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Lazy load non-critical providers to reduce main bundle size
const NonCriticalProviders = dynamic(
  () => import('./components/NonCriticalProviders'), 
  { 
    ssr: false,
    loading: () => null 
  }
);

// Add ToastProvider component if it doesn't exist
const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export function Providers({ children }: { children: React.ReactNode }) {
  // Add client-side only logic
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      enableSystem={true}
      defaultTheme="system"
    >
      {mounted ? (
        <>
          {/* Critical providers always rendered */}
          <ToastProvider>
            {/* Non-critical providers loaded dynamically */}
            <NonCriticalProviders>
              {children}
            </NonCriticalProviders>
          </ToastProvider>
        </>
      ) : (
        <>{children}</>
      )}
    </ThemeProvider>
  );
} 