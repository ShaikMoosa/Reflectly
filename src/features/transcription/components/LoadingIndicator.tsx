'use client';

import React from 'react';

type LoadingVariant = 'spinner' | 'dots' | 'pulse' | 'bar'
type LoadingSize = 'sm' | 'md' | 'lg'

interface LoadingIndicatorProps {
  variant?: LoadingVariant
  size?: LoadingSize
  className?: string
  label?: string
  showLabel?: boolean
  color?: string
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  variant = 'spinner',
  size = 'md',
  className = '',
  label = 'Loading...',
  showLabel = false,
  color,
}) => {
  // Size mapping
  const sizeMap = {
    sm: { spinner: 24, dots: 4, bar: 2 },
    md: { spinner: 40, dots: 6, bar: 3 },
    lg: { spinner: 56, dots: 8, bar: 4 },
  }

  // Style with custom color if provided
  const colorStyle = color ? { borderTopColor: color, color } : {}

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div 
            className={`rounded-full border-4 border-gray-200 dark:border-gray-700 animate-spin ${className}`} 
            style={{ 
              width: sizeMap[size].spinner, 
              height: sizeMap[size].spinner, 
              borderTopColor: colorStyle.color || 'var(--color-primary)',
              ...colorStyle 
            }}
          />
        )
        
      case 'dots':
        return (
          <div className="flex space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`rounded-full bg-gray-600 dark:bg-gray-300 ${className}`}
                style={{ 
                  width: sizeMap[size].dots, 
                  height: sizeMap[size].dots,
                  backgroundColor: colorStyle.color || 'var(--color-primary)',
                  animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`
                }}
              />
            ))}
          </div>
        )
        
      case 'pulse':
        return (
          <div 
            className={`rounded-full animate-pulse ${className}`}
            style={{ 
              width: sizeMap[size].spinner, 
              height: sizeMap[size].spinner, 
              backgroundColor: colorStyle.color || 'var(--color-primary-light)',
              opacity: 0.7,
            }}
          />
        )
        
      case 'bar':
        return (
          <div 
            className="relative w-full h-1 bg-gray-200 dark:bg-gray-700 overflow-hidden rounded-full"
            style={{ height: sizeMap[size].bar }}
          >
            <div 
              className="absolute top-0 left-0 h-full animate-loading-bar"
              style={{ 
                backgroundColor: colorStyle.color || 'var(--color-primary)',
                width: '30%'
              }}
            />
          </div>
        )
        
      default:
        return (
          <div 
            className={`rounded-full border-4 border-gray-200 dark:border-gray-700 animate-spin ${className}`} 
            style={{ 
              width: sizeMap[size].spinner, 
              height: sizeMap[size].spinner, 
              borderTopColor: 'var(--color-primary)',
              ...colorStyle 
            }}
          />
        )
    }
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {renderLoader()}
      {showLabel && (
        <span 
          className={`mt-2 text-sm text-gray-600 dark:text-gray-300 ${size === 'lg' ? 'text-base' : size === 'sm' ? 'text-xs' : ''}`}
          style={colorStyle}
        >
          {label}
        </span>
      )}
    </div>
  )
}

export default LoadingIndicator 