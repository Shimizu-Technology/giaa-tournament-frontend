import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../services/api';

/**
 * Hook to initialize the API client with Clerk's auth token.
 * Call this at the top level of your app or in a layout component.
 */
export function useApiAuth() {
  const { getToken } = useAuth();

  useEffect(() => {
    // Set the auth token getter so the API client can get fresh tokens
    api.setAuthTokenGetter(async () => {
      try {
        return await getToken();
      } catch (error) {
        console.error('Failed to get auth token:', error);
        return null;
      }
    });
  }, [getToken]);
}

/**
 * Re-export the api instance for convenience
 */
export { api };

