/**
 * Comment-related React Query hooks
 * 
 * Platform-agnostic hooks for comments with optimistic updates.
 * These hooks use the commentService and provide type-safe queries and mutations.
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { commentService } from '../api/services/comment.service';
import { queryKeys } from './query-keys';
import { useUploadOptional } from '../contexts/upload-context';
import type { UploadableFile } from '../types/upload.types';
import {
  addItemToInfiniteCache,
  updateItemInInfiniteCache,
  removeItemFromInfiniteCache,
  snapshotQueryData,
  restoreQueryData,
  invalidateQueries,
  cancelQueries,
} from '../utils/cache-utils';
import { queryConfigs } from '../utils/query-configs';
import type {
  CommentDTO,
  CreateCommentInput,
  UpdateCommentInput,
  CursorPaginatedResponse,
  MediaDTO,
} from '../types';

// ==================== Query Hooks ====================

/**
 * Get single comment by ID
 */
export const useComment = (commentId: string, options?: { enabled?: boolean }) => {
  
  return useQuery<CommentDTO>({
    queryKey: queryKeys.comments.detail(commentId),
    queryFn: async () => {
      return commentService.getComment(commentId);
    },
    enabled: options?.enabled !== false && !!commentId,
    ...queryConfigs.standard,
  });
};

/**
 * Get comments for a post or share (infinite scroll)
 */
