/**
 * Post-related React Query hooks
 *
 * Platform-agnostic hooks for posts, reactions, and shares.
 * These hooks use the postService and provide type-safe queries and mutations
 * with optimistic updates.
 */

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { CreatePostInGroupResponse } from '../api/services/post.service';
import { postService } from '../api/services/post.service';
import type { CursorPageResponse } from '../types/common.types';
import {
  Emotion,
  PostGroupStatus,
  ReactionType,
  TargetType,
} from '../types/enums';
import type {
  CreatePostInput,
  EditHistoryDTO,
  MediaDTO,
  PostDTO,
  UpdatePostInput,
} from '../types/post.types';
import { useUploadOptional } from '../contexts/upload-context';
import type { UploadableFile } from '../types/upload.types';
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
import { getRecommendedUploadBatchOptions } from '../utils/upload.utils';

// ==================== Query Hooks ====================

/**
 * Get a single post by ID
 */
export const usePost = (postId: string, options?: { enabled?: boolean }) => {
  return useQuery<PostDTO>({
    queryKey: queryKeys.posts.detail(postId),
    queryFn: async () => {
      return postService.getPost(postId);
    },
    enabled: options?.enabled !== false && !!postId,
    ...queryConfigs.standard,
  });
};

/**
 * Get current user's posts with infinite scroll
 */
