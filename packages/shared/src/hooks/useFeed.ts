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
    select: (data) =>
      data.pages.flatMap((page) => page.data.map(normalizePersonalFeedItem)),
    staleTime: 10 * 1000,
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
    select: (data) =>
      data.pages.flatMap((page) => page.data.map(normalizeTrendingPost)),
    staleTime: 10 * 1000,
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
