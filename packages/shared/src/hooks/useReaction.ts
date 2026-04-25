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

type QuerySnapshot = Array<[readonly unknown[], unknown]>;

type ReactionMutationContext = {
  previousFeedQueries: QuerySnapshot;
  previousPostListQueries: QuerySnapshot;
  previousPostDetail?: unknown;
  previousShareDetail?: unknown;
};

const REACTION_STAT_FIELDS: Record<ReactionType, string> = {
  LIKE: 'likes',
  LOVE: 'loves',
  HAHA: 'hahas',
  WOW: 'wows',
  SAD: 'sads',
  ANGRY: 'angrys',
};

const clampCount = (value: number) => Math.max(0, value);

const updateReactionStats = (
  stats: Record<string, unknown> | undefined,
  previousReaction?: ReactionType,
  nextReaction?: ReactionType,
) => {
  if (!stats) return stats;

  const nextStats = { ...stats } as Record<string, number>;

  if (previousReaction) {
    const prevField = REACTION_STAT_FIELDS[previousReaction];
    if (prevField) {
      nextStats[prevField] = clampCount((nextStats[prevField] ?? 0) - 1);
    }
    nextStats.reactions = clampCount((nextStats.reactions ?? 0) - 1);
  }

  if (nextReaction) {
    const nextField = REACTION_STAT_FIELDS[nextReaction];
    if (nextField) {
      nextStats[nextField] = (nextStats[nextField] ?? 0) + 1;
    }
    nextStats.reactions = (nextStats.reactions ?? 0) + 1;
  }

  return nextStats;
};

const patchReactionInData = (
  data: unknown,
  variables: { targetId: string; targetType: TargetType },
  previousReaction?: ReactionType,
  nextReaction?: ReactionType,
): unknown => {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map((item) =>
      patchReactionInData(item, variables, previousReaction, nextReaction),
    );
  }

  if ('pages' in data && Array.isArray((data as { pages: unknown[] }).pages)) {
    const infiniteData = data as { pages: Array<{ data: unknown[] }> };
    return {
      ...infiniteData,
      pages: infiniteData.pages.map((page) => ({
        ...page,
        data: page.data.map((item) =>
          patchReactionInData(item, variables, previousReaction, nextReaction),
        ),
      })),
    };
  }

  const entity = data as Record<string, unknown>;

  if ('item' in entity && entity.item && typeof entity.item === 'object') {
    return {
      ...entity,
      item: patchReactionInData(
        entity.item,
        variables,
        previousReaction,
        nextReaction,
      ),
    };
  }

  const isPostTarget =
    variables.targetType === 'POST' &&
    (entity.id === variables.targetId || entity.postId === variables.targetId);
  const isShareTarget =
    variables.targetType === 'SHARE' &&
    (entity.id === variables.targetId || entity.shareId === variables.targetId);

  if (!isPostTarget && !isShareTarget) {
    return data;
  }

  if (isPostTarget) {
    return {
      ...entity,
      reactedType: nextReaction,
      postStat: updateReactionStats(
        entity.postStat as Record<string, unknown> | undefined,
        previousReaction,
        nextReaction,
      ),
    };
  }

  return {
    ...entity,
    reactedType: nextReaction,
    shareStat: updateReactionStats(
      entity.shareStat as Record<string, unknown> | undefined,
      previousReaction,
      nextReaction,
    ),
  };
};

const findReactionInData = (
  data: unknown,
  variables: { targetId: string; targetType: TargetType },
): ReactionType | undefined => {
  if (!data || typeof data !== 'object') return undefined;

  if (Array.isArray(data)) {
    for (const item of data) {
      const reaction = findReactionInData(item, variables);
      if (reaction) return reaction;
    }
    return undefined;
  }

  if ('pages' in data && Array.isArray((data as { pages: unknown[] }).pages)) {
    const pages = (data as { pages: Array<{ data: unknown[] }> }).pages;
    for (const page of pages) {
      const reaction = findReactionInData(page.data, variables);
      if (reaction) return reaction;
    }
    return undefined;
  }

  const entity = data as Record<string, unknown>;

  if ('item' in entity) {
    return findReactionInData(entity.item, variables);
  }

  const matchesPost =
    variables.targetType === 'POST' &&
    (entity.id === variables.targetId || entity.postId === variables.targetId);
  const matchesShare =
    variables.targetType === 'SHARE' &&
    (entity.id === variables.targetId || entity.shareId === variables.targetId);

  if (matchesPost || matchesShare) {
    return entity.reactedType as ReactionType | undefined;
  }

  return undefined;
};

