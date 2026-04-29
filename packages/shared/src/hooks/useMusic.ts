/**
 * Music Hooks
 * React Query hooks for music operations
 */

import { useQuery } from '@tanstack/react-query';
import { musicService } from '../api/services';
import type {
  MusicFeatureDTO,
  MusicRecommendationPage,
  MusicRecommendationParams,
} from '../types';
import { queryKeys } from './query-keys';

/**
 * Hook to get music recommendations (page-based pagination)
 */
export const useMusicRecommendations = (params?: MusicRecommendationParams) => {
  return useQuery<MusicRecommendationPage>({
    queryKey: queryKeys.music.recommendations(params),
    queryFn: async () => musicService.getMusicRecommendations(params),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

/**
 * Hook to get a single music feature
 */
export const useMusicFeature = (id: string) => {
  return useQuery<MusicFeatureDTO>({
    queryKey: queryKeys.music.detail(id),
    queryFn: async () => musicService.getMusicFeatureById(id),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

/**
 * Hook to list music features (page-based pagination)
 */
export const useMusicFeatures = (
  params?: MusicRecommendationParams & { search?: string; genre?: string },
) => {
  return useQuery<MusicRecommendationPage>({
    queryKey: queryKeys.music.list(params),
    queryFn: async () => musicService.listMusicFeatures(params),
    staleTime: 2 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};
