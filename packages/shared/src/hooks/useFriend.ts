/**
 * Friend Hooks
 * React Query hooks for friend/social relationship operations with optimistic updates
 *
 * Note: Some friend mutation hooks are in useUser.ts for backwards compatibility:
 * - useSendFriendRequest
 * - useAcceptFriendRequest
 * - useRejectFriendRequest
 * - useRemoveFriend
 * - useBlockUser
 * - useUnblockUser
 * - useUserFriends
 */

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  friendService,
  type FriendSuggestionDTO,
  type RelationshipStatusResponse,
} from '../api/services';
import type { CursorPageResponse } from '../types';
import { cancelQueries, invalidateQueries } from '../utils/cache-utils';
import { queryConfigs } from '../utils/query-configs';
import { mutationKeys, queryKeys } from './query-keys';

/**
 * Hook to get relationship status with a user
 */
export const useRelationshipStatus = (targetId: string) => {
  return useQuery<RelationshipStatusResponse>({
    queryKey: queryKeys.friends.relationshipStatus(targetId),
    queryFn: async () => {
      return friendService.getRelationshipStatus(targetId);
    },
    enabled: !!targetId,
    ...queryConfigs.standard,
  });
};

/**
 * Hook to get friend requests (infinite scroll)
 */
export const useFriendRequests = (params?: { limit?: number }) => {
  return useInfiniteQuery<CursorPageResponse<string>>({
    queryKey: queryKeys.friends.requests(),
    queryFn: async ({ pageParam }) => {
      return friendService.getFriendRequests({
        ...params,
        cursor: pageParam as string | undefined,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor ?? undefined : undefined,
    initialPageParam: undefined,
    ...queryConfigs.realtime,
  });
};

/**
 * Hook to get friends list (infinite scroll)
 */
export const useFriends = (userId?: string, params?: { limit?: number }) => {
  return useInfiniteQuery<CursorPageResponse<string>>({
    queryKey: queryKeys.friends.list(userId),
    queryFn: async ({ pageParam }) => {
      return friendService.getFriends(userId, {
        ...params,
        cursor: pageParam as string | undefined,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor ?? undefined : undefined,
    initialPageParam: undefined,
    ...queryConfigs.semiStatic,
  });
};

/**
 * Hook to get friend suggestions (infinite scroll)
 */
export const useFriendSuggestions = (params?: { limit?: number }) => {
  return useInfiniteQuery<CursorPageResponse<FriendSuggestionDTO>>({
    queryKey: queryKeys.friends.suggestions(),
    queryFn: async ({ pageParam }) => {
      return friendService.getFriendSuggestions({
        ...params,
        cursor: pageParam as string | undefined,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor ?? undefined : undefined,
    initialPageParam: undefined,
    ...queryConfigs.standard,
  });
};

/**
 * Hook to get blocked users (infinite scroll)
 */
export const useBlockedUsers = (params?: { limit?: number }) => {
  return useInfiniteQuery<CursorPageResponse<string>>({
    queryKey: queryKeys.friends.blocked(),
    queryFn: async ({ pageParam }) => {
      return friendService.getBlockedUsers({
        ...params,
        cursor: pageParam as string | undefined,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor ?? undefined : undefined,
    initialPageParam: undefined,
    ...queryConfigs.semiStatic,
  });
};

/**
 * Hook to dismiss a friend recommendation
 */
export const useDismissFriendRecommendation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.friends.dismiss,
    mutationFn: async (targetId: string) => {
      return friendService.dismissFriendRecommendation(targetId);
    },
    onSuccess: (_, targetId) => {
      invalidateQueries(queryClient, [
        ['friend-suggestions'],
        [...queryKeys.friends.relationshipStatus(targetId)] as unknown[],
        [...queryKeys.user.detail(targetId)] as unknown[],
      ]);
    },
  });
};

/**
 * Hook to cancel friend request
 */
export const useCancelFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetId: string) => {
      return friendService.cancelFriendRequest(targetId);
    },
    onMutate: async (targetId) => {
      // Cancel outgoing queries to prevent race conditions
      await cancelQueries(queryClient, [
        [...queryKeys.friends.relationshipStatus(targetId)] as unknown[],
      ]);
    },
    onSuccess: (_, targetId) => {
      invalidateQueries(queryClient, [
        ['friend-suggestions'],
        [...queryKeys.friends.relationshipStatus(targetId)] as unknown[],
        [...queryKeys.user.detail(targetId)] as unknown[],
      ]);
    },
  });
};

/**
 * Hook to decline friend request
 */
export const useDeclineFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requesterId: string) => {
      return friendService.declineFriendRequest(requesterId);
    },
    onMutate: async (requesterId) => {
      // Cancel outgoing queries to prevent race conditions
      await cancelQueries(queryClient, [
        [...queryKeys.friends.requests()] as unknown[],
        [...queryKeys.friends.relationshipStatus(requesterId)] as unknown[],
      ]);
    },
    onSuccess: (_, requesterId) => {
      invalidateQueries(queryClient, [
        [...queryKeys.friends.requests()] as unknown[],
        [...queryKeys.friends.relationshipStatus(requesterId)] as unknown[],
        [...queryKeys.user.detail(requesterId)] as unknown[],
      ]);
    },
  });
};
