import { useAuth } from '@clerk/expo';
import { AuthProvider, UploadProvider, initializeApiClient } from '@repo/shared';
import React from 'react';

import { createNativeCloudinaryUploadService } from '~/lib/services/native-cloudinary-upload.service';
import { getFreshClerkToken } from '~/utils/clerk-auth';

type SharedProviderProps = {
  children: React.ReactNode;
};

export function NativeSharedProvider({ children }: SharedProviderProps) {
  const { userId, isLoaded, isSignedIn, getToken } = useAuth();
  const [isApiClientReady, setIsApiClientReady] = React.useState(false);
  const uploadService = React.useMemo(() => {
    try {
      return createNativeCloudinaryUploadService();
    } catch (error) {
      console.warn('[Native Upload] Upload service disabled:', error);
      return null;
    }
  }, []);
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

        const token = await getFreshClerkToken(getAuthToken);
        return token ?? null;
      },
    });

    console.log('[Native API Client] Initialized with base URL:', baseURL);
    setIsApiClientReady(true);
  }, []);

  if (!isLoaded || !isApiClientReady) {
    return null;
  }

  return (
    <AuthProvider
      value={{
        userId: isSignedIn ? userId ?? null : null,
        isAuthenticated: !!isSignedIn,
      }}
    >
      {uploadService ? (
        <UploadProvider uploadService={uploadService}>{children}</UploadProvider>
      ) : (
        children
      )}
    </AuthProvider>
  );
}
