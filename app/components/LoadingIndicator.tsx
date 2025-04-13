'use client';

import React from 'react';

// A small, optimized loading indicator component that won't impact LCP
export default function LoadingIndicator() {
  return (
    <div className="loading-indicator">
      <div className="spinner"></div>
    </div>
  );
} 