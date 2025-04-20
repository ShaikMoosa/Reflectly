'use client';

import { SignUp } from '@clerk/nextjs';
import { useTheme } from 'next-themes';

export default function SignUpPage() {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg dark:bg-gray-800">
        <h1 className="mb-6 text-2xl font-bold text-center text-gray-900 dark:text-white">
          Create your Reflectly account
        </h1>
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 
                'bg-blue-500 hover:bg-blue-600 text-sm normal-case',
            },
          }}
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          redirectUrl="/app"
        />
      </div>
    </div>
  );
} 