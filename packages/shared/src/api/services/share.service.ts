/**
 * Share Service
 * Platform-agnostic share-related API operations
 */

import { getApiClient } from '../client';
import type {
  CursorPaginatedResponse,
  SharePostDTO,
  SharePostSnapshotDTO,
  CreateShareInput,
  UpdateShareInput,
  GetShareQueryParams,
} from '../../types';

export const shareService = {
  /**
   * Share a post
   */
  async sharePost(input: CreateShareInput): Promise<SharePostDTO> {
    return getApiClient().post('/shares', input);
  },

  /**
   * Update a share post
   */
  async updateShare(shareId: string, input: UpdateShareInput): Promise<SharePostDTO> {
    return getApiClient().patch(`/shares/share/${shareId}`, input);
  },

  /**
   * Delete a share post
   */
  async deleteShare(shareId: string): Promise<void> {
    return getApiClient().delete(`/shares/${shareId}`);
  },

  /**
   * Get a single share by ID
   */
  async getShareById(shareId: string): Promise<SharePostDTO> {
    return getApiClient().get(`/shares/share/${shareId}`);
  },

  /**
   * Get shares for a specific post
   */
  async getPostShares(
    postId: string,
    params?: GetShareQueryParams
  ): Promise<CursorPaginatedResponse<SharePostSnapshotDTO>> {
    return getApiClient().get(`/shares/post/${postId}`, { params });
  },

  /**
   * Get current user's shares
   */
  async getMyShares(
    params?: GetShareQueryParams
  ): Promise<CursorPaginatedResponse<SharePostSnapshotDTO>> {
    return getApiClient().get('/shares/me', { params });
  },

  /**
   * Get a user's shares
   */
  async getUserShares(
    userId: string,
    params?: GetShareQueryParams
  ): Promise<CursorPaginatedResponse<SharePostSnapshotDTO>> {
    return getApiClient().get(`/shares/user/${userId}`, { params });
  },
};
