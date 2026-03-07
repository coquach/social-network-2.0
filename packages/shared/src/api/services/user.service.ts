/**
 * User Service
 * Platform-agnostic user-related API operations
 */

import { getApiClient } from '../client';
import type {
  UserDTO,
  UserProfile,
  UpdateUserInput,
  CursorPaginatedResponse,
} from '../../types';

export const userService = {
  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserDTO> {
    return getApiClient().get('/users/me');
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
    return getApiClient().patch('/users/me', data);
  },

  /**
   * Search users
   */
  async searchUsers(params: {
    query: string;
    cursor?: string;
    limit?: number;
  }): Promise<CursorPaginatedResponse<UserDTO>> {
    return getApiClient().get('/users/search', { params });
  },

  /**
   * Get user's friends
   */
  async getUserFriends(
    userId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<CursorPaginatedResponse<UserDTO>> {
    return getApiClient().get(`/users/${userId}/friends`, { params });
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
  }): Promise<CursorPaginatedResponse<any>> {
    return getApiClient().get('/friend-requests', { params });
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
