/**
 * User-related React Query hooks
 * 
 * Platform-agnostic hooks for user profiles, friends, and social interactions.
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { userService } from '../api/services/user.service';
import { queryKeys } from './query-keys';
import type {
  UserDTO,
  UserProfile,
  UpdateUserInput,
} from '../types/user.types';
import type { CursorPaginatedResponse, QueryParams } from '../types/common.types';

// ==================== Query Hooks ====================

/**
 * Get current authenticated user
 */
export const useCurrentUser = () => {
  return useQuery<UserDTO>({
    queryKey: queryKeys.user.current(),
    queryFn: () => userService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Get user profile by ID
 */
export const useUser = (userId: string, options?: { enabled?: boolean }) => {
  return useQuery<UserProfile>({
    queryKey: queryKeys.user.detail(userId),
    queryFn: () => userService.getUser(userId),
    enabled: options?.enabled !== false && !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

/**
 * Search users
 */
export const useSearchUsers = (query: string, params?: QueryParams) => {
  return useInfiniteQuery<CursorPaginatedResponse<UserDTO>>({
    queryKey: queryKeys.search.users(query),
    queryFn: ({ pageParam }) =>
      userService.searchUsers({
        query,
        cursor: pageParam as string | undefined,
        limit: params?.limit,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    enabled: query.length > 0,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Get user's friends list
 */
export const useUserFriends = (userId: string, params?: QueryParams) => {
  return useInfiniteQuery<CursorPaginatedResponse<UserDTO>>({
    queryKey: queryKeys.user.friends(userId),
    queryFn: ({ pageParam }) =>
      userService.getUserFriends(userId, {
        ...params,
        cursor: pageParam as string | undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

// ==================== Mutation Hooks ====================

/**
 * Update user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<UserDTO, Error, UpdateUserInput>({
    mutationFn: (input) => userService.updateProfile(input),
    onSuccess: (updatedUser) => {
      // Update current user cache
      queryClient.setQueryData<UserDTO>(
        queryKeys.user.current(),
        updatedUser
      );
      
      // Update user detail cache
      queryClient.setQueryData<UserProfile>(
        queryKeys.user.detail(updatedUser.id),
        updatedUser
      );
      
      // Invalidate all user queries to refresh everywhere
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
};

// ==================== Friend Hooks ====================

/**
 * Send friend request
 */
export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (userId) => userService.sendFriendRequest(userId),
    onSuccess: (_, userId) => {
      // Invalidate friend requests to show pending
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.requests() });
      
      // Invalidate user detail to update relationship status
      queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(userId) });
    },
  });
};

/**
 * Accept friend request
 */
export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (requestId) => userService.acceptFriendRequest(requestId),
    onSuccess: () => {
      // Invalidate friend requests list
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.requests() });
      
      // Invalidate friends lists
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
};

/**
 * Reject friend request
 */
export const useRejectFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (requestId) => userService.rejectFriendRequest(requestId),
    onSuccess: () => {
      // Invalidate friend requests list
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.requests() });
    },
  });
};

/**
 * Remove friend (unfriend)
 */
export const useRemoveFriend = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (userId) => userService.removeFriend(userId),
    onSuccess: (_, userId) => {
      // Invalidate friends lists
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.all });
      
      // Invalidate user detail to update relationship status
      queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(userId) });
    },
  });
};

/**
 * Block user
 */
export const useBlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (userId) => userService.blockUser(userId),
    onSuccess: (_, userId) => {
      // Invalidate user detail
      queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(userId) });
      
      // Invalidate friends lists
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.all });
      
      // Invalidate feeds (remove blocked user's posts)
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
    },
  });
};

/**
 * Unblock user
 */
export const useUnblockUser = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (userId) => userService.unblockUser(userId),
    onSuccess: (_, userId) => {
      // Invalidate user detail
      queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(userId) });
    },
  });
};
