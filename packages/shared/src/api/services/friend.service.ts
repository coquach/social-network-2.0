/**
 * Friend Service
 * Platform-agnostic friend/social relationship API operations
 */

import { getApiClient } from '../client';
import type {
  CursorPageResponse,
  UserSnapshotDTO,
} from '../../types';

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
  user?: UserSnapshotDTO | null;
  mutualFriendPreview?: UserSnapshotDTO[];
  commonGroups?: number;
  commonGroupIds?: string[];
  score?: number;
  reasons?: string[];
  recommendationId?: string;
  recommendationRequestId?: string;
}

export interface RecommendationAttributionPayload {
  recommendationId?: string;
  recommendationRequestId?: string;
}

export type FriendRecommendationAnalyticsSource =
  | 'mutual_only'
  | 'group_only'
  | 'mixed'
  | 'fallback';

export interface FriendRecommendationAnalyticsTotals {
  served: number;
  dismissed: number;
  requestSent: number;
  accepted: number;
}

export interface FriendRecommendationAnalyticsRates {
  dismissFromServed: number;
  requestSentFromServed: number;
  acceptFromServed: number;
  acceptFromRequests: number;
}

export interface FriendRecommendationAnalyticsSourceBreakdown
  extends FriendRecommendationAnalyticsTotals {
  source: FriendRecommendationAnalyticsSource;
}

export interface FriendRecommendationAnalyticsDTO {
  windowDays: number;
  windowStart: string;
  windowEnd: string;
  totals: FriendRecommendationAnalyticsTotals;
  rates: FriendRecommendationAnalyticsRates;
  sources: FriendRecommendationAnalyticsSourceBreakdown[];
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
  async sendFriendRequest(
    targetId: string,
    payload?: RecommendationAttributionPayload,
  ): Promise<void> {
    return getApiClient().post(`/social/request/${targetId}`, payload ?? {});
  },

  /**
   * Dismiss a friend recommendation temporarily
   */
  async dismissFriendRecommendation(
    targetId: string,
    payload?: RecommendationAttributionPayload,
  ): Promise<{ message: string; expiresAt: string }> {
    return getApiClient().post(
      `/social/friends/recommend/dismiss/${targetId}`,
      payload ?? {},
    );
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
  }): Promise<CursorPageResponse<string>> {
    return getApiClient().getCursorPage('/social/requests', { params });
  },

  /**
   * Get friends list (paginated)
   * @param userId - If provided, get that user's friends; otherwise get current user's friends
   */
  async getFriends(
    userId?: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<CursorPageResponse<string>> {
    const url = userId ? `/social/friends/${userId}` : '/social/friends/me';
    return getApiClient().getCursorPage(url, { params });
  },

  /**
   * Get user's friends (paginated)
   */
  async getUserFriends(
    userId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<CursorPageResponse<string>> {
    return getApiClient().getCursorPage(`/social/friends/${userId}`, { params });
  },

  /**
   * Get friend suggestions/recommendations (paginated)
   */
  async getFriendSuggestions(params?: {
    cursor?: string;
    limit?: number;
  }): Promise<CursorPageResponse<FriendSuggestionDTO>> {
    return getApiClient().getCursorPage('/social/friends/recommend', { params });
  },

  /**
   * Get recommendation funnel analytics for the current user
   */
  async getFriendRecommendationAnalytics(
    days?: number,
  ): Promise<FriendRecommendationAnalyticsDTO> {
    return getApiClient().get('/social/friends/recommend/analytics', {
      params: typeof days === 'number' ? { days } : undefined,
    });
  },

  /**
   * Get blocked users (paginated)
   */
  async getBlockedUsers(params?: {
    cursor?: string;
    limit?: number;
  }): Promise<CursorPageResponse<string>> {
    return getApiClient().getCursorPage('/social/blocked', { params });
  },
};
