'use client';

import { SignIn } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useTheme } from 'next-themes';

export default function SignInPage() {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg dark:bg-gray-800">
        <h1 className="mb-6 text-2xl font-bold text-center text-gray-900 dark:text-white">
          Welcome to Reflectly
        </h1>
        <SignIn
          appearance={{
            baseTheme: isDarkMode ? dark : undefined,
            elements: {
              formButtonPrimary: 'bg-blue-500 hover:bg-blue-600 text-sm normal-case',
            },
          }}
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          redirectUrl="/app"
        />
      </div>
    </div>
  );
} 