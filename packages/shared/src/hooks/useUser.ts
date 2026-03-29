/**
 * User-related React Query hooks
 *
 * Platform-agnostic hooks for user profiles with optimistic updates.
 * These hooks use the userService and provide type-safe queries and mutations.
 */

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { friendService } from '../api/services/friend.service';
import { userService } from '../api/services/user.service';
import type {
  CursorPageResponse,
  QueryParams,
} from '../types/common.types';
import type {
  UpdateUserInput,
  UserDTO,
  UserProfile,
} from '../types/user.types';
import { useUploadOptional } from '../contexts/upload-context';
import type { UploadableFile } from '../types/upload.types';
import {
  cancelQueries,
  invalidateQueries,
  restoreQueryData,
  snapshotQueryData,
} from '../utils/cache-utils';
import { queryConfigs } from '../utils/query-configs';
import { queryKeys } from './query-keys';

// ==================== Query Hooks ====================

/**
 * Get current authenticated user
 */
export const useCurrentUser = () => {
  return useQuery<UserDTO>({
    queryKey: queryKeys.user.current(),
    queryFn: async () => {
      return userService.getCurrentUser();
    },
    ...queryConfigs.semiStatic, // User profile changes infrequently
  });
};

/**
 * Get user profile by ID
 */
export const useUser = (userId: string, options?: { enabled?: boolean }) => {
  return useQuery<UserProfile>({
    queryKey: queryKeys.user.detail(userId),
    queryFn: async () => {
      return userService.getUser(userId);
    },
    enabled: options?.enabled !== false && !!userId,
    ...queryConfigs.semiStatic,
  });
};

/**
 * Search users
 */
export const useSearchUsers = (query: string, params?: QueryParams) => {
  return useInfiniteQuery<CursorPageResponse<UserDTO>>({
    queryKey: [...queryKeys.search.users(query), params ?? {}] as const,
    queryFn: async ({ pageParam }) => {
      return userService.searchUsers({
        query,
        cursor: pageParam as string | undefined,
        limit: params?.limit,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor ?? undefined : undefined,
    initialPageParam: undefined,
    enabled: query.length > 0,
    ...queryConfigs.standard,
  });
};

/**
 * Get user's friends list
 */
export const useUserFriends = (userId: string, params?: QueryParams) => {
  return useInfiniteQuery<CursorPageResponse<UserDTO>>({
    queryKey: [...queryKeys.user.friends(userId), params ?? {}] as const,
    queryFn: async ({ pageParam }) => {
      return userService.getUserFriends(userId, {
        ...params,
        cursor: pageParam as string | undefined,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor ?? undefined : undefined,
    initialPageParam: undefined,
    enabled: !!userId,
    ...queryConfigs.semiStatic,
  });
};

// ==================== Mutation Hooks ====================

/**
 * Update user profile
 * With optimistic updates
 * 
 * @example
 * const updateProfile = useUpdateProfile();
 * updateProfile.mutate({
 *   firstName: 'John',
 *   bio: 'Software engineer',
 *   uploadAvatar: { file: avatarFile, type: MediaType.IMAGE },
 *   uploadCover: { file: coverFile, type: MediaType.IMAGE }
 * });
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const uploadService = useUploadOptional();

  return useMutation<
    UserDTO,
    Error,
    UpdateUserInput & {
      uploadAvatar?: UploadableFile;
      uploadCover?: UploadableFile;
    }
  >({
    mutationFn: async ({ uploadAvatar, uploadCover, ...input }) => {
      // Upload avatar if provided
      if (uploadAvatar && uploadService) {
        try {
          const avatarResult = await uploadService.uploadFile(uploadAvatar, {
            folder: 'users/avatars',
          });

          input.avatarUrl = avatarResult.url;
        } catch (uploadError) {
          console.error('Avatar upload failed:', uploadError);
          throw new Error('Failed to upload avatar. Please try again.');
        }
      }

      // Upload cover image if provided
      if (uploadCover && uploadService) {
        try {
          const coverResult = await uploadService.uploadFile(uploadCover, {
            folder: 'users/covers',
          });

          input.coverImageUrl = coverResult.url;
        } catch (uploadError) {
          console.error('Cover image upload failed:', uploadError);
          throw new Error('Failed to upload cover image. Please try again.');
        }
      }

      return userService.updateProfile(input);
    },
    onMutate: async (updatedProfile) => {
      // Cancel outgoing queries
      await cancelQueries(queryClient, [
        [...queryKeys.user.current()] as unknown[],
      ]);

      // Snapshot for rollback
      const context = snapshotQueryData<UserDTO>(queryClient, [
        ...queryKeys.user.current(),
      ] as unknown[]);

      // Optimistically update current user
      queryClient.setQueryData<UserDTO>(queryKeys.user.current(), (old) =>
        old ? { ...old, ...updatedProfile } : old,
      );

      return context;
    },
    onSuccess: (updatedUser) => {
      // Update current user cache
      queryClient.setQueryData<UserDTO>(queryKeys.user.current(), updatedUser);

      // Update user detail cache
      queryClient.setQueryData<UserProfile>(
        queryKeys.user.detail(updatedUser.id),
        updatedUser,
      );

      // Invalidate all user queries to refresh everywhere
      invalidateQueries(queryClient, [[...queryKeys.user.all] as unknown[]]);
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context) {
        restoreQueryData(
          queryClient,
          [...queryKeys.user.current()] as unknown[],
          context,
        );
      }
    },
  });
};

// ==================== Friend Hooks ====================

/**
 * Send friend request
 */
export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    | string
    | {
        targetId: string;
        recommendationId?: string;
        recommendationRequestId?: string;
      }
  >({
    mutationFn: async (input) => {
      const targetId = typeof input === 'string' ? input : input.targetId;
      const payload =
        typeof input === 'string'
          ? undefined
          : {
              recommendationId: input.recommendationId,
              recommendationRequestId: input.recommendationRequestId,
            };

      return friendService.sendFriendRequest(targetId, payload);
    },
    onSuccess: (_, input) => {
      const userId = typeof input === 'string' ? input : input.targetId;
      // Invalidate friend requests to show pending
      invalidateQueries(queryClient, [
        ['friend-suggestions'],
        [...queryKeys.friends.requests()] as unknown[],
        [...queryKeys.user.detail(userId)] as unknown[], // Update relationship status
      ]);
    },
  });
};

/**
 * Accept friend request
 */
export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (requestId) => {
      return friendService.acceptFriendRequest(requestId);
    },
    onSuccess: () => {
      // Invalidate friend requests list
      invalidateQueries(queryClient, [
        [...queryKeys.friends.requests()] as unknown[],
        [...queryKeys.friends.all] as unknown[],
        [...queryKeys.user.all] as unknown[],
      ]);
    },
  });
};

/**
 * Reject friend request
 */
export const useRejectFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (requestId) => friendService.declineFriendRequest(requestId),
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
    mutationFn: (userId) => friendService.removeFriend(userId),
    onSuccess: (_, userId) => {
      // Invalidate friends lists
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.all });

      // Invalidate user detail to update relationship status
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.detail(userId),
      });
    },
  });
};

/**
 * Block user
 */
export const useBlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (userId) => friendService.blockUser(userId),
    onSuccess: (_, userId) => {
      // Invalidate user detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.detail(userId),
      });

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
    mutationFn: (userId) => friendService.unblockUser(userId),
    onSuccess: (_, userId) => {
      // Invalidate user detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.detail(userId),
      });
    },
  });
};
