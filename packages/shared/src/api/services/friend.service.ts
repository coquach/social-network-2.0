/**
 * Friend Service
 * Platform-agnostic friend/social relationship API operations
 */

import { getApiClient } from '../client';
import type { CursorPaginatedResponse } from '../../types';

/**
 * Relationship status response
 */
export interface RelationshipStatusResponse {
  status: 'FRIEND' | 'BLOCKED' | 'REQUESTED_OUT' | 'REQUESTED_IN' | 'NONE';
}

/**
 * Friend suggestion with mutual friends
 */
export interface FriendSuggestionDTO {
  id: string;
  mutualFriends: number;
  mutualFriendIds: string[];
}

export const friendService = {
  /**
   * Get relationship status with a user
   */
  async getRelationshipStatus(targetId: string): Promise<RelationshipStatusResponse> {
    return getApiClient().get(`/social/relationship/${targetId}`);
  },

  /**
   * Send friend request
   */
  async sendFriendRequest(targetId: string): Promise<void> {
    return getApiClient().post(`/social/request/${targetId}`, {});
  },

  /**
   * Cancel friend request
   */
  async cancelFriendRequest(targetId: string): Promise<void> {
    return getApiClient().post(`/social/cancel/${targetId}`, {});
  },

  /**
   * Accept friend request
   */
  async acceptFriendRequest(requesterId: string): Promise<void> {
    return getApiClient().post(`/social/accept/${requesterId}`, {});
  },

  /**
   * Decline friend request
   */
  async declineFriendRequest(requesterId: string): Promise<void> {
    return getApiClient().post(`/social/decline/${requesterId}`, {});
  },

  /**
   * Remove friend
   */
  async removeFriend(friendId: string): Promise<void> {
    return getApiClient().post(`/social/remove/${friendId}`, {});
  },

  /**
   * Block user
   */
  async blockUser(targetId: string): Promise<void> {
    return getApiClient().post(`/social/block/${targetId}`, {});
  },

  /**
   * Unblock user
   */
  async unblockUser(targetId: string): Promise<void> {
    return getApiClient().post(`/social/unblock/${targetId}`, {});
  },

  /**
   * Get friend requests (paginated)
   */
  async getFriendRequests(params?: {
    cursor?: string;
    limit?: number;
  }): Promise<CursorPaginatedResponse<string>> {
    return getApiClient().get('/social/requests', { params });
  },

  /**
   * Get friends list (paginated)
   * @param userId - If provided, get that user's friends; otherwise get current user's friends
   */
  async getFriends(
    userId?: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<CursorPaginatedResponse<string>> {
    const url = userId ? `/social/friends/${userId}` : '/social/friends/me';
    return getApiClient().get(url, { params });
  },

  /**
   * Get user's friends (paginated)
   */
  async getUserFriends(
    userId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<CursorPaginatedResponse<string>> {
    return getApiClient().get(`/social/friends/${userId}`, { params });
  },

  /**
   * Get friend suggestions/recommendations (paginated)
   */
  async getFriendSuggestions(params?: {
    cursor?: string;
    limit?: number;
  }): Promise<CursorPaginatedResponse<FriendSuggestionDTO>> {
    return getApiClient().get('/social/friends/recommend', { params });
  },

  /**
   * Get blocked users (paginated)
   */
  async getBlockedUsers(params?: {
    cursor?: string;
    limit?: number;
  }): Promise<CursorPaginatedResponse<string>> {
    return getApiClient().get('/social/blocked', { params });
  },
};
