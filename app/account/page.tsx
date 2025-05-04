import React from 'react';
import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { getUserSubscriptionStatus } from '../utils/subscriptions';
import { createClient } from '../utils/supabase/server';

export default async function AccountPage() {
  const { userId } = await auth();
  const user = await currentUser();
  
  // Redirect if not logged in
  if (!userId || !user) {
    redirect('/sign-in');
  }
  
  // Get subscription data
  const subscriptionData = await getUserSubscriptionStatus(userId);
  
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1">
          <h2 className="text-xl font-semibold mb-4">Navigation</h2>
          <nav className="space-y-1">
            <Link 
              href="/app" 
              className="block px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Return to App
            </Link>
          </nav>
        </div>
        
        <div className="col-span-2 space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-md">
                    {user.firstName || 'Not set'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-md">
                    {user.lastName || 'Not set'}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-md">
                  {user.emailAddresses[0]?.emailAddress || 'No email address'}
                </div>
              </div>
              
              <div className="pt-2">
                <Link
                  href="https://accounts.reflectly.app/user"
                  target="_blank"
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  Edit profile →
                </Link>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Subscription</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Current Plan</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {subscriptionData.isPremium 
                      ? 'Premium Plan' 
                      : 'Free Plan'}
                  </p>
                </div>
                
                <div>
                  <span 
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      subscriptionData.isPremium 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {subscriptionData.status}
                  </span>
                </div>
              </div>
              
              {subscriptionData.renews_at && subscriptionData.isPremium && (
                <div>
                  <h3 className="font-medium text-sm">Renews On</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {new Date(subscriptionData.renews_at).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <h3 className="font-medium text-sm">Usage Limits</h3>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Transcriptions</span>
                    <span>
                      {subscriptionData.usageStats.transcriptions.used} / {subscriptionData.usageStats.transcriptions.limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${subscriptionData.isPremium ? 'bg-blue-500' : 'bg-green-500'}`} 
                      style={{ width: `${Math.min(subscriptionData.usageStats.transcriptions.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>AI Chat</span>
                    <span>
                      {subscriptionData.usageStats.aiChat.used} / {subscriptionData.usageStats.aiChat.limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${subscriptionData.isPremium ? 'bg-blue-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(subscriptionData.usageStats.aiChat.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="pt-3 flex gap-3">
                {!subscriptionData.isPremium ? (
                  <a
                    href="/api/subscription"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Upgrade to Premium
                  </a>
                ) : (
                  <div className="space-x-3">
                    {subscriptionData.status === 'active' && (
                      <Link
                        href="/api/account/cancel-subscription"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel Subscription
                      </Link>
                    )}
                    
                    <a
                      href="https://reflectly.lemonsqueezy.com/billing"
                      target="_blank"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Manage Billing
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 