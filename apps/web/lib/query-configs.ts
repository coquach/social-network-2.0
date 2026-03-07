/**
 * Standardized Query Configurations for TanStack Query
 * 
 * Predefined configurations for different data volatility levels.
 * Use these to ensure consistent caching behavior across the application.
 * 
 * Configuration Types:
 * - realtime: Always fresh data (stocks, live feeds, notifications)
 * - frequent: Short cache (feeds, user-generated content)
 * - standard: Default cache (profiles, posts, groups)
 * - static: Long-term cache (categories, configurations)
 * 
 * @see https://tanstack.com/query/latest/docs/react/guides/caching
 */

import type { UseQueryOptions, UseInfiniteQueryOptions } from '@tanstack/react-query';

/**
 * Query configuration presets
 */
export const queryConfigs = {
  /**
   * Real-time data that should always be fresh
   * Examples: stock prices, live scores, active typing indicators
   * 
   * - staleTime: 0 (always stale, always refetch)
   * - gcTime: 1 minute (keep in cache briefly)
   * - refetchInterval: optional for polling
   */
  realtime: {
    staleTime: 0,
    gcTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  },

  /**
   * Frequently changing data with short cache
   * Examples: feeds, notifications, recent activity
   * 
   * - staleTime: 10 seconds
   * - gcTime: 2 minutes
   * - refetchInterval: 15 seconds (optional polling)
   */
  frequent: {
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 15 * 1000, // 15 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  },

  /**
   * Standard user-generated content
   * Examples: posts, comments, user profiles
   * 
   * - staleTime: 60 seconds (1 minute)
   * - gcTime: 5 minutes
   */
  standard: {
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  },

  /**
   * Semi-static data that changes occasionally
   * Examples: group details, settings, configurations
   * 
   * - staleTime: 5 minutes
   * - gcTime: 30 minutes
   */
  semiStatic: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  },

  /**
   * Static reference data
   * Examples: categories, tags, static content
   * 
   * - staleTime: Infinity (never stale)
   * - gcTime: 1 hour
   */
  static: {
    staleTime: Infinity,
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  },
} as const;

/**
 * Type helper for extracting config type
 */
export type QueryConfigType = keyof typeof queryConfigs;

/**
 * Creates a query configuration based on data volatility
 * 
 * @example
 * ```tsx
 * const { data } = useQuery({
 *   queryKey: ['posts'],
 *   queryFn: fetchPosts,
 *   ...createQueryConfig('standard'),
 * })
 * ```
 */
export function createQueryConfig<TData = unknown>(
  type: QueryConfigType,
  overrides?: Partial<UseQueryOptions<TData>>
): Partial<UseQueryOptions<TData>> {
  return {
    ...queryConfigs[type],
    ...overrides,
  };
}

/**
 * Creates an infinite query configuration
 * 
 * @example
 * ```tsx
 * const { data } = useInfiniteQuery({
 *   queryKey: ['posts'],
 *   queryFn: fetchPosts,
 *   ...createInfiniteQueryConfig('frequent'),
 *   getNextPageParam: (lastPage) => lastPage.nextCursor,
 * })
 * ```
 */
export function createInfiniteQueryConfig<TData = unknown>(
  type: QueryConfigType,
  overrides?: Partial<UseInfiniteQueryOptions<TData>>
): Partial<UseInfiniteQueryOptions<TData>> {
  return {
    ...queryConfigs[type],
    ...overrides,
  };
}

/**
 * SE121-specific configurations for common data types
 */
export const se121Configs = {
  feed: createQueryConfig('frequent'),
  post: createQueryConfig('standard'),
  profile: createQueryConfig('standard'),
  group: createQueryConfig('semiStatic'),
  notification: createQueryConfig('realtime'),
  message: createQueryConfig('realtime'),
  search: createQueryConfig('standard', { refetchOnMount: false }),
} as const;
