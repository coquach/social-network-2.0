/**
 * Share Service
 * Platform-agnostic share-related API operations
 */

import { getApiClient } from '../client';
import type {
  CursorPageResponse,
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
  async updateShare(
    shareId: string,
    input: UpdateShareInput,
  ): Promise<SharePostDTO> {
    return getApiClient().patch(`/shares/${shareId}`, input);
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
    return getApiClient().get(`/shares/${shareId}`);
  },

  /**
   * Get shares for a specific post
   */
  async getPostShares(
    postId: string,
    params?: GetShareQueryParams,
  ): Promise<CursorPageResponse<SharePostSnapshotDTO>> {
    return getApiClient().getCursorPage(`/shares/post/${postId}`, { params });
  },

  /**
   * Get current user's shares
   */
  async getMyShares(
    params?: GetShareQueryParams,
  ): Promise<CursorPageResponse<SharePostSnapshotDTO>> {
    return getApiClient().getCursorPage('/shares/me', { params });
  },

  /**
   * Get a user's shares
   */
  async getUserShares(
    userId: string,
    params?: GetShareQueryParams,
  ): Promise<CursorPageResponse<SharePostSnapshotDTO>> {
    return getApiClient().getCursorPage(`/shares/user/${userId}`, { params });
  },
};
