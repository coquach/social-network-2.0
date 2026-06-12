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
  type FriendRecommendationAnalyticsDTO,
  type RecommendationAttributionPayload,
  type FriendSuggestionDTO,
  type RelationshipStatusResponse,
} from '../api/services';
import { userService } from '../api/services/user.service';
import type { CursorPageResponse, QueryParams, UserDTO } from '../types';
import { cancelQueries, invalidateQueries } from '../utils/cache-utils';
import { queryConfigs } from '../utils/query-configs';
import { mutationKeys, queryKeys } from './query-keys';

type FriendQueryOptions = {
  enabled?: boolean;
};

const hydrateUserIdsPage = async (
  page: CursorPageResponse<string>,
): Promise<CursorPageResponse<UserDTO>> => {
  const users: (UserDTO | null)[] = [];
  
  // Fetch users one by one to avoid thundering herd on user-service
  // especially helpful when Redis cache is empty
  for (const userId of (page.data ?? [])) {
    try {
      const user = await userService.getUser(userId);
      users.push(user);
    } catch {
      users.push(null);
    }
  }

  return {
    ...page,
    data: users.filter((item): item is UserDTO => item !== null),
  };
};

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
export const useFriendRequests = (
  params?: { limit?: number },
  options?: FriendQueryOptions,
) => {
  return useInfiniteQuery<CursorPageResponse<string>>({
    queryKey: [...queryKeys.friends.requests(), params ?? {}] as const,
    queryFn: async ({ pageParam }) => {
      return friendService.getFriendRequests({
        ...params,
        cursor: pageParam as string | undefined,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor ?? undefined : undefined,
    initialPageParam: undefined,
    enabled: options?.enabled ?? true,
    ...queryConfigs.realtime,
  });
};

/**
 * Hook to get friend request sender profiles (infinite scroll).
 */
export const useFriendRequestUsers = (
  params?: { limit?: number },
  options?: FriendQueryOptions,
) => {
  return useInfiniteQuery<CursorPageResponse<UserDTO>>({
    queryKey: [...queryKeys.friends.requests(), 'profiles', params ?? {}] as const,
    queryFn: async ({ pageParam }) => {
      const requestIdsPage = await friendService.getFriendRequests({
        ...params,
        cursor: pageParam as string | undefined,
      });

      return hydrateUserIdsPage(requestIdsPage);
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor ?? undefined : undefined,
    initialPageParam: undefined,
    enabled: options?.enabled ?? true,
    ...queryConfigs.realtime,
  });
};

/**
 * Hook to get friends list (infinite scroll)
 */
export const useFriends = (
  userId?: string,
  params?: { limit?: number },
  options?: FriendQueryOptions,
) => {
  return useInfiniteQuery<CursorPageResponse<string>>({
    queryKey: [...queryKeys.friends.list(userId), params ?? {}] as const,
    queryFn: async ({ pageParam }) => {
      return friendService.getFriends(userId, {
        ...params,
        cursor: pageParam as string | undefined,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor ?? undefined : undefined,
    initialPageParam: undefined,
    enabled: options?.enabled ?? true,
    ...queryConfigs.semiStatic,
  });
};

/**
 * Hook to get a user's friend profiles (UserDTO list).
 * This is useful for profile/group UIs that need avatar/name directly.
 */
export const useFriendUsers = (
  userId: string,
  params?: QueryParams & { search?: string },
  options?: FriendQueryOptions,
) => {
  return useInfiniteQuery<CursorPageResponse<UserDTO>>({
    queryKey: [...queryKeys.user.friends(userId), params ?? {}] as const,
    queryFn: async ({ pageParam }) => {
      const friendIdsPage = await friendService.getFriends(userId, {
        ...params,
        cursor: pageParam as string | undefined,
      });

      return hydrateUserIdsPage(friendIdsPage);
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor ?? undefined : undefined,
    initialPageParam: undefined,
    enabled: options?.enabled !== false && !!userId,
    ...queryConfigs.semiStatic,
  });
};

/**
 * Hook to get friend suggestions (infinite scroll)
 */
export const useFriendSuggestions = (
  params?: { limit?: number },
  options?: FriendQueryOptions,
) => {
  return useInfiniteQuery<CursorPageResponse<FriendSuggestionDTO>>({
    queryKey: queryKeys.friends.suggestions(params ?? {}),
    queryFn: async ({ pageParam }) => {
      return friendService.getFriendSuggestions({
        ...params,
        cursor: pageParam as string | undefined,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor ?? undefined : undefined,
    initialPageParam: undefined,
    enabled: options?.enabled ?? true,
    ...queryConfigs.standard,
  });
};

/**
 * Hook to get recommendation funnel analytics
 */
export const useFriendRecommendationAnalytics = (days?: number) => {
  return useQuery<FriendRecommendationAnalyticsDTO>({
    queryKey: queryKeys.friends.analytics(days),
    queryFn: async () => {
      return friendService.getFriendRecommendationAnalytics(days);
    },
    ...queryConfigs.standard,
  });
};

/**
 * Hook to get blocked users (infinite scroll)
 */
export const useBlockedUsers = (
  params?: { limit?: number },
  options?: FriendQueryOptions,
) => {
  return useInfiniteQuery<CursorPageResponse<string>>({
    queryKey: [...queryKeys.friends.blocked(), params ?? {}] as const,
    queryFn: async ({ pageParam }) => {
      return friendService.getBlockedUsers({
        ...params,
        cursor: pageParam as string | undefined,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor ?? undefined : undefined,
    initialPageParam: undefined,
    enabled: options?.enabled ?? true,
    ...queryConfigs.semiStatic,
  });
};

/**
 * Hook to get blocked user profiles (infinite scroll).
 */
export const useBlockedUserProfiles = (
  params?: { limit?: number },
  options?: FriendQueryOptions,
) => {
  return useInfiniteQuery<CursorPageResponse<UserDTO>>({
    queryKey: [...queryKeys.friends.blocked(), 'profiles', params ?? {}] as const,
    queryFn: async ({ pageParam }) => {
      const blockedIdsPage = await friendService.getBlockedUsers({
        ...params,
        cursor: pageParam as string | undefined,
      });

      return hydrateUserIdsPage(blockedIdsPage);
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor ?? undefined : undefined,
    initialPageParam: undefined,
    enabled: options?.enabled ?? true,
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
    mutationFn: async (
      input:
        | string
        | ({
            targetId: string;
          } & RecommendationAttributionPayload),
    ) => {
      const targetId = typeof input === 'string' ? input : input.targetId;
      const payload =
        typeof input === 'string'
          ? undefined
          : {
              recommendationId: input.recommendationId,
              recommendationRequestId: input.recommendationRequestId,
            };

      return friendService.dismissFriendRecommendation(targetId, payload);
    },
    onSuccess: (_, input) => {
      const targetId = typeof input === 'string' ? input : input.targetId;
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
