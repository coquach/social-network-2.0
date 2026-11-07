'use client';

import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

export interface UseInfiniteScrollOptions {
  /** Whether there are more pages to load */
  hasNextPage: boolean | undefined;
  /** Whether a fetch is currently in progress */
  isFetchingNextPage: boolean;
  /** Callback to fetch the next page */
  fetchNextPage: () => void;
  /** IntersectionObserver threshold (default: 0) */
  threshold?: number;
  /** Root margin for triggering fetch earlier (e.g. '200px') */
  rootMargin?: string;
}

/**
 * Web hook for infinite scrolling using IntersectionObserver.
 * Triggers `fetchNextPage` automatically when the sentinel element enters the viewport.
 *
 * @example
 * ```tsx
 * const { sentinelRef } = useInfiniteScroll({ hasNextPage, isFetchingNextPage, fetchNextPage });
 * return (
 *   <div>
 *     {items.map(...)}
 *     <div ref={sentinelRef} aria-hidden />
 *   </div>
 * );
 * ```
 */
export function useInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  threshold = 0,
  rootMargin = '200px',
}: UseInfiniteScrollOptions) {
  const { ref: sentinelRef, inView } = useInView({
    threshold,
    rootMargin,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return { sentinelRef };
}
