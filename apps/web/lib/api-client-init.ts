'use client';

import { initializeApiClient } from '@repo/shared';

/**
 * Initialize the shared API client with Clerk authentication
 * This should be called once at app startup
 * 
 * @param getToken - Function to get Clerk auth token
 */
export function initializeWebApiClient(getToken: () => Promise<string | null>) {
  const baseURL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3001';
  
  initializeApiClient({
    baseURL,
    getAuthToken: getToken,
  });
  
  console.log('[API Client] Initialized with base URL:', baseURL);
}