export const useComments = (rootId: string, params?: { limit?: number }) => {

  
  return useInfiniteQuery<CursorPaginatedResponse<CommentDTO>>({
    queryKey: queryKeys.comments.byPost(rootId),
    queryFn: async ({ pageParam }) => {
      return commentService.getComments(rootId, {
        ...params,
        cursor: pageParam as string | undefined,
      });
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: undefined,
    enabled: !!rootId,
    ...queryConfigs.realtime, // Comments need to be fresh
  });
};

/**
 * Get replies to a comment (infinite scroll)
 */
export const useReplies = (commentId: string, params?: { limit?: number }) => {

  
  return useInfiniteQuery<CursorPaginatedResponse<CommentDTO>>({
    queryKey: queryKeys.comments.replies(commentId),
    queryFn: async ({ pageParam }) => {
    
      return commentService.getReplies(commentId, {
        ...params,
        cursor: pageParam as string | undefined,
      });
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: undefined,
    enabled: !!commentId,
    ...queryConfigs.realtime,
  });
};

// ==================== Mutation Hooks ====================

/**
 * Create a new comment
 * With optimistic updates
 * 
 * @example
 * const createComment = useCreateComment();
 * // With media
 * createComment.mutate({
 *   rootId: 'post-123',
 *   rootType: RootType.POST,
 *   content: 'Great!',
 *   uploadFile: { file: fileObject, type: MediaType.IMAGE }
 * });
 */
export const useCreateComment = () => {
  const queryClient = useQueryClient();
  const uploadService = useUploadOptional();

  return useMutation<
    CommentDTO,
    Error,
    CreateCommentInput & { uploadFile?: UploadableFile }
  >({
    mutationFn: async ({ uploadFile, ...input }) => {
      // Upload file if provided and upload service available
      if (uploadFile && uploadService) {
        try {
          const uploadResult = await uploadService.uploadFile(uploadFile, {
            folder: `${input.rootType.toLowerCase()}/${input.rootId}/comments`,
          });

          const media: MediaDTO = {
            type: uploadResult.type,
            url: uploadResult.url,
            publicId: uploadResult.publicId,
          };

          return commentService.createComment({ ...input, media });
        } catch (uploadError) {
          console.error('File upload failed:', uploadError);
          throw new Error('Failed to upload file. Please try again.');
        }
      }

      return commentService.createComment(input);
    },
    onSuccess: (newComment) => {
      // Add to detail cache
      queryClient.setQueryData<CommentDTO>(
        queryKeys.comments.detail(newComment.id),
        newComment
      );
      
      // Determine target query key (post comments or comment replies)
      const targetKey = newComment.parentId
        ? [...queryKeys.comments.replies(newComment.parentId)] as unknown[]
        : [...queryKeys.comments.byPost(newComment.rootId)] as unknown[];
      
      // Add to list cache
      addItemToInfiniteCache(
        queryClient,
        targetKey,
        newComment
      );
      
      // Invalidate related queries
      invalidateQueries(queryClient, [
        [...queryKeys.comments.all] as unknown[],
        [...queryKeys.posts.detail(newComment.rootId)] as unknown[], // Update post comment count
      ]);
    },
  });
};

/**
 * Update an existing comment
 * With optimistic updates
 */
export const useUpdateComment = (commentId: string) => {

  const queryClient = useQueryClient();

  return useMutation<CommentDTO, Error, UpdateCommentInput>({
    mutationFn: async (input) => {
  
      return commentService.updateComment(commentId, input);
    },
    onMutate: async (updatedComment) => {
      // Cancel outgoing queries
      await cancelQueries(queryClient, [
        [...queryKeys.comments.detail(commentId)] as unknown[],
        [...queryKeys.comments.all] as unknown[],
      ]);
      
      // Snapshot for rollback
      const context = snapshotQueryData<CommentDTO>(
        queryClient,
        [...queryKeys.comments.detail(commentId)] as unknown[]
      );
      
      // Optimistically update detail cache
      queryClient.setQueryData<CommentDTO>(
        queryKeys.comments.detail(commentId),
        (old) => old ? { ...old, ...updatedComment } : old
      );
      
      return context;
    },
    onSuccess: (updatedComment) => {
      // Update detail cache
      queryClient.setQueryData<CommentDTO>(
        queryKeys.comments.detail(commentId),
        updatedComment
      );
      
      // Update in all list caches
      updateItemInInfiniteCache(
        queryClient,
        [...queryKeys.comments.all] as unknown[],
        updatedComment,
        (item, updated) => item.id === updated.id
      );
      
      // Invalidate related queries
      invalidateQueries(queryClient, [
        [...queryKeys.comments.lists()] as unknown[],
      ]);
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context) {
        restoreQueryData(
          queryClient,
          [...queryKeys.comments.detail(commentId)] as unknown[],
          context
        );
      }
    },
  });
};

/**
 * Delete a comment
 * With optimistic removal
 */
export const useDeleteComment = () => {
 
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (commentId) => {
     
      return commentService.deleteComment(commentId);
    },
    onMutate: async (commentId) => {
      // Cancel outgoing queries
      await cancelQueries(queryClient, [
        [...queryKeys.comments.detail(commentId)] as unknown[],
        [...queryKeys.comments.all] as unknown[],
      ]);
      
      // Snapshot for rollback
      const context = snapshotQueryData<CommentDTO>(
        queryClient,
        [...queryKeys.comments.detail(commentId)] as unknown[]
      );
      
      // Optimistically remove from cache
      removeItemFromInfiniteCache(
        queryClient,
        [...queryKeys.comments.all] as unknown[],
        (item: CommentDTO) => item.id === commentId
      );
      
      return context;
    },
    onSuccess: (_, commentId) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: queryKeys.comments.detail(commentId) });
      
      // Invalidate lists to update counts
      invalidateQueries(queryClient, [
        [...queryKeys.comments.lists()] as unknown[],
        [...queryKeys.posts.all] as unknown[], // Update post comment counts
      ]);
    },
    onError: (_error, commentId, context) => {
      // Rollback on error
      if (context) {
        restoreQueryData(
          queryClient,
          [...queryKeys.comments.detail(commentId)] as unknown[],
          context
        );
      }
      
      // Re-fetch to restore accurate state
      invalidateQueries(queryClient, [
        [...queryKeys.comments.lists()] as unknown[],
      ]);
    },
  });
};
