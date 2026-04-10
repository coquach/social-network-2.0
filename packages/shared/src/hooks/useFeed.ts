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
  PersonalFeedItem,
  PostDTO,
  PostSnapshotDTO,
} from '../types';
import { queryKeys } from './query-keys';
import {
  normalizePersonalFeedItem,
  normalizeTrendingPost,
} from '../lib/mapper/feed.mapper';

const personalPageCache = new WeakMap<object, PersonalFeedItem[]>();
const trendingPageCache = new WeakMap<object, PostSnapshotDTO[]>();

function mapPersonalPageCached(page: { data: FeedDTO[] }) {
  const cached = personalPageCache.get(page as object);
  if (cached) {
    return cached;
  }

  const mapped = page.data.map(normalizePersonalFeedItem);
  personalPageCache.set(page as object, mapped);
  return mapped;
}

function mapTrendingPageCached(page: { data: PostDTO[] }) {
  const cached = trendingPageCache.get(page as object);
  if (cached) {
    return cached;
  }

  const mapped = page.data.map(normalizeTrendingPost);
  trendingPageCache.set(page as object, mapped);
  return mapped;
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
    PersonalFeedItem[]
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
      const merged: PersonalFeedItem[] = [];
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
    CursorPageResponse<PostDTO>,
    Error,
    PostSnapshotDTO[]
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
      const merged: PostSnapshotDTO[] = [];
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
