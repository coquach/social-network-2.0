/**
 * User Service
 * Platform-agnostic user-related API operations
 */

import { getApiClient } from '../client';
import type {
  UserDTO,
  UserProfile,
  UpdateUserInput,
  CursorPageResponse,
} from '../../types';

export const userService = {
  /**
   * Get current authenticated user profile
   */
  async getCurrentUser(): Promise<UserProfile> {
    return getApiClient().get('/users/current');
  },

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<UserProfile> {
    return getApiClient().get(`/users/${userId}`);
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateUserInput): Promise<UserDTO> {
    return getApiClient().patch('/users', data);
  },

  /**
   * Search users
   */
  async searchUsers(params: {
    query: string;
    cursor?: string;
    limit?: number;
  }): Promise<CursorPageResponse<UserDTO>> {
    return getApiClient().getCursorPage('/users/search', { params });
  },

  /**
   * Send friend request
   */
  async sendFriendRequest(userId: string): Promise<void> {
    return getApiClient().post(`/users/${userId}/friend-request`);
  },

  /**
   * Accept friend request
   */
  async acceptFriendRequest(requestId: string): Promise<void> {
    return getApiClient().post(`/friend-requests/${requestId}/accept`);
  },

  /**
   * Reject friend request
   */
  async rejectFriendRequest(requestId: string): Promise<void> {
    return getApiClient().post(`/friend-requests/${requestId}/reject`);
  },

  /**
   * Remove friend
   */
  async removeFriend(userId: string): Promise<void> {
    return getApiClient().delete(`/users/${userId}/friend`);
  },

  /**
   * Get pending friend requests
   */
  async getFriendRequests(params?: {
    cursor?: string;
    limit?: number;
  }): Promise<CursorPageResponse<any>> {
    return getApiClient().getCursorPage('/friend-requests', { params });
  },

  /**
   * Block user
   */
  async blockUser(userId: string): Promise<void> {
    return getApiClient().post(`/users/${userId}/block`);
  },

  /**
   * Unblock user
   */
  async unblockUser(userId: string): Promise<void> {
    return getApiClient().delete(`/users/${userId}/block`);
  },
};
