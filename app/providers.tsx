'use client';

import React from 'react';

// Add ToastProvider component if it doesn't exist
const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
} 