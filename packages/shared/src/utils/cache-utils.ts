/**
 * Cache Update Utilities for React Query
 * 
 * Platform-agnostic helper functions for optimistic updates and cache management.
 * These utilities work with TanStack Query's cache to provide consistent data manipulation.
 * 
 * Key Concepts:
 * - Optimistic Updates: Update UI immediately before server response
 * - Cache Invalidation: Mark data as stale to trigger refetch
 * - Cache Updates: Directly modify cached data
 */

import { QueryClient, InfiniteData } from '@tanstack/react-query';
import type { CursorPageResponse } from '../types/common.types';

// ==================== Generic Cache Helpers ====================

/**
 * Add item to the beginning of first page in infinite query cache
 * 
 * @example
 * ```ts
 * addItemToInfiniteCache(
 *   queryClient,
 *   ['posts', 'list'],
 *   newPost
 * );
 * ```
 */
export function addItemToInfiniteCache<T>(
  queryClient: QueryClient,
  queryKey: unknown[],
  newItem: T
): void {
  queryClient.setQueriesData<InfiniteData<CursorPageResponse<T>>>(
    { queryKey },
    (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page, index) =>
          index === 0
            ? { ...page, data: [newItem, ...page.data] }
            : page
        ),
      };
    }
  );
}

/**
 * Update item in infinite query cache by matching predicate
 * 
 * @example
 * ```ts
 * updateItemInInfiniteCache(
 *   queryClient,
 *   ['posts', 'list'],
 *   updatedPost,
 *   (item, updated) => item.id === updated.id
 * );
 * ```
 */
export function updateItemInInfiniteCache<T>(
  queryClient: QueryClient,
  queryKey: unknown[],
  updatedItem: T,
  matcher: (item: T, updated: T) => boolean
): void {
  queryClient.setQueriesData<InfiniteData<CursorPageResponse<T>>>(
    { queryKey, exact: false },
    (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          data: page.data.map((item) =>
            matcher(item, updatedItem) ? updatedItem : item
          ),
        })),
      };
    }
  );
}

/**
 * Remove item from infinite query cache by matching predicate
 * 
 * @example
 * ```ts
 * removeItemFromInfiniteCache(
 *   queryClient,
 *   ['posts', 'list'],
 *   (item) => item.id === postId
 * );
 * ```
 */
export function removeItemFromInfiniteCache<T>(
  queryClient: QueryClient,
  queryKey: unknown[],
  predicate: (item: T) => boolean
): void {
  queryClient.setQueriesData<InfiniteData<CursorPageResponse<T>>>(
    { queryKey, exact: false },
    (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          data: page.data.filter((item) => !predicate(item)),
        })),
      };
    }
  );
}

/**
 * Update counter in cached item
 * Useful for reaction counts, comment counts, etc.
 * 
 * @example
 * ```ts
 * updateCountInCache(
 *   queryClient,
 *   ['posts', 'detail', postId],
 *   'reactionCount',
 *   (count) => count + 1
 * );
 * ```
 */
export function updateCountInCache<T extends Record<string, any>>(
  queryClient: QueryClient,
  queryKey: unknown[],
  countField: keyof T,
  updateFn: (currentCount: number) => number
): void {
  queryClient.setQueryData<T>(queryKey, (oldData) => {
    if (!oldData) return oldData;

    const currentCount = (oldData[countField] as number) || 0;
    return {
      ...oldData,
      [countField]: updateFn(currentCount),
    };
  });
}

/**
 * Increment counter in infinite query cache items
 * 
 * @example
 * ```ts
 * incrementCountInInfiniteCache(
 *   queryClient,
 *   ['posts', 'list'],
 *   (item) => item.id === postId,
 *   'likeCount',
 *   1
 * );
 * ```
 */
export function incrementCountInInfiniteCache<T extends Record<string, any>>(
  queryClient: QueryClient,
  queryKey: unknown[],
  itemMatcher: (item: T) => boolean,
  countField: keyof T,
  increment: number
): void {
  queryClient.setQueriesData<InfiniteData<CursorPageResponse<T>>>(
    { queryKey, exact: false },
    (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          data: page.data.map((item) => {
            if (!itemMatcher(item)) return item;

            const currentCount = (item[countField] as number) || 0;
            return {
              ...item,
              [countField]: currentCount + increment,
            };
          }),
        })),
      };
    }
  );
}

// ==================== Optimistic Update Helpers ====================

/**
 * Context for rollback on mutation error
 */
export interface OptimisticContext<T> {
  previousData?: T;
}

/**
 * Snapshot current query data for rollback
 * 
 * @example
 * ```ts
 * const context = snapshotQueryData(queryClient, ['posts', postId]);
 * // On error:
 * restoreQueryData(queryClient, ['posts', postId], context);
 * ```
 */
export function snapshotQueryData<T>(
  queryClient: QueryClient,
  queryKey: unknown[]
): OptimisticContext<T> {
  const previousData = queryClient.getQueryData<T>(queryKey);
  return { previousData };
}

/**
 * Restore query data from snapshot
 */
export function restoreQueryData<T>(
  queryClient: QueryClient,
  queryKey: unknown[],
  context: OptimisticContext<T>
): void {
  if (context.previousData !== undefined) {
    queryClient.setQueryData<T>(queryKey, context.previousData);
  }
}

/**
 * Snapshot infinite query data for rollback
 */
export function snapshotInfiniteQueryData<T>(
  queryClient: QueryClient,
  queryKey: unknown[]
): OptimisticContext<InfiniteData<CursorPageResponse<T>>> {
  const previousData = queryClient.getQueryData<InfiniteData<CursorPageResponse<T>>>(queryKey);
  return { previousData };
}

/**
 * Restore infinite query data from snapshot
 */
export function restoreInfiniteQueryData<T>(
  queryClient: QueryClient,
  queryKey: unknown[],
  context: OptimisticContext<InfiniteData<CursorPageResponse<T>>>
): void {
  if (context.previousData !== undefined) {
    queryClient.setQueryData<InfiniteData<CursorPageResponse<T>>>(queryKey, context.previousData);
  }
}

// ==================== Batch Operations ====================

/**
 * Invalidate multiple related queries
 * 
 * @example
 * ```ts
 * invalidateQueries(queryClient, [
 *   ['posts', 'list'],
 *   ['feed', 'trending'],
 *   ['notifications']
 * ]);
 * ```
 */
export function invalidateQueries(
  queryClient: QueryClient,
  queryKeys: unknown[][]
): Promise<void[]> {
  return Promise.all(
    queryKeys.map((queryKey) =>
      queryClient.invalidateQueries({ queryKey })
    )
  );
}

/**
 * Cancel multiple ongoing queries
 * Used before optimistic updates to prevent race conditions
 */
export function cancelQueries(
  queryClient: QueryClient,
  queryKeys: unknown[][]
): Promise<void[]> {
  return Promise.all(
    queryKeys.map((queryKey) =>
      queryClient.cancelQueries({ queryKey })
    )
  );
}

// ==================== Type Guards ====================

/**
 * Check if data is InfiniteData
 */
export function isInfiniteData<T>(
  data: unknown
): data is InfiniteData<CursorPageResponse<T>> {
  return (
    data !== null &&
    typeof data === 'object' &&
    'pages' in data &&
    Array.isArray((data as any).pages)
  );
}

/**
 * Check if data is CursorPageResponse
 */
export function isCursorPageResponse<T>(
  data: unknown
): data is CursorPageResponse<T> {
  return (
    data !== null &&
    typeof data === 'object' &&
    'data' in data &&
    Array.isArray((data as any).data)
  );
}
