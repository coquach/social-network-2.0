/**
 * Query Selectors for TanStack Query
 * 
 * Centralized data transformation functions to use with the `select` option.
 * Benefits:
 * - Runs only when data changes (memoized by React Query)
 * - Reduces component re-renders
 * - Keeps transformation logic DRY
 * - Type-safe transformations
 * 
 * @see https://tanstack.com/query/latest/docs/react/guides/query-functions#select
 */

import { InfiniteData } from '@tanstack/react-query';
import { CursorPageResponse } from './cursor-pagination.dto';

/**
 * Flattens infinite query data into a single array
 * Use with useInfiniteQuery select option
 * 
 * @example
 * ```tsx
 * const { data: posts } = useInfiniteQuery({
 *   queryKey: ['posts'],
 *   queryFn: fetchPosts,
 *   select: selectInfiniteData,
 * })
 * ```
 */
export function selectInfiniteData<T>(
  data: InfiniteData<CursorPageResponse<T>>
): T[] {
  return data.pages.flatMap((page) => page.data);
}

/**
 * Flattens infinite query data and filters by predicate
 * 
 * @example
 * ```tsx
 * const { data: activePosts } = useInfiniteQuery({
 *   queryKey: ['posts'],
 *   queryFn: fetchPosts,
 *   select: (data) => selectInfiniteDataFiltered(data, post => !post.isHidden),
 * })
 * ```
 */
export function selectInfiniteDataFiltered<T>(
  data: InfiniteData<CursorPageResponse<T>>,
  predicate: (item: T) => boolean
): T[] {
  return data.pages.flatMap((page) => page.data).filter(predicate);
}

/**
 * Gets total count from infinite query metadata
 */
export function selectInfiniteCount<T>(
  data: InfiniteData<CursorPageResponse<T>>
): number {
  return data.pages.reduce((acc, page) => acc + page.data.length, 0);
}

/**
 * Checks if infinite query has any data
 */
export function selectHasInfiniteData<T>(
  data: InfiniteData<CursorPageResponse<T>>
): boolean {
  return data.pages.some((page) => page.data.length > 0);
}

/**
 * Selects first item from infinite query
 */
export function selectFirstInfiniteItem<T>(
  data: InfiniteData<CursorPageResponse<T>>
): T | undefined {
  return data.pages[0]?.data[0];
}

/**
 * Selects last item from infinite query
 */
export function selectLastInfiniteItem<T>(
  data: InfiniteData<CursorPageResponse<T>>
): T | undefined {
  const lastPage = data.pages[data.pages.length - 1];
  return lastPage?.data[lastPage.data.length - 1];
}
