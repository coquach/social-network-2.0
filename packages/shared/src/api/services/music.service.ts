/**
 * Music Service
 * Platform-agnostic music-related API operations
 */

import { getApiClient } from '../client';
import type {
  MusicFeatureDTO,
  MusicRecommendationPage,
  MusicRecommendationParams,
} from '../../types';

export const musicService = {
  /**
   * Get music recommendations for current user (page-based pagination)
   */
  async getMusicRecommendations(
    params?: MusicRecommendationParams,
  ): Promise<MusicRecommendationPage> {
    return getApiClient().get('/musics/recommendations', { params });
  },

  /**
   * Get a single music feature by id
   */
  async getMusicFeatureById(id: string): Promise<MusicFeatureDTO> {
    return getApiClient().get(`/musics/${id}`);
  },

  /**
   * List music features (page-based pagination)
   */
  async listMusicFeatures(
    params?: MusicRecommendationParams & { search?: string; genre?: string },
  ): Promise<MusicRecommendationPage> {
    return getApiClient().get('/musics', { params });
  },
};
