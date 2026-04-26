import {
  QueryCache,
  QueryClient,
  type DefaultOptions,
  type Query,
} from '@tanstack/react-query';
import { isAxiosError } from 'axios';

const DEFAULT_RETRY_DELAY = (attemptIndex: number) =>
  Math.min(1000 * 2 ** attemptIndex, 30_000);

const shouldRetryQuery = (failureCount: number, error: unknown) => {
  if (isAxiosError(error)) {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      return false;
    }
  }

  return failureCount < 2;
};

export const sharedQueryClientDefaultOptions: DefaultOptions = {
  queries: {
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: shouldRetryQuery,
    retryDelay: DEFAULT_RETRY_DELAY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: true,
    networkMode: 'online',
    structuralSharing: true,
  },
  mutations: {
    retry: 2,
    retryDelay: DEFAULT_RETRY_DELAY,
    networkMode: 'online',
  },
};

export type SharedQueryClientConfig = {
  defaultOptions?: DefaultOptions;
  onQueryError?: (
    error: Error,
    query: Query<unknown, unknown, unknown, readonly unknown[]>,
  ) => void;
};

const defaultOnQueryError = (
  error: Error,
  query: Query<unknown, unknown, unknown, readonly unknown[]>,
) => {
  console.error('Query error:', error, 'Query key:', query.queryKey);
};

const mergeDefaultOptions = (overrides?: DefaultOptions): DefaultOptions => ({
  ...sharedQueryClientDefaultOptions,
  ...overrides,
  queries: {
    ...sharedQueryClientDefaultOptions.queries,
    ...overrides?.queries,
  },
  mutations: {
    ...sharedQueryClientDefaultOptions.mutations,
    ...overrides?.mutations,
  },
});

export function createSharedQueryClient(config: SharedQueryClientConfig = {}) {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        (config.onQueryError ?? defaultOnQueryError)(normalizedError, query);
      },
    }),
    defaultOptions: mergeDefaultOptions(config.defaultOptions),
  });
}

let browserQueryClient: QueryClient | undefined;

export function getSharedQueryClient(config?: SharedQueryClientConfig) {
  if (!('window' in globalThis)) {
    return createSharedQueryClient(config);
  }

  if (!browserQueryClient) {
    browserQueryClient = createSharedQueryClient(config);
  }

  return browserQueryClient;
}