const snapshotAndPatchReactionCaches = (
  queryClient: ReturnType<typeof useQueryClient>,
  variables: { targetId: string; targetType: TargetType },
  nextReaction?: ReactionType,
): ReactionMutationContext => {
  const previousFeedQueries = queryClient.getQueriesData({
    queryKey: queryKeys.feed.all,
  }) as QuerySnapshot;

  const previousPostListQueries = queryClient.getQueriesData({
    queryKey: queryKeys.posts.lists(),
  }) as QuerySnapshot;

  const postDetailKey = queryKeys.posts.detail(variables.targetId);
  const shareDetailKey = queryKeys.shares.detail(variables.targetId);

  const previousPostDetail = queryClient.getQueryData(postDetailKey);
  const previousShareDetail = queryClient.getQueryData(shareDetailKey);

  const previousReaction =
    findReactionInData(previousPostDetail, variables) ??
    findReactionInData(previousShareDetail, variables) ??
    findReactionInData(
      previousFeedQueries.map(([, data]) => data),
      variables,
    ) ??
    findReactionInData(
      previousPostListQueries.map(([, data]) => data),
      variables,
    );

  queryClient.setQueriesData({ queryKey: queryKeys.feed.all }, (oldData) =>
    patchReactionInData(oldData, variables, previousReaction, nextReaction),
  );

  queryClient.setQueriesData({ queryKey: queryKeys.posts.lists() }, (oldData) =>
    patchReactionInData(oldData, variables, previousReaction, nextReaction),
  );

  queryClient.setQueryData(postDetailKey, (oldData: unknown) =>
    patchReactionInData(oldData, variables, previousReaction, nextReaction),
  );

  queryClient.setQueryData(shareDetailKey, (oldData: unknown) =>
    patchReactionInData(oldData, variables, previousReaction, nextReaction),
  );

  return {
    previousFeedQueries,
    previousPostListQueries,
    previousPostDetail,
    previousShareDetail,
  };
};

const restoreReactionCaches = (
  queryClient: ReturnType<typeof useQueryClient>,
  variables: { targetId: string; targetType: TargetType },
  context?: ReactionMutationContext,
) => {
  if (!context) return;

  context.previousFeedQueries.forEach(([key, data]) => {
    queryClient.setQueryData(key, data);
  });

  context.previousPostListQueries.forEach(([key, data]) => {
    queryClient.setQueryData(key, data);
  });

  queryClient.setQueryData(
    queryKeys.posts.detail(variables.targetId),
    context.previousPostDetail,
  );
  queryClient.setQueryData(
    queryKeys.shares.detail(variables.targetId),
    context.previousShareDetail,
  );
};

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
      lastPage.hasNextPage ? (lastPage.nextCursor ?? undefined) : undefined,
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

  return useMutation<void, Error, CreateReactionInput, ReactionMutationContext>(
    {
      mutationFn: async (input) => {
        return reactionService.react(input);
      },
      onMutate: async (variables) => {
        // Cancel outgoing queries to prevent race conditions
        await cancelQueries(queryClient, [
          [
            ...queryKeys.reactions.list(
              variables.targetId,
              variables.targetType,
            ),
          ] as unknown[],
          [...queryKeys.feed.all] as unknown[],
        ]);

        return snapshotAndPatchReactionCaches(
          queryClient,
          {
            targetId: variables.targetId,
            targetType: variables.targetType,
          },
          variables.reactionType,
        );
      },
      onSuccess: (_, variables) => {
        // Invalidate reactions list for this target
        invalidateQueries(queryClient, [
          [
            ...queryKeys.reactions.list(
              variables.targetId,
              variables.targetType,
            ),
          ] as unknown[],
        ]);

        if (variables.targetType === 'COMMENT') {
          queryClient.invalidateQueries({
            queryKey: queryKeys.comments.detail(variables.targetId),
          });
          invalidateQueries(queryClient, [
            [...queryKeys.comments.lists()] as unknown[],
          ]);
        }
      },
      onError: (_error, variables, context) => {
        restoreReactionCaches(
          queryClient,
          {
            targetId: variables.targetId,
            targetType: variables.targetType,
          },
          context,
        );
      },
    },
  );
};

/**
 * Remove reaction from a target
 * With optimistic invalidation for fast UI updates
 */
export const useDisReact = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, RemoveReactionInput, ReactionMutationContext>(
    {
      mutationFn: async (input) => {
        return reactionService.disReact(input);
      },
      onMutate: async (variables) => {
        // Cancel outgoing queries to prevent race conditions
        await cancelQueries(queryClient, [
          [
            ...queryKeys.reactions.list(
              variables.targetId,
              variables.targetType,
            ),
          ] as unknown[],
          [...queryKeys.feed.all] as unknown[],
        ]);

        return snapshotAndPatchReactionCaches(queryClient, {
          targetId: variables.targetId,
          targetType: variables.targetType,
        });
      },
      onSuccess: (_, variables) => {
        // Invalidate reactions list for this target
        invalidateQueries(queryClient, [
          [
            ...queryKeys.reactions.list(
              variables.targetId,
              variables.targetType,
            ),
          ] as unknown[],
        ]);

        if (variables.targetType === 'COMMENT') {
          queryClient.invalidateQueries({
            queryKey: queryKeys.comments.detail(variables.targetId),
          });
          invalidateQueries(queryClient, [
            [...queryKeys.comments.lists()] as unknown[],
          ]);
        }
      },
      onError: (_error, variables, context) => {
        restoreReactionCaches(
          queryClient,
          {
            targetId: variables.targetId,
            targetType: variables.targetType,
          },
          context,
        );
      },
    },
  );
};
