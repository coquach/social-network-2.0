import { auth } from '@clerk/nextjs/server';
import { initializeApiClient, isApiClientInitialized } from '@repo/shared';

/**
 * Initializes the API client on the Next.js Server (Node.js).
 * This dynamically attaches the auth token using Clerk's `auth()` which utilizes
 * Node's AsyncLocalStorage under the hood to prevent token leaking between users.
 * 
 * Must be called at the top of Server Components or Server Actions that use @repo/shared APIs.
 */
export const initServerApi = () => {
  if (!isApiClientInitialized()) {
    initializeApiClient({
      baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3001',
      getAuthToken: async () => {
        try {
          const { getToken } = await auth();
          const token = await getToken();
          return token;
        } catch (error) {
          console.error('[initServerApi] Error getting token from Clerk auth()', error);
          return null;
        }
      },
    });
    console.log('[Server API Client] Initialized on Node.js');
  }
};
