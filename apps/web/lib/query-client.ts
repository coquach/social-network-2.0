import { isServer, QueryClient, QueryCache } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Global error handler for queries
        // Individual queries can override this with their own onError
        console.error('Query error:', error, 'Query key:', query.queryKey);
      },
    }),
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 1000 * 60, // 1 minute - data fresh for 1 min
        gcTime: 1000 * 60 * 5, // 5 minutes - cache kept for 5 min after last use
        
        // Retry configuration for failed requests
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Refetch behavior
        refetchOnWindowFocus: false, // Don't refetch when user returns to tab
        refetchOnReconnect: true, // Refetch when internet connection restored
        refetchOnMount: true, // Refetch when component mounts if data is stale
        
        // Network mode - determines when queries should run
        networkMode: 'online', // Only run queries when online
        
        // Structural sharing to prevent unnecessary re-renders
        structuralSharing: true,
      },
      mutations: {
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        networkMode: 'online',
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
