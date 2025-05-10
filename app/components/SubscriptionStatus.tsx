'use client';

import React from 'react';
import Link from 'next/link';
import { SubscriptionStatus } from '../utils/subscriptions';

interface SubscriptionStatusProps {
  subscriptionData: SubscriptionStatus | null;
  isLoading: boolean;
}

const SubscriptionStatusComponent: React.FC<SubscriptionStatusProps> = ({ 
  subscriptionData, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900 shadow-sm">
        <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
        <div className="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!subscriptionData) {
    return (
      <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900 shadow-sm">
        <p className="text-red-500">Failed to load subscription data</p>
        <button className="text-blue-500 hover:underline text-sm mt-1">Retry</button>
      </div>
    );
  }

  const { isPremium, plan, usageStats } = subscriptionData;

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">
          {isPremium ? (
            <span className="flex items-center">
              <svg className="w-4 h-4 text-yellow-500 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Premium Plan
            </span>
          ) : (
            <span>Free Plan</span>
          )}
        </h3>
        {!isPremium && (
          <Link 
            href="/api/subscription" 
            className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full transition-colors"
          >
            Upgrade
          </Link>
        )}
      </div>

      {/* Usage Statistics */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Transcriptions</span>
            <span>{usageStats.transcriptions.used} / {usageStats.transcriptions.limit}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${isPremium ? 'bg-blue-500' : 'bg-green-500'}`} 
              style={{ width: `${Math.min(usageStats.transcriptions.percentage, 100)}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>AI Chat</span>
            <span>{usageStats.aiChat.used} / {usageStats.aiChat.limit}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${isPremium ? 'bg-blue-500' : 'bg-green-500'}`} 
              style={{ width: `${Math.min(usageStats.aiChat.percentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatusComponent; 