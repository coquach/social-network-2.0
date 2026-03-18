/**
 * Reaction-related React Query hooks
 *
 * Platform-agnostic hooks for reactions with optimistic updates.
 * These hooks use the reactionService and provide type-safe queries and mutations.
 */

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { reactionService } from '../api/services/reaction.service';
import type { CursorPageResponse } from '../types/common.types';
import type { ReactionType, TargetType } from '../types/enums';
import type {
  CreateReactionInput,
  ReactionDTO,
  RemoveReactionInput,
} from '../types/reaction.types';
import { cancelQueries, invalidateQueries } from '../utils/cache-utils';
import { queryConfigs } from '../utils/query-configs';
import { queryKeys } from './query-keys';

// ==================== Query Hooks ====================

/**
 * Get reactions for a target with infinite scroll
 */
export const useReactions = (
  targetId: string,
  targetType: TargetType,
  reactionType?: ReactionType,
  options?: { enabled?: boolean },
) => {
  return useInfiniteQuery<CursorPageResponse<ReactionDTO>>({
    queryKey: queryKeys.reactions.list(targetId, targetType, reactionType),
    queryFn: async ({ pageParam }) => {
      return reactionService.getReactions({
        targetId,
        targetType,
        reactionType,
        cursor: pageParam as string | undefined,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor ?? undefined : undefined,
    initialPageParam: undefined,
    enabled: options?.enabled !== false && !!targetId && !!targetType,
    ...queryConfigs.realtime, // Reactions need to be fresh
  });
};

// ==================== Mutation Hooks ====================

/**
 * React to a target (post, comment, share)
 * With optimistic invalidation for fast UI updates
 */
export const useReact = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, CreateReactionInput>({
    mutationFn: async (input) => {
      return reactionService.react(input);
    },
    onMutate: async (variables) => {
      // Cancel outgoing queries to prevent race conditions
      await cancelQueries(queryClient, [
        [
          ...queryKeys.reactions.list(variables.targetId, variables.targetType),
        ] as unknown[],
      ]);
    },
    onSuccess: (_, variables) => {
      // Invalidate reactions list for this target
      invalidateQueries(queryClient, [
        [
          ...queryKeys.reactions.list(variables.targetId, variables.targetType),
        ] as unknown[],
      ]);

      // Invalidate the target itself to update reaction count
      if (variables.targetType === 'POST') {
        queryClient.invalidateQueries({
          queryKey: queryKeys.posts.detail(variables.targetId),
        });
        // Also invalidate lists containing this post
        invalidateQueries(queryClient, [
          [...queryKeys.posts.lists()] as unknown[],
          [...queryKeys.feed.all] as unknown[],
        ]);
      } else if (variables.targetType === 'COMMENT') {
        queryClient.invalidateQueries({
          queryKey: queryKeys.comments.detail(variables.targetId),
        });
        // Also invalidate comment lists
        invalidateQueries(queryClient, [
          [...queryKeys.comments.lists()] as unknown[],
        ]);
      } else if (variables.targetType === 'SHARE') {
        queryClient.invalidateQueries({
          queryKey: queryKeys.shares.detail(variables.targetId),
        });
      }
    },
  });
};

/**
 * Remove reaction from a target
 * With optimistic invalidation for fast UI updates
 */
export const useDisReact = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, RemoveReactionInput>({
    mutationFn: async (input) => {
      return reactionService.disReact(input);
    },
    onMutate: async (variables) => {
      // Cancel outgoing queries to prevent race conditions
      await cancelQueries(queryClient, [
        [
          ...queryKeys.reactions.list(variables.targetId, variables.targetType),
        ] as unknown[],
      ]);
    },
    onSuccess: (_, variables) => {
      // Invalidate reactions list for this target
      invalidateQueries(queryClient, [
        [
          ...queryKeys.reactions.list(variables.targetId, variables.targetType),
        ] as unknown[],
      ]);

      // Invalidate the target itself to update reaction count
      if (variables.targetType === 'POST') {
        queryClient.invalidateQueries({
          queryKey: queryKeys.posts.detail(variables.targetId),
        });
        // Also invalidate lists containing this post
        invalidateQueries(queryClient, [
          [...queryKeys.posts.lists()] as unknown[],
          [...queryKeys.feed.all] as unknown[],
        ]);
      } else if (variables.targetType === 'COMMENT') {
        queryClient.invalidateQueries({
          queryKey: queryKeys.comments.detail(variables.targetId),
        });
        // Also invalidate comment lists
        invalidateQueries(queryClient, [
          [...queryKeys.comments.lists()] as unknown[],
        ]);
      } else if (variables.targetType === 'SHARE') {
        queryClient.invalidateQueries({
          queryKey: queryKeys.shares.detail(variables.targetId),
        });
      }
    },
  });
};
