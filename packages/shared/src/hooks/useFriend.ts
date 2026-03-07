/**
 * Friend Hooks
 * React Query hooks for friend/social relationship operations
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

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { friendService, type FriendSuggestionDTO, type RelationshipStatusResponse } from '../api/services';
import type { CursorPaginatedResponse } from '../types';
import { queryKeys } from './query-keys';

/**
 * Hook to get relationship status with a user
 */
export const useRelationshipStatus = (targetId: string) => {
  return useQuery<RelationshipStatusResponse>({
    queryKey: queryKeys.friends.relationshipStatus(targetId),
    queryFn: () => friendService.getRelationshipStatus(targetId),
    enabled: !!targetId,
  });
};

/**
 * Hook to get friend requests (infinite scroll)
 */
export const useFriendRequests = (params?: { limit?: number }) => {
  return useInfiniteQuery<CursorPaginatedResponse<string>>({
    queryKey: queryKeys.friends.requests(),
    queryFn: ({ pageParam }) =>
      friendService.getFriendRequests({ ...params, cursor: pageParam as string | undefined }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  });
};

/**
 * Hook to get friends list (infinite scroll)
 */
export const useFriends = (userId?: string, params?: { limit?: number }) => {
  return useInfiniteQuery<CursorPaginatedResponse<string>>({
    queryKey: queryKeys.friends.list(userId),
    queryFn: ({ pageParam }) =>
      friendService.getFriends(userId, { ...params, cursor: pageParam as string | undefined }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  });
};

/**
 * Hook to get friend suggestions (infinite scroll)
 */
export const useFriendSuggestions = (params?: { limit?: number }) => {
  return useInfiniteQuery<CursorPaginatedResponse<FriendSuggestionDTO>>({
    queryKey: queryKeys.friends.suggestions(),
    queryFn: ({ pageParam }) =>
      friendService.getFriendSuggestions({ ...params, cursor: pageParam as string | undefined }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  });
};

/**
 * Hook to get blocked users (infinite scroll)
 */
export const useBlockedUsers = (params?: { limit?: number }) => {
  return useInfiniteQuery<CursorPaginatedResponse<string>>({
    queryKey: queryKeys.friends.blocked(),
    queryFn: ({ pageParam }) =>
      friendService.getBlockedUsers({ ...params, cursor: pageParam as string | undefined }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  });
};

/**
 * Hook to cancel friend request
 */
export const useCancelFriendRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (targetId: string) => friendService.cancelFriendRequest(targetId),
    onSuccess: (_, targetId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.relationshipStatus(targetId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(targetId) });
    },
  });
};

/**
 * Hook to decline friend request
 */
export const useDeclineFriendRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (requesterId: string) => friendService.declineFriendRequest(requesterId),
    onSuccess: (_, requesterId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.requests() });
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.relationshipStatus(requesterId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(requesterId) });
    },
  });
};

