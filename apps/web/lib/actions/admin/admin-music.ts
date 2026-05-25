import api from '@/lib/api-client';

import { PageResponse, Pagination } from '@repo/shared';

import {
  AnalyzeMusicDTO,
  AnalyzeMusicResponseDTO,
  CreateMusicFeatureDTO,
  MusicFeatureResponseDTO,
  MusicGenre,
  UpdateMusicFeatureDTO,
} from '@/models/music/musicDTO';

export interface MusicQuery extends Pagination {
  search?: string;
  genre?: MusicGenre;
}

export const getMusicFeatures = async (
  token: string,
  query: MusicQuery,
): Promise<PageResponse<MusicFeatureResponseDTO>> => {
  try {
    const response = await api.get<PageResponse<MusicFeatureResponseDTO>>(
      '/musics',
      {
        params: query,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getMusicRecommendations = async (
  token: string,
  query: Pagination,
): Promise<PageResponse<MusicFeatureResponseDTO>> => {
  try {
    const response = await api.get<PageResponse<MusicFeatureResponseDTO>>(
      '/musics/recommendations',
      {
        params: query,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getMusicFeatureById = async (
  token: string,
  id: string,
): Promise<MusicFeatureResponseDTO> => {
  try {
    const response = await api.get<MusicFeatureResponseDTO>(`/musics/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createMusicFeature = async (
  token: string,
  payload: CreateMusicFeatureDTO,
): Promise<MusicFeatureResponseDTO> => {
  try {
    const response = await api.post<MusicFeatureResponseDTO>(
      '/musics',
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateMusicFeature = async (
  token: string,
  id: string,
  payload: UpdateMusicFeatureDTO,
): Promise<MusicFeatureResponseDTO> => {
  try {
    const response = await api.patch<MusicFeatureResponseDTO>(
      `/musics/${id}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteMusicFeature = async (
  token: string,
  id: string,
): Promise<boolean> => {
  try {
    const response = await api.delete<boolean>(`/musics/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const analyzeMusic = async (
  token: string,
  payload: AnalyzeMusicDTO,
): Promise<AnalyzeMusicResponseDTO> => {
  try {
    const response = await api.post<AnalyzeMusicResponseDTO>(
      '/musics/analyze',
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
