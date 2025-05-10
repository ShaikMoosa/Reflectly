'use client'

import React from 'react'
import { CircleProgress } from './CircleProgress'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'

type ColorType = 'primary' | 'success' | 'warning' | 'danger' | 'info'

interface ProgressCardProps {
  title: string
  value: number
  maxValue: number
  previousValue?: number
  metricLabel?: string
  color?: ColorType
  className?: string
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  value,
  maxValue,
  previousValue,
  metricLabel = '',
  color = 'primary',
  className = '',
}) => {
  // Calculate percentage
  const percentage = Math.round((value / maxValue) * 100)
  
  // Calculate percentage change if previous value exists
  const percentageChange = previousValue !== undefined 
    ? ((value - previousValue) / previousValue) * 100 
    : 0
  
  // Determine trend direction
  const trend = previousValue === undefined 
    ? 'neutral' 
    : value > previousValue 
      ? 'up' 
      : value < previousValue 
        ? 'down' 
        : 'neutral'
        
  // Format the display value
  const formattedValue = Number.isInteger(value) 
    ? value.toString() 
    : value.toFixed(1)
  
  // Get the trend icon and color
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <ArrowDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }
  
  // Format the percentage change
  const formattedChange = () => {
    if (previousValue === undefined) return null
    
    const absChange = Math.abs(percentageChange)
    const formattedValue = absChange < 10 
      ? absChange.toFixed(1) 
      : Math.round(absChange)
      
    return (
      <span className={`text-xs ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-400'}`}>
        {formattedValue}%
      </span>
    )
  }

  return (
    <div className={`p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm ${className}`}>
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
        {title}
      </div>
      
      <div className="flex items-center">
        <div className="flex-1">
          <div className="flex items-baseline">
            <span className="text-2xl font-semibold text-gray-900 dark:text-white mr-2">
              {formattedValue}
            </span>
            
            {metricLabel && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {metricLabel}
              </span>
            )}
          </div>
          
          {previousValue !== undefined && (
            <div className="flex items-center mt-1">
              {getTrendIcon()}
              {formattedChange()}
            </div>
          )}
        </div>
        
        <CircleProgress 
          percentage={percentage} 
          color={color} 
          size={64}
        >
          <span className="text-sm font-medium">
            {percentage}%
          </span>
        </CircleProgress>
      </div>
    </div>
  )
} 