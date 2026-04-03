/**
 * Post Service
 * Platform-agnostic post-related API operations
 */

import { getApiClient } from '../client';
import type {
  PostDTO,
  CreatePostInput,
  UpdatePostInput,
  SharePostInput,
  CursorPageResponse,
  CreateReactionInput,
  RemoveReactionInput,
  Emotion,
  PostGroupStatus,
  EditHistoryDTO,
} from '../../types';

/**
 * Query params for getting posts with emotion filter
 */
export interface GetPostQueryParams {
  cursor?: string;
  limit?: number;
  feeling?: Emotion;
}

/**
 * Query params for getting group posts
 */
export interface GetGroupPostQueryParams {
  cursor?: string;
  limit?: number;
  mainEmotion?: Emotion;
  status?: PostGroupStatus;
}

/**
 * Response for creating post in group (with approval status)
 */
export interface CreatePostInGroupResponse {
  post: PostDTO;
  status: PostGroupStatus;
  message: string;
}

export const postService = {
  /**
   * Get single post by ID
   */
  async getPost(postId: string): Promise<PostDTO> {
    return getApiClient().get(`/posts/post/${postId}`);
  },

  /**
   * Get current user's posts (paginated)
   */
  async getMyPosts(
    params?: GetPostQueryParams,
  ): Promise<CursorPageResponse<PostDTO>> {
    return getApiClient().getCursorPage('/posts/me', { params });
  },

  /**
   * Get user's posts by userId (paginated)
   */
  async getUserPosts(
    userId: string,
    params?: GetPostQueryParams,
  ): Promise<CursorPageResponse<PostDTO>> {
    return getApiClient().getCursorPage(`/posts/user/${userId}`, { params });
  },

  /**
   * Get group posts (paginated)
   */
  async getGroupPosts(
    groupId: string,
    params?: GetGroupPostQueryParams,
  ): Promise<CursorPageResponse<PostDTO>> {
    return getApiClient().getCursorPage(`/posts/group/${groupId}`, { params });
  },

  /**
   * Create new post
   */
  async createPost(data: CreatePostInput): Promise<PostDTO> {
    return getApiClient().post('/posts', data);
  },

  /**
   * Create post in group (may require approval)
   */
  async createPostInGroup(
    data: CreatePostInput,
  ): Promise<CreatePostInGroupResponse> {
    return getApiClient().post('/posts/group', data);
  },

  /**
   * Update existing post
   */
  async updatePost(postId: string, data: UpdatePostInput): Promise<PostDTO> {
    return getApiClient().patch(`/posts/update/${postId}`, data);
  },

  /**
   * Delete post
   */
  async deletePost(postId: string): Promise<void> {
    return getApiClient().delete(`/posts/delete/${postId}`);
  },

  /**
   * Approve post in group (moderator action)
   */
  async approvePostInGroup(postId: string): Promise<boolean> {
    return getApiClient().post(`/posts/group/approve/${postId}`, {});
  },

  /**
   * Reject post in group (moderator action)
   */
  async rejectPostInGroup(postId: string): Promise<boolean> {
    return getApiClient().post(`/posts/group/reject/${postId}`, {});
  },

  /**
   * Get post edit history
   */
  async getPostEditHistory(postId: string): Promise<EditHistoryDTO[]> {
    return getApiClient().get(`/posts/${postId}/edit-histories`);
  },

  /**
   * React to post
   */
  async reactToPost(data: CreateReactionInput): Promise<void> {
    return getApiClient().post(`/posts/${data.targetId}/reactions`, {
      reactionType: data.reactionType,
    });
  },

  /**
   * Remove reaction from post
   */
  async removeReaction(data: RemoveReactionInput): Promise<void> {
    return getApiClient().delete(`/posts/${data.targetId}/reactions`);
  },

  /**
   * Share post
   */
  async sharePost(data: SharePostInput): Promise<PostDTO> {
    return getApiClient().post(`/posts/${data.postId}/share`, {
      content: data.content,
      audience: data.audience,
    });
  },

  /**
   * Get post reactions (paginated)
   */
  async getPostReactions(
    postId: string,
    params?: { reactionType?: string; cursor?: string; limit?: number },
  ): Promise<CursorPageResponse<any>> {
    return getApiClient().getCursorPage(`/posts/${postId}/reactions`, {
      params,
    });
  },
};
