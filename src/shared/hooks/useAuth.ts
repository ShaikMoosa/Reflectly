import { useAuth as useClerkAuth } from '@clerk/nextjs';

export function useAuth() {
  const { userId, isLoaded, isSignedIn } = useClerkAuth();

  return {
    user: userId,
    isAuthenticated: isSignedIn,
    isLoading: !isLoaded,
  };
}
