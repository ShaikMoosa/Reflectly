'use client';

import { ThemeProvider } from 'next-themes';
import React, { useState, useEffect } from 'react';

// Add ToastProvider component if it doesn't exist
const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Ensure theme only changes on client side to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={false}
      themes={['light', 'dark']}
    >
      <ToastProvider>
        {mounted && children}
      </ToastProvider>
    </ThemeProvider>
  );
} 