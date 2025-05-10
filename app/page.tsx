'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import App from './components/App';
import Link from 'next/link';

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/landing');
    }
  }, [isSignedIn, isLoaded, router]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-[#1f1f1f]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-[#1f1f1f] p-4">
        <div className="w-full max-w-4xl text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white">
            Welcome to Reflectly
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Redirecting to landing page...
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link
              href="/landing"
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-8 rounded-lg transition-colors"
            >
              Go to Landing Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100">
      <App />
    </div>
  );
} 