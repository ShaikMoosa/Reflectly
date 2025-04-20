'use client';

// This file serves as a client-only entry point for Konva
// to prevent SSR bundling issues with the 'canvas' module

// Use a dynamic import with a promise
export default function loadKonvaComponents() {
  return import('./KonvaComponents');
} 