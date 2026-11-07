'use client';

import { ReactNode, RefObject } from 'react';
import { cn } from '@/lib/utils';

export interface AsyncListProps<T> {
  /** Array of items to render */
  items: T[];
  /** Render function for each item — receives item and index */
  renderItem: (item: T, index: number) => ReactNode;
  /** Key extractor function */
  keyExtractor: (item: T) => string;

  /** Loading state — shows skeletons */
  isLoading?: boolean;
  /** Error state — shows error message or custom error component */
  isError?: boolean;
  /** Error message to display (used if errorState is not provided) */
  errorMessage?: string;
  /** Custom error component — shown when isError is true */
  errorState?: ReactNode;

  /** Skeleton placeholder — shown while loading */
  skeleton?: ReactNode;
  /** Number of skeletons to show (default: 3) */
  skeletonCount?: number;

  /** Empty state component — shown when items is empty and not loading */
  emptyState?: ReactNode;

  /** Sentinel ref for infinite scroll */
  sentinelRef?: RefObject<HTMLDivElement | null> | ((node: HTMLDivElement | null) => void);
  /** Loading more indicator (shown at end during infinite scroll fetch) */
  loadingMore?: ReactNode;

  /** Additional class for the list container */
  className?: string;
  /** Whether to animate item entry (default: true) */
  animate?: boolean;
  /** Whether to stagger animation delay of items (default: false) */
  stagger?: boolean;
}

/**
 * AsyncList — Reusable list component with loading, error, empty, and infinite scroll states.
 *
 * Encapsulates the repeated UI pattern across feeds, notifications, and lists.
 *
 * @example
 * <AsyncList
 *   items={posts}
 *   keyExtractor={(p) => p.postId}
 *   renderItem={(post, i) => <PostCardFull data={post} />}
 *   isLoading={isLoading}
 *   isError={isError}
 *   errorState={<ErrorFallback message={error?.message} />}
 *   skeleton={<PostCardFull.Skeleton />}
 *   skeletonCount={3}
 *   emptyState={<EmptyState />}
 *   sentinelRef={sentinelRef}
 *   loadingMore={<PostCardFull.Skeleton />}
 *   stagger
 * />
 */
export function AsyncList<T>({
  items,
  renderItem,
  keyExtractor,
  isLoading,
  isError,
  errorMessage,
  errorState,
  skeleton,
  skeletonCount = 3,
  emptyState,
  sentinelRef,
  loadingMore,
  className,
  animate = true,
  stagger = false,
}: AsyncListProps<T>) {
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i}>{skeleton}</div>
        ))}
      </div>
    );
  }

  if (isError) {
    if (errorState) {
      return <>{errorState}</>;
    }
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-4 text-sm text-destructive">
        {errorMessage ?? 'Đã có lỗi xảy ra. Vui lòng thử lại.'}
      </div>
    );
  }

  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item, index) => (
        <div
          key={keyExtractor(item)}
          className={cn(animate && 'animate-fade-in-up')}
          style={stagger ? { animationDelay: `${Math.min(index * 40, 300)}ms` } : undefined}
        >
          {renderItem(item, index)}
        </div>
      ))}

      {/* Infinite scroll sentinel */}
      {sentinelRef && <div ref={sentinelRef} aria-hidden />}

      {/* Loading more indicator */}
      {loadingMore && <div>{loadingMore}</div>}
    </div>
  );
}
