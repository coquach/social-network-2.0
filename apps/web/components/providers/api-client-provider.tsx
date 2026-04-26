'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useRef, useState } from 'react';
import { initializeWebApiClient } from '@/lib/api-client-init';

/**
 * Provider that initializes the shared API client with Clerk authentication
 * Must be rendered inside ClerkProvider to access auth token
 */
export function ApiClientProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  useEffect(() => {
    initializeWebApiClient(() => getTokenRef.current());
    setIsReady(true);
  }, []);

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}
