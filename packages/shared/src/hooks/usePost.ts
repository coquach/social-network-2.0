/**
 * Post-related React Query hooks
 * 
 * Platform-agnostic hooks for posts, reactions, and shares.
 * These hooks use the postService and provide type-safe queries and mutations.
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { postService } from '../api/services/post.service';
import type { CreatePostInGroupResponse } from '../api/services/post.service';
import { queryKeys } from './query-keys';
import type {
  PostDTO,
  CreatePostInput,
  UpdatePostInput,
  EditHistoryDTO,
} from '../types/post.types';
import type { CursorPaginatedResponse, QueryParams } from '../types/common.types';
import { TargetType, ReactionType, PostGroupStatus, Emotion } from '../types/enums';

// ==================== Query Hooks ====================

/**
 * Get a single post by ID
 */
export const usePost = (postId: string, options?: { enabled?: boolean }) => {
  return useQuery<PostDTO>({
    queryKey: queryKeys.posts.detail(postId),
    queryFn: () => postService.getPost(postId),
    enabled: options?.enabled !== false && !!postId,
    staleTime: 10_000, // 10 seconds
    gcTime: 60_000, // 1 minute
  });
};

/**
 * Get current user's posts with infinite scroll
 */
export const useMyPosts = (params?: { feeling?: Emotion }) => {
  return useInfiniteQuery<CursorPaginatedResponse<PostDTO>>({
    queryKey: queryKeys.posts.myPosts(),
    queryFn: ({ pageParam }) =>
      postService.getMyPosts({
        ...params,
        cursor: pageParam as string | undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Get user's posts with infinite scroll
 */
export const useUserPosts = (userId: string, params?: QueryParams) => {
  return useInfiniteQuery<CursorPaginatedResponse<PostDTO>>({
    queryKey: queryKeys.posts.list(userId),
    queryFn: ({ pageParam }) =>
      postService.getUserPosts(userId, {
        ...params,
        cursor: pageParam as string | undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Get group posts with infinite scroll
 */
export const useGroupPosts = (groupId: string, params?: { mainEmotion?: Emotion; status?: PostGroupStatus }) => {
  return useInfiniteQuery<CursorPaginatedResponse<PostDTO>>({
    queryKey: queryKeys.posts.byGroup(groupId),
    queryFn: ({ pageParam }) =>
      postService.getGroupPosts(groupId, {
        ...params,
        cursor: pageParam as string | undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    enabled: !!groupId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

/**
 * Get post edit history
 */
export const usePostEditHistory = (postId: string, options?: { enabled?: boolean }) => {
  return useQuery<EditHistoryDTO[]>({
    queryKey: queryKeys.posts.editHistories(postId),
    queryFn: () => postService.getPostEditHistory(postId),
    enabled: options?.enabled !== false && !!postId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// ==================== Mutation Hooks ====================

/**
 * Create a new post
 */
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation<PostDTO, Error, CreatePostInput>({
    mutationFn: (input) => postService.createPost(input),
    onSuccess: (newPost) => {
      // Invalidate feed queries to show new post
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.myPosts() });
      
      // Optionally add to cache
      queryClient.setQueryData<PostDTO>(
        queryKeys.posts.detail(newPost.id),
        newPost
      );
    },
  });
};

/**
 * Create post in group (may require approval)
 */
export const useCreatePostInGroup = () => {
  const queryClient = useQueryClient();

  return useMutation<CreatePostInGroupResponse, Error, CreatePostInput>({
    mutationFn: (input) => postService.createPostInGroup(input),
    onSuccess: (response) => {
      // Invalidate group posts
      if (response.post.group?.id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.posts.byGroup(response.post.group.id) 
        });
      }
      
      // If approved immediately, also invalidate feed
      if (response.status === PostGroupStatus.PUBLISHED) {
        queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
        queryClient.setQueryData<PostDTO>(
          queryKeys.posts.detail(response.post.id),
          response.post
        );
      }
    },
  });
};

/**
 * Update an existing post
 */
export const useUpdatePost = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation<PostDTO, Error, UpdatePostInput>({
    mutationFn: (input) => postService.updatePost(postId, input),
    onSuccess: (updatedPost) => {
      // Update the post in cache
      queryClient.setQueryData<PostDTO>(
        queryKeys.posts.detail(postId),
        updatedPost
      );
      
      // Invalidate lists that might contain this post
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
    },
  });
};

/**
 * Delete a post
 */
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (postId) => postService.deletePost(postId),
    onSuccess: (_, postId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.posts.detail(postId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
    },
  });
};

/**
 * Approve post in group (moderator action)
 */
export const useApproveGroupPost = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationFn: (postId) => postService.approvePostInGroup(postId),
    onSuccess: (_, postId) => {
      // Invalidate post and group posts
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
    },
  });
};

/**
 * Reject post in group (moderator action)
 */
export const useRejectGroupPost = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationFn: (postId) => postService.rejectPostInGroup(postId),
    onSuccess: (_, postId) => {
      // Invalidate post and group posts
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.reactions.list(postId, TargetType.POST) 
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
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.reactions.list(postId, TargetType.POST) 
      });
    },
  });
};

/**
 * Share a post
 */
export const useSharePost = () => {
  const queryClient = useQueryClient();

  return useMutation<
    PostDTO,
    Error,
    { postId: string; content?: string }
  >({
    mutationFn: ({ postId, content }) =>
      postService.sharePost({
        postId,
        content,
      }),
    onSuccess: (sharedPost) => {
      // Invalidate feed to show shared post
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
      
      // Add shared post to cache
      queryClient.setQueryData<PostDTO>(
        queryKeys.posts.detail(sharedPost.id),
        sharedPost
      );
    },
  });
};
