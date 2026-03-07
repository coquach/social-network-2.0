/**
 * Comment-related React Query hooks
 * 
 * Platform-agnostic hooks for comments and replies.
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { commentService } from '../api/services/comment.service';
import { queryKeys } from './query-keys';
import type {
  CommentDTO,
  CreateCommentInput,
  UpdateCommentInput,
} from '../types/comment.types';
import type { CursorPaginatedResponse, QueryParams } from '../types/common.types';
import { TargetType, ReactionType } from '../types/enums';

// ==================== Query Hooks ====================

/**
 * Get comments for a post with infinite scroll
 */
export const useComments = (postId: string, params?: QueryParams) => {
  return useInfiniteQuery<CursorPaginatedResponse<CommentDTO>>({
    queryKey: queryKeys.comments.list(postId, 'POST'),
    queryFn: ({ pageParam }) =>
      commentService.getComments(postId, {
        ...params,
        cursor: pageParam as string | undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    enabled: !!postId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Get a single comment by ID
 */
export const useComment = (commentId: string, options?: { enabled?: boolean }) => {
  return useQuery<CommentDTO>({
    queryKey: [...queryKeys.comments.all, commentId],
    queryFn: () => commentService.getComment(commentId),
    enabled: options?.enabled !== false && !!commentId,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Get replies for a comment with infinite scroll
 */
export const useReplies = (commentId: string, params?: QueryParams) => {
  return useInfiniteQuery<CursorPaginatedResponse<CommentDTO>>({
    queryKey: queryKeys.comments.list(commentId, 'COMMENT'),
    queryFn: ({ pageParam }) =>
      commentService.getReplies(commentId, {
        ...params,
        cursor: pageParam as string | undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    enabled: !!commentId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// ==================== Mutation Hooks ====================

/**
 * Create a new comment
 */
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation<CommentDTO, Error, CreateCommentInput>({
    mutationFn: (input) => commentService.createComment(input),
    onSuccess: (newComment) => {
      // Invalidate comments list for the post
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.comments.list(newComment.rootId, 'POST') 
      });
      
      // If it's a reply, invalidate replies list
      if (newComment.parentId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.comments.list(newComment.parentId, 'COMMENT') 
        });
      }
      
      // Invalidate post to update comment count
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.posts.detail(newComment.rootId) 
      });
    },
  });
};

/**
 * Update a comment
 */
export const useUpdateComment = (commentId: string) => {
  const queryClient = useQueryClient();

  return useMutation<CommentDTO, Error, UpdateCommentInput>({
    mutationFn: (input) => commentService.updateComment(commentId, input),
    onSuccess: (updatedComment) => {
      // Update comment in cache
      queryClient.setQueryData<CommentDTO>(
        [...queryKeys.comments.all, commentId],
        updatedComment
      );
      
      // Invalidate comments list to refresh
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.comments.list(updatedComment.rootId, 'POST') 
      });
      
      // If it's a reply, invalidate parent replies
      if (updatedComment.parentId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.comments.list(updatedComment.parentId, 'COMMENT') 
        });
      }
    },
  });
};

/**
 * Delete a comment
 */
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { commentId: string; postId: string }>({
    mutationFn: ({ commentId }) => commentService.deleteComment(commentId),
    onSuccess: (_, { commentId, postId }) => {
      // Remove comment from cache
      queryClient.removeQueries({ 
        queryKey: [...queryKeys.comments.all, commentId] 
      });
      
      // Invalidate comments list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.comments.list(postId, 'POST') 
      });
      
      // Invalidate post to update comment count
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.posts.detail(postId) 
      });
    },
  });
};

/**
 * React to a comment (like, love, etc.)
 */
export const useReactToComment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { commentId: string; reactionType: ReactionType }
  >({
    mutationFn: ({ commentId, reactionType }) =>
      commentService.reactToComment({
        targetId: commentId,
        targetType: TargetType.COMMENT,
        reactionType,
      }),
    onSuccess: (_, { commentId }) => {
      // Invalidate comment to refresh reaction counts
      queryClient.invalidateQueries({ 
        queryKey: [...queryKeys.comments.all, commentId] 
      });
      
      // Invalidate reactions list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.reactions.list(commentId, TargetType.COMMENT) 
      });
    },
  });
};

/**
 * Remove reaction from a comment
 */
export const useRemoveCommentReaction = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (commentId) => 
      commentService.removeReaction({
        targetId: commentId,
        targetType: TargetType.COMMENT,
      }),
    onSuccess: (_, commentId) => {
      // Invalidate comment to refresh reaction counts
      queryClient.invalidateQueries({ 
        queryKey: [...queryKeys.comments.all, commentId] 
      });
      
      // Invalidate reactions list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.reactions.list(commentId, TargetType.COMMENT) 
      });
    },
  });
};
