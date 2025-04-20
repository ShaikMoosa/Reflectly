'use client';

import React from 'react';
import { ThemeProvider } from 'next-themes';

// Add ToastProvider component if it doesn't exist
const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class">
      <ToastProvider>
        {children}
      </ToastProvider>
    </ThemeProvider>
  );
} 