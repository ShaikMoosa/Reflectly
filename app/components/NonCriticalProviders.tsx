'use client';

interface NonCriticalProvidersProps {
  children: React.ReactNode;
}

// This component contains providers that are not critical for initial rendering
// It will be loaded dynamically to reduce the size of the initial chunk
export default function NonCriticalProviders({ children }: NonCriticalProvidersProps) {
  return (
    <>
      {/* Add any non-critical providers here */}
      {children}
    </>
  );
} 