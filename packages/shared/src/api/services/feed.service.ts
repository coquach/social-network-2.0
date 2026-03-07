/**
 * Feed Service
 * Platform-agnostic feed-related API operations
 */

import { getApiClient } from '../client';
import type { CursorPaginatedResponse, FeedDTO, PostDTO, Emotion } from '../../types';

/**
 * Personal feed query params
 */
export interface PersonalFeedParams {
  cursor?: string;
  limit?: number;
  mainEmotion?: Emotion;
}

/**
 * Trending feed query params
 */
export interface TrendingFeedParams {
  cursor?: string;
  limit?: number;
  mainEmotion?: Emotion;
}

export const feedService = {
  /**
   * Get personalized feed for current user (paginated)
   */
  async getMyFeed(params?: PersonalFeedParams): Promise<CursorPaginatedResponse<FeedDTO>> {
    return getApiClient().get('/feeds/my_feed', { params });
  },

  /**
   * Get trending posts feed (paginated)
   */
  async getTrendingFeed(params?: TrendingFeedParams): Promise<CursorPaginatedResponse<PostDTO>> {
    return getApiClient().get('/feeds/trending', { params });
  },

  /**
   * Track feed item views
   */
  async trackViews(feedItemIds: string[]): Promise<void> {
    return getApiClient().post('/feeds/views', { feedItemIds });
  },
};
