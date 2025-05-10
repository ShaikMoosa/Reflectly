'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserButton, useAuth } from '@clerk/nextjs';

export default function AppPage() {
  const router = useRouter();
  const { isLoaded, userId } = useAuth();
  
  useEffect(() => {
    if (isLoaded && userId) {
      // Redirect to the main application component
      router.push('/');
    }
  }, [isLoaded, userId, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 p-4">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-end w-full mb-4">
          <UserButton afterSignOutUrl="/" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to Reflectly
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Loading your personalized workspace...
        </p>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
} 