/**
 * Shared Providers for Web App
 *
 * This file wraps @repo/shared providers with web-specific implementations (Clerk auth + Cloudinary upload).
 * Use this in your web app layout to provide authentication and upload context to shared hooks.
 */

'use client';

import { ReactNode, useMemo } from 'react';
import { AuthProvider, UploadProvider } from '@repo/shared';
import { useAuth } from '@clerk/nextjs';
import { createCloudinaryUploadService } from '@/lib/services/cloudinary-upload.service';

interface SharedProvidersProps {
  children: ReactNode;
}

/**
 * Provides authentication context from Clerk and upload service to @repo/shared hooks
 *
 * Note: Token injection is handled separately by ApiClientProvider via interceptor.
 * This provider only passes userId and isAuthenticated for UI logic and optimistic updates.
 *
 * @example
 * // In your root layout (app/layout.tsx)
 * import { SharedProviders } from '@/providers/shared-providers';
 * import { ApiClientProvider } from '@/components/providers/api-client-provider';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <ClerkProvider>
 *       <ApiClientProvider>
 *         <SharedProviders>
 *           {children}
 *         </SharedProviders>
 *       </ApiClientProvider>
 *     </ClerkProvider>
 *   );
 * }
 */
export function SharedProviders({ children }: SharedProvidersProps) {
  const { userId, isLoaded } = useAuth();

  // Create upload service instance once
  const uploadService = useMemo(() => {
    try {
      return createCloudinaryUploadService();
    } catch (error) {
      console.error('Failed to initialize upload service:', error);
      return null;
    }
  }, []);

  return (
    <AuthProvider
      value={{
        userId: userId || null,
        isAuthenticated: isLoaded && !!userId,
      }}
    >
      {uploadService ? (
        <UploadProvider uploadService={uploadService}>
          {children}
        </UploadProvider>
      ) : (
        children
      )}
    </AuthProvider>
  );
}
