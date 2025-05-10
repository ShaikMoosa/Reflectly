'use client'

import React from 'react'

interface CircleProgressProps {
  percentage: number
  color?: string
  size?: number
  strokeWidth?: number
  className?: string
  children?: React.ReactNode
}

export const CircleProgress: React.FC<CircleProgressProps> = ({
  percentage,
  color = 'primary',
  size = 60,
  strokeWidth = 6,
  className = '',
  children,
}) => {
  // Make sure percentage is between 0 and 100
  const validPercentage = Math.min(100, Math.max(0, percentage))
  
  // Calculate circle properties
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (validPercentage / 100) * circumference
  
  // Center of the circle
  const center = size / 2
  
  // Get color based on theme
  const getStrokeColor = (colorName: string) => {
    switch (colorName) {
      case 'primary':
        return 'var(--color-primary)'
      case 'success':
        return '#10b981' // green-500
      case 'warning':
        return '#f59e0b' // amber-500
      case 'danger':
        return '#ef4444' // red-500
      case 'info':
        return '#3b82f6' // blue-500
      default:
        return 'var(--color-primary)'
    }
  }

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        
        {/* Foreground circle (progress) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={getStrokeColor(color)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.5s ease-in-out',
          }}
        />
      </svg>
      
      {/* Display percentage in the center if needed */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
} 