import { useAuth } from '@clerk/expo';
import { AuthProvider, initializeApiClient } from '@repo/shared';
import React from 'react';

type SharedProviderProps = {
  children: React.ReactNode;
};

export function NativeSharedProvider({ children }: SharedProviderProps) {
  const { userId, isLoaded, getToken } = useAuth();
  const authRef = React.useRef({
    isLoaded,
    getToken,
  });

  React.useEffect(() => {
    authRef.current = {
      isLoaded,
      getToken,
    };
  }, [getToken, isLoaded]);

  React.useEffect(() => {
    const baseURL = process.env.EXPO_PUBLIC_API_URL;

    if (!baseURL) {
      throw new Error('Add EXPO_PUBLIC_API_URL to the native env configuration.');
    }

    initializeApiClient({
      baseURL,
      getAuthToken: async () => {
        const { isLoaded: authLoaded, getToken: getAuthToken } = authRef.current;

        if (!authLoaded) {
          return null;
        }

        const token = await getAuthToken();
        return token ?? null;
      },
    });
  }, []);

  return (
    <AuthProvider
      value={{
        userId: isLoaded ? userId ?? null : null,
        isAuthenticated: isLoaded && !!userId,
      }}
    >
      {children}
    </AuthProvider>
  );
}
