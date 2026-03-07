/**
 * Feed Hooks
 * React Query hooks for feed operations
 */

import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { feedService } from '../api/services';
import type { CursorPaginatedResponse, FeedDTO, PostDTO, Emotion } from '../types';
import { queryKeys } from './query-keys';

/**
 * Hook to get personalized feed (infinite scroll)
 */
export const useMyFeed = (params?: { mainEmotion?: Emotion; limit?: number }) => {
  return useInfiniteQuery<CursorPaginatedResponse<FeedDTO>>({
    queryKey: queryKeys.feed.personal(params?.mainEmotion),
    queryFn: ({ pageParam }) =>
      feedService.getMyFeed({ ...params, cursor: pageParam as string | undefined }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 15 * 1000, // 15 seconds
  });
};

/**
 * Hook to get trending feed (infinite scroll)
 */
export const useTrendingFeed = (params?: { mainEmotion?: Emotion; limit?: number }) => {
  return useInfiniteQuery<CursorPaginatedResponse<PostDTO>>({
    queryKey: queryKeys.feed.trending(params?.mainEmotion),
    queryFn: ({ pageParam }) =>
      feedService.getTrendingFeed({ ...params, cursor: pageParam as string | undefined }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 15 * 1000, // 15 seconds
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
