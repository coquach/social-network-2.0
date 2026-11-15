/**
 * Feed Service
 * Platform-agnostic feed-related API operations
 */

import { getApiClient } from '../client';
import type {
  CursorPageResponse,
  FeedDTO,
  Emotion,
} from '../../types';

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
  async getMyFeed(
    params?: PersonalFeedParams,
  ): Promise<CursorPageResponse<FeedDTO>> {
    return getApiClient().getCursorPage('/feeds/my-feed', { params });
  },

  /**
   * Get trending feed (paginated). Returns the same polymorphic
   * FeedItemDTO shape as the personal feed (POST | SHARE | INTERVENTION).
   */
  async getTrendingFeed(
    params?: TrendingFeedParams,
  ): Promise<CursorPageResponse<FeedDTO>> {
    return getApiClient().getCursorPage('/feeds/trending', { params });
  },

  /**
   * Track feed item views
   */
  async trackViews(feedItemIds: string[]): Promise<void> {
    return getApiClient().post('/feeds/views', { feedItemIds });
  },
};
