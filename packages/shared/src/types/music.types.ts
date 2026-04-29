/**
 * Music Types
 * Platform-agnostic music-related type definitions
 */

import type { PageResponse, Pagination } from './common.types';

export interface MusicAudioDTO {
  url: string;
  publicId: string;
  duration?: number;
}

export interface MusicMediaItemDTO {
  type?: string;
  url: string;
  publicId: string;
}

export interface MusicFeatureDTO {
  id: string;
  audio: MusicAudioDTO;
  coverImage: MusicMediaItemDTO;
  artist?: string;
  title: string;
  genre?: string;
  valence: number;
  arousal: number;
  createdAt: string | Date;
}

export interface MusicRecommendationParams extends Pagination {}

export type MusicRecommendationPage = PageResponse<MusicFeatureDTO>;
