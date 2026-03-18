/**
 * Share-related React Query hooks
 *
 * Platform-agnostic hooks for sharing posts with optimistic updates.
 * These hooks use the shareService and provide type-safe queries and mutations.
 */

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { shareService } from '../api/services/share.service';
import type { CursorPageResponse } from '../types/common.types';
import type {
  CreateShareInput,
  GetShareQueryParams,
  SharePostDTO,
  SharePostSnapshotDTO,
  UpdateShareInput,
} from '../types/share.types';
import {
  addItemToInfiniteCache,
  cancelQueries,
  invalidateQueries,
  removeItemFromInfiniteCache,
  restoreQueryData,
  snapshotQueryData,
  updateItemInInfiniteCache,
} from '../utils/cache-utils';
import { queryConfigs } from '../utils/query-configs';
import { queryKeys } from './query-keys';

// ==================== Query Hooks ====================

/**
 * Get a single share by ID
 */
export const useShare = (shareId: string, options?: { enabled?: boolean }) => {
  return useQuery<SharePostDTO>({
    queryKey: queryKeys.shares.detail(shareId),
    queryFn: async () => {
      return shareService.getShareById(shareId);
    },
    enabled: options?.enabled !== false && !!shareId,
    ...queryConfigs.standard,
  });
};

/**
 * Get shares for a post with infinite scroll
 */
export const usePostShares = (postId: string, params?: GetShareQueryParams) => {
  return useInfiniteQuery<CursorPageResponse<SharePostSnapshotDTO>>({
    queryKey: queryKeys.shares.byPost(postId),
    queryFn: async ({ pageParam }) => {
      return shareService.getPostShares(postId, {
        ...params,
        cursor: pageParam as string | undefined,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor ?? undefined : undefined,
    initialPageParam: undefined,
    enabled: !!postId,
    ...queryConfigs.standard,
  });
};

/**
 * Get current user's shares with infinite scroll
 */
export const useMyShares = (params?: GetShareQueryParams) => {
  return useInfiniteQuery<CursorPageResponse<SharePostSnapshotDTO>>({
    queryKey: [...queryKeys.shares.all, 'me'],
    queryFn: async ({ pageParam }) => {
      return shareService.getMyShares({
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
 * Get a user's shares with infinite scroll
 */
export const useUserShares = (userId: string, params?: GetShareQueryParams) => {
  return useInfiniteQuery<CursorPageResponse<SharePostSnapshotDTO>>({
    queryKey: queryKeys.shares.byUser(userId),
    queryFn: async ({ pageParam }) => {
      return shareService.getUserShares(userId, {
        ...params,
        cursor: pageParam as string | undefined,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor ?? undefined : undefined,
    initialPageParam: undefined,
    enabled: !!userId,
    ...queryConfigs.standard,
  });
};

// ==================== Mutation Hooks ====================

/**
 * Share a post
 * With optimistic updates
 */
export const useSharePost = () => {
  const queryClient = useQueryClient();

  return useMutation<SharePostDTO, Error, CreateShareInput>({
    mutationFn: async (input) => {
      return shareService.sharePost(input);
    },
    onSuccess: (newShare, variables) => {
      // Add to detail cache
      queryClient.setQueryData<SharePostDTO>(
        queryKeys.shares.detail(newShare.id),
        newShare,
      );

      // Add to my shares list (optimistic)
      addItemToInfiniteCache(
        queryClient,
        [...queryKeys.shares.all, 'me'] as unknown[],
        newShare as any, // SharePostSnapshotDTO
      );

      // Invalidate related queries
      invalidateQueries(queryClient, [
        [...queryKeys.shares.byPost(variables.postId)] as unknown[],
        [...queryKeys.posts.detail(variables.postId)] as unknown[], // Update share count
        [...queryKeys.feed.all] as unknown[], // Show new share in feed
      ]);
    },
  });
};

/**
 * Update a share post
 * With optimistic updates
 */
export const useUpdateShare = (shareId: string) => {
  const queryClient = useQueryClient();

  return useMutation<SharePostDTO, Error, UpdateShareInput>({
    mutationFn: async (input) => {
      return shareService.updateShare(shareId, input);
    },
    onMutate: async (updatedShare) => {
      // Cancel outgoing queries
      await cancelQueries(queryClient, [
        [...queryKeys.shares.detail(shareId)] as unknown[],
        [...queryKeys.shares.all] as unknown[],
      ]);

      // Snapshot for rollback
      const context = snapshotQueryData<SharePostDTO>(queryClient, [
        ...queryKeys.shares.detail(shareId),
      ] as unknown[]);

      // Optimistically update
      queryClient.setQueryData<SharePostDTO>(
        queryKeys.shares.detail(shareId),
        (old) => (old ? { ...old, ...updatedShare } : old),
      );

      return context;
    },
    onSuccess: (updatedShare) => {
      // Update share in cache
      queryClient.setQueryData<SharePostDTO>(
        queryKeys.shares.detail(shareId),
        updatedShare,
      );

      // Update in all list caches
      updateItemInInfiniteCache(
        queryClient,
        [...queryKeys.shares.all] as unknown[],
        updatedShare as any,
        (item: any, updated: any) => item.id === updated.id,
      );

      // Invalidate related queries
      invalidateQueries(queryClient, [
        [...queryKeys.shares.byPost(updatedShare.post.id)] as unknown[],
        [...queryKeys.feed.all] as unknown[],
      ]);
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context) {
        restoreQueryData(
          queryClient,
          [...queryKeys.shares.detail(shareId)] as unknown[],
          context,
        );
      }
    },
  });
};

/**
 * Delete a share post
 * With optimistic removal
 */
export const useDeleteShare = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { shareId: string; postId: string }>({
    mutationFn: async ({ shareId }) => {
      return shareService.deleteShare(shareId);
    },
    onMutate: async ({ shareId }) => {
      // Cancel outgoing queries
      await cancelQueries(queryClient, [
        [...queryKeys.shares.detail(shareId)] as unknown[],
        [...queryKeys.shares.all] as unknown[],
      ]);

      // Snapshot for rollback
      const context = snapshotQueryData<SharePostDTO>(queryClient, [
        ...queryKeys.shares.detail(shareId),
      ] as unknown[]);

      // Optimistically remove from cache
      removeItemFromInfiniteCache(
        queryClient,
        [...queryKeys.shares.all] as unknown[],
        (item: any) => item.id === shareId,
      );

      return context;
    },
    onSuccess: (_, { shareId, postId }) => {
      // Remove share from cache
      queryClient.removeQueries({
        queryKey: queryKeys.shares.detail(shareId),
      });

      // Invalidate related queries
      invalidateQueries(queryClient, [
        [...queryKeys.shares.byPost(postId)] as unknown[],
        [...queryKeys.posts.detail(postId)] as unknown[], // Update share count
        [...queryKeys.feed.all] as unknown[],
      ]);
    },
    onError: (_error, { shareId }, context) => {
      // Rollback on error
      if (context) {
        restoreQueryData(
          queryClient,
          [...queryKeys.shares.detail(shareId)] as unknown[],
          context,
        );
      }

      // Re-fetch to restore accurate state
      invalidateQueries(queryClient, [[...queryKeys.shares.all] as unknown[]]);
    },
  });
};
