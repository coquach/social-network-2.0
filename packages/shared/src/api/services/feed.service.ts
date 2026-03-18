/**
 * Feed Service
 * Platform-agnostic feed-related API operations
 */

import { getApiClient } from '../client';
import type { CursorPageResponse, FeedDTO, PostDTO, Emotion } from '../../types';

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
  async getMyFeed(params?: PersonalFeedParams): Promise<CursorPageResponse<FeedDTO>> {
    return getApiClient().getCursorPage('/feeds/my_feed', { params });
  },

  /**
   * Get trending posts feed (paginated)
   */
  async getTrendingFeed(params?: TrendingFeedParams): Promise<CursorPageResponse<PostDTO>> {
    return getApiClient().getCursorPage('/feeds/trending', { params });
  },

  /**
   * Track feed item views
   */
  async trackViews(feedItemIds: string[]): Promise<void> {
    return getApiClient().post('/feeds/views', { feedItemIds });
  },
};
