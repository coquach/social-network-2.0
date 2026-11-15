/**
 * Feed Hooks
 * React Query hooks for feed operations
 */

import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { feedService } from '../api/services';
import type {
  CursorPageResponse,
  Emotion,
  FeedDTO,
  FeedItem,
} from '../types';
import { queryKeys } from './query-keys';
import { normalizeFeedItem } from '../lib/mapper/feed.mapper';

const personalPageCache = new WeakMap<object, FeedItem[]>();
const trendingPageCache = new WeakMap<object, FeedItem[]>();

/**
 * Maps a polymorphic feed page to FeedItem[], skipping malformed items
 * (e.g. INTERVENTION/POST/SHARE items with a missing payload) instead of
 * crashing the whole feed.
 */
function mapPageCached(
  page: { data: FeedDTO[] },
  cache: WeakMap<object, FeedItem[]>,
): FeedItem[] {
  const cached = cache.get(page as object);
  if (cached) {
    return cached;
  }

  const mapped: FeedItem[] = [];
  for (const feed of page.data) {
    try {
      mapped.push(normalizeFeedItem(feed));
    } catch (err: unknown) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[useFeed] Skipping malformed feed item:', feed.id, err);
      }
    }
  }
  cache.set(page as object, mapped);
  return mapped;
}

function mapPersonalPageCached(page: { data: FeedDTO[] }) {
  return mapPageCached(page, personalPageCache);
}

function mapTrendingPageCached(page: { data: FeedDTO[] }) {
  return mapPageCached(page, trendingPageCache);
}

/**
 * Hook to get personalized feed (infinite scroll)
 */
export const useMyFeed = (params?: {
  mainEmotion?: Emotion;
  limit?: number;
}) => {
  return useInfiniteQuery<
    CursorPageResponse<FeedDTO>,
    Error,
    FeedItem[]
  >({
    queryKey: queryKeys.feed.personal(params?.mainEmotion),
    queryFn: ({ pageParam }) =>
      feedService.getMyFeed({
        ...params,
        cursor: pageParam as string | undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
    select: (data) => {
      const merged: FeedItem[] = [];
      for (const page of data.pages) {
        merged.push(...mapPersonalPageCached(page));
      }
      return merged;
    },
    staleTime: 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnReconnect: true,
  });
};

/**
 * Hook to get trending feed (infinite scroll)
 */
export const useTrendingFeed = (params?: {
  mainEmotion?: Emotion;
  limit?: number;
}) => {
  return useInfiniteQuery<
    CursorPageResponse<FeedDTO>,
    Error,
    FeedItem[]
  >({
    queryKey: queryKeys.feed.trending(params?.mainEmotion),
    queryFn: ({ pageParam }) =>
      feedService.getTrendingFeed({
        ...params,
        cursor: pageParam as string | undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
    select: (data) => {
      const merged: FeedItem[] = [];
      for (const page of data.pages) {
        merged.push(...mapTrendingPageCached(page));
      }
      return merged;
    },
    staleTime: 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnReconnect: true,
  });
};

/**
 * Hook to track feed item views
 */
export const useTrackFeedViews = () => {
  return useMutation({
    mutationFn: (feedItemIds: string[]) => feedService.trackViews(feedItemIds),
  });
};
