'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { initializeWebApiClient } from '@/lib/api-client-init';

/**
 * Provider that initializes the shared API client with Clerk authentication
 * Must be rendered inside ClerkProvider to access auth token
 */
export function ApiClientProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    // Initialize API client once on mount
    initializeWebApiClient(getToken);
  }, [getToken]);

  return <>{children}</>;
}
