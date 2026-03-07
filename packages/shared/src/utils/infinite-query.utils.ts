/**
 * Infinite Query Utilities
 * Helper functions for React Query infinite queries
 */

import type { CursorPageResponse } from '../types/pagination.types';

/**
 * Standardized getNextPageParam for infinite queries using cursor pagination.
 * 
 * Returns the next cursor if there are more pages, otherwise undefined.
 * This ensures consistent behavior across all infinite queries.
 * 
 * @param lastPage - The last page of data from the infinite query
 * @returns The next cursor or undefined
 * 
 * @example
 * ```ts
 * useInfiniteQuery({
 *   queryKey: ['posts'],
 *   queryFn: async ({ pageParam }) => fetchPosts(pageParam),
 *   getNextPageParam: getStandardNextPageParam,
 *   initialPageParam: undefined,
 * })
 * ```
 */
export function getStandardNextPageParam<T>(
  lastPage: CursorPageResponse<T>
): string | undefined {
  return lastPage.hasNextPage ? lastPage.nextCursor ?? undefined : undefined;
}

/**
 * Extract all items from infinite query pages
 * 
 * @param pages - Pages from infinite query data
 * @returns Flattened array of all items
 * 
 * @example
 * ```ts
 * const { data } = useInfiniteQuery({ ... });
 * const allItems = flattenInfiniteQueryData(data?.pages);
 * ```
 */
export function flattenInfiniteQueryData<T>(
  pages?: CursorPageResponse<T>[]
): T[] {
  if (!pages) return [];
  return pages.flatMap(page => page.data);
}

/**
 * Get total count from infinite query pages
 * 
 * @param pages - Pages from infinite query data  
 * @returns Total number of items across all pages
 */
export function getInfiniteQueryTotalCount<T>(
  pages?: CursorPageResponse<T>[]
): number {
  if (!pages) return 0;
  return pages.reduce((total, page) => total + page.data.length, 0);
}