export const useMyPosts = (params?: { feeling?: Emotion }) => {
  return useInfiniteQuery<CursorPageResponse<PostDTO>>({
    queryKey: queryKeys.posts.myPosts(),
    queryFn: async ({ pageParam }) => {
      return postService.getMyPosts({
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
 * Get user's posts with infinite scroll
 */
export const useUserPosts = (
  userId: string,
  params?: { feeling?: Emotion },
) => {
  return useInfiniteQuery<CursorPageResponse<PostDTO>>({
    queryKey: queryKeys.posts.list(userId),
    queryFn: async ({ pageParam }) => {
      return postService.getUserPosts(userId, {
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

/**
 * Get group posts with infinite scroll
 */
export const useGroupPosts = (
  groupId: string,
  params?: { mainEmotion?: Emotion; status?: PostGroupStatus },
) => {
  return useInfiniteQuery<CursorPageResponse<PostDTO>>({
    queryKey: params?.status
      ? [...queryKeys.posts.byGroup(groupId), params.status]
      : queryKeys.posts.byGroup(groupId),
    queryFn: async ({ pageParam }) => {
      return postService.getGroupPosts(groupId, {
        ...params,
        cursor: pageParam as string | undefined,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor ?? undefined : undefined,
    initialPageParam: undefined,
    enabled: !!groupId,
    ...queryConfigs.standard,
  });
};

/**
 * Get post edit history
 */
export const usePostEditHistory = (
  postId: string,
  options?: { enabled?: boolean },
) => {
  return useQuery<EditHistoryDTO[]>({
    queryKey: queryKeys.posts.editHistories(postId),
    queryFn: async () => {
      return postService.getPostEditHistory(postId);
    },
    enabled: options?.enabled !== false && !!postId,
    ...queryConfigs.semiStatic,
  });
};

// ==================== Mutation Hooks ====================

/**
 * Create a new post
 * With optimistic updates for immediate feedback
 * 
 * @example
 * const createPost = useCreatePost();
 * // With media files
 * createPost.mutate({
 *   content: 'Check this out!',
 *   uploadFiles: [{ file: fileObject, type: MediaType.IMAGE }]
 * });
 */
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const uploadService = useUploadOptional();

  return useMutation<
    PostDTO,
    Error,
    CreatePostInput & { uploadFiles?: UploadableFile[] }
  >({
    mutationFn: async ({ uploadFiles, ...input }) => {
      // Upload files if provided and upload service available
      if (uploadFiles && uploadFiles.length > 0 && uploadService) {
        try {
          const uploadResults = await uploadService.uploadMultiple(
            uploadFiles,
            getRecommendedUploadBatchOptions(uploadFiles, {
              folder: 'posts',
            }),
          );

          const media: MediaDTO[] = uploadResults.map((result) => ({
            type: result.type,
            url: result.url,
            publicId: result.publicId,
          }));

          return postService.createPost({ ...input, media });
        } catch (uploadError) {
          console.error('File upload failed:', uploadError);
          throw new Error('Failed to upload files. Please try again.');
        }
      }

      return postService.createPost(input);
    },
    onSuccess: (newPost) => {
      // Add to detail cache
      queryClient.setQueryData<PostDTO>(
        queryKeys.posts.detail(newPost.id),
        newPost,
      );

      // Add to my posts list (optimistic)
      addItemToInfiniteCache(
        queryClient,
        [...queryKeys.posts.myPosts()] as unknown[],
        newPost,
      );

      // Invalidate feed queries to show new post
      invalidateQueries(queryClient, [
        [...queryKeys.feed.all] as unknown[],
        [...queryKeys.posts.lists()] as unknown[],
      ]);
    },
  });
};

/**
 * Create post in group (may require approval)
 * 
 * @example
 * const createPostInGroup = useCreatePostInGroup();
 * createPostInGroup.mutate({
 *   content: 'Group post',
 *   groupId: 'group-123',
 *   uploadFiles: [{ file, type: MediaType.IMAGE }]
 * });
 */
export const useCreatePostInGroup = () => {
  const queryClient = useQueryClient();
  const uploadService = useUploadOptional();

  return useMutation<
    CreatePostInGroupResponse,
    Error,
    CreatePostInput & { uploadFiles?: UploadableFile[] }
  >({
    mutationFn: async ({ uploadFiles, ...input }) => {
      // Upload files if provided and upload service available
      if (uploadFiles && uploadFiles.length > 0 && uploadService) {
        try {
          const uploadResults = await uploadService.uploadMultiple(
            uploadFiles,
            getRecommendedUploadBatchOptions(uploadFiles, {
              folder: input.groupId ? `groups/${input.groupId}/posts` : 'posts',
            }),
          );

          const media: MediaDTO[] = uploadResults.map((result) => ({
            type: result.type,
            url: result.url,
            publicId: result.publicId,
          }));

          return postService.createPostInGroup({ ...input, media });
        } catch (uploadError) {
          console.error('File upload failed:', uploadError);
          throw new Error('Failed to upload files. Please try again.');
        }
      }

      return postService.createPostInGroup(input);
    },
    onSuccess: (response) => {
      const { post, status } = response;

      // If published immediately, add to caches
      if (status === PostGroupStatus.PUBLISHED && post.group?.id) {
        // Add to detail cache
        queryClient.setQueryData<PostDTO>(
          queryKeys.posts.detail(post.id),
          post,
        );

        // Add to group posts list
        addItemToInfiniteCache(
          queryClient,
          [...queryKeys.posts.byGroup(post.group.id)] as unknown[],
          post,
        );

        // Invalidate feed
        queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
      }

      // Always invalidate group posts to refresh pending status
      if (post.group?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.posts.byGroup(post.group.id),
        });
      }
    },
  });
};

/**
 * Update an existing post
 * With optimistic updates
 */
export const useUpdatePost = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation<PostDTO, Error, UpdatePostInput>({
    mutationFn: async (input) => {
      return postService.updatePost(postId, input);
    },
    onMutate: async (updatedPost) => {
      // Cancel outgoing queries
      await cancelQueries(queryClient, [
        [...queryKeys.posts.detail(postId)] as unknown[],
        [...queryKeys.posts.lists()] as unknown[],
      ]);

      // Snapshot for rollback
      const context = snapshotQueryData<PostDTO>(queryClient, [
        ...queryKeys.posts.detail(postId),
      ] as unknown[]);

      // Optimistically update
      queryClient.setQueryData<PostDTO>(
        queryKeys.posts.detail(postId),
        (old) => (old ? { ...old, ...updatedPost } : old),
      );

      return context;
    },
    onSuccess: (updatedPost) => {
      // Update the post in detail cache
      queryClient.setQueryData<PostDTO>(
        queryKeys.posts.detail(postId),
        updatedPost,
      );

      // Update in all list caches
      updateItemInInfiniteCache(
        queryClient,
        [...queryKeys.posts.all] as unknown[],
        updatedPost,
        (item, updated) => item.id === updated.id,
      );

      // Invalidate related queries
      invalidateQueries(queryClient, [
        [...queryKeys.feed.all] as unknown[],
        [...queryKeys.posts.lists()] as unknown[],
      ]);
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context) {
        restoreQueryData(
          queryClient,
          [...queryKeys.posts.detail(postId)] as unknown[],
          context,
        );
      }
    },
  });
};

/**
 * Delete a post
 * With optimistic removal from cache
 */
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (postId) => {
      return postService.deletePost(postId);
    },
    onMutate: async (postId) => {
      // Cancel outgoing queries
      await cancelQueries(queryClient, [
        [...queryKeys.posts.detail(postId)] as unknown[],
        [...queryKeys.posts.lists()] as unknown[],
      ]);

      // Snapshot for rollback
      const context = snapshotQueryData<PostDTO>(queryClient, [
        ...queryKeys.posts.detail(postId),
      ] as unknown[]);

      // Optimistically remove from cache
      removeItemFromInfiniteCache(
        queryClient,
        [...queryKeys.posts.all] as unknown[],
        (item: PostDTO) => item.id === postId,
      );

      return context;
    },
    onSuccess: (_, postId) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: queryKeys.posts.detail(postId) });

      // Invalidate lists
      invalidateQueries(queryClient, [
        [...queryKeys.feed.all] as unknown[],
        [...queryKeys.posts.lists()] as unknown[],
      ]);
    },
    onError: (_error, postId, context) => {
      // Rollback on error
      if (context) {
        restoreQueryData(
          queryClient,
          [...queryKeys.posts.detail(postId)] as unknown[],
          context,
        );
      }

      // Re-fetch to restore accurate state
      invalidateQueries(queryClient, [
        [...queryKeys.posts.lists()] as unknown[],
      ]);
    },
  });
};

/**
 * Approve post in group (moderator action)
 */
export const useApproveGroupPost = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, { postId: string; groupId: string }>({
    mutationFn: async ({ postId }) => {
      return postService.approvePostInGroup(postId);
    },
    onSuccess: (_, { postId, groupId }) => {
      // Remove from pending list
      removeItemFromInfiniteCache(
        queryClient,
        [...queryKeys.posts.byGroup(groupId), PostGroupStatus.PENDING],
        (item: PostDTO) => item.id === postId,
      );

      // Invalidate to refresh
      invalidateQueries(queryClient, [
        [...queryKeys.posts.detail(postId)] as unknown[],
        [...queryKeys.posts.byGroup(groupId)] as unknown[],
        [...queryKeys.feed.all] as unknown[],
      ]);
    },
  });
};

/**
 * Reject post in group (moderator action)
 */
export const useRejectGroupPost = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, { postId: string; groupId: string }>({
    mutationFn: async ({ postId }) => {
      return postService.rejectPostInGroup(postId);
    },
    onSuccess: (_, { postId, groupId }) => {
      // Remove from pending list
      removeItemFromInfiniteCache(
        queryClient,
        [...queryKeys.posts.byGroup(groupId), PostGroupStatus.PENDING],
        (item: PostDTO) => item.id === postId,
      );

      // Invalidate post details
      invalidateQueries(queryClient, [
        [...queryKeys.posts.detail(postId)] as unknown[],
        [...queryKeys.posts.byGroup(groupId)] as unknown[],
      ]);
    },
  });
};

// ==================== Reaction Hooks ====================

/**
 * React to a post (like, love, etc.)
 */
export const useReactToPost = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { postId: string; reactionType: ReactionType }
  >({
    mutationFn: ({ postId, reactionType }) =>
      postService.reactToPost({
        targetId: postId,
        targetType: TargetType.POST,
        reactionType,
      }),
    onSuccess: (_, { postId }) => {
      // Invalidate post to refresh reaction counts
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(postId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.reactions.list(postId, TargetType.POST),
      });
    },
  });
};

/**
 * Remove reaction from a post
 */
export const useRemoveReaction = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (postId) =>
      postService.removeReaction({
        targetId: postId,
        targetType: TargetType.POST,
      }),
    onSuccess: (_, postId) => {
      // Invalidate post to refresh reaction counts
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(postId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.reactions.list(postId, TargetType.POST),
      });
    },
  });
};
