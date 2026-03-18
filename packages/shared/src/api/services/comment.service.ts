/**
 * Comment Service
 * Platform-agnostic comment-related API operations
 */

import { getApiClient } from '../client';
import type {
  CommentDTO,
  CreateCommentInput,
  UpdateCommentInput,
  CreateReactionInput,
  RemoveReactionInput,
  CursorPageResponse,
} from '../../types';

export const commentService = {
  /**
   * Get comments for a post or share (paginated)
   */
  async getComments(
    rootId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<CursorPageResponse<CommentDTO>> {
    return getApiClient().getCursorPage(`/posts/${rootId}/comments`, { params });
  },

  /**
   * Get single comment by ID
   */
  async getComment(commentId: string): Promise<CommentDTO> {
    return getApiClient().get(`/comments/${commentId}`);
  },

  /**
   * Get replies to a comment (paginated)
   */
  async getReplies(
    commentId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<CursorPageResponse<CommentDTO>> {
    return getApiClient().getCursorPage(`/comments/${commentId}/replies`, { params });
  },

  /**
   * Create new comment
   */
  async createComment(data: CreateCommentInput): Promise<CommentDTO> {
    return getApiClient().post('/comments', data);
  },

  /**
   * Update existing comment
   */
  async updateComment(
    commentId: string,
    data: UpdateCommentInput
  ): Promise<CommentDTO> {
    return getApiClient().patch(`/comments/${commentId}`, data);
  },

  /**
   * Delete comment
   */
  async deleteComment(commentId: string): Promise<void> {
    return getApiClient().delete(`/comments/${commentId}`);
  },

  /**
   * React to comment
   */
  async reactToComment(data: CreateReactionInput): Promise<void> {
    return getApiClient().post(`/comments/${data.targetId}/reactions`, {
      reactionType: data.reactionType,
    });
  },

  /**
   * Remove reaction from comment
   */
  async removeReaction(data: RemoveReactionInput): Promise<void> {
    return getApiClient().delete(`/comments/${data.targetId}/reactions`);
  },

  /**
   * Get comment reactions (paginated)
   */
  async getCommentReactions(
    commentId: string,
    params?: { reactionType?: string; cursor?: string; limit?: number }
  ): Promise<CursorPageResponse<any>> {
    return getApiClient().getCursorPage(`/comments/${commentId}/reactions`, { params });
  },
};
