import { getApiClient } from "@repo/shared";

import { PageResponse, Pagination } from "@repo/shared";

import {
  AnalyzeMusicDTO,
  AnalyzeMusicResponseDTO,
  CreateMusicFeatureDTO,
  MusicFeatureResponseDTO,
  MusicGenre,
  UpdateMusicFeatureDTO,
} from "@/models/music/musicDTO";

export interface MusicQuery extends Pagination {
  search?: string;
  genre?: MusicGenre;
}

export const getMusicFeatures = async (
  token: string,
  query: MusicQuery,
): Promise<PageResponse<MusicFeatureResponseDTO>> => {
  try {
    const response = await getApiClient().get<
      PageResponse<MusicFeatureResponseDTO>
    >("/musics", {
      params: query,
    });

    return response as any;
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
    const response = await getApiClient().get<
      PageResponse<MusicFeatureResponseDTO>
    >("/musics/recommendations", {
      params: query,
    });

    return response as any;
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
    const response = await getApiClient().get<MusicFeatureResponseDTO>(
      `/musics/${id}`,
      {},
    );

    return response as any;
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
    const response = await getApiClient().post<MusicFeatureResponseDTO>(
      "/musics",
      payload,
      {},
    );

    return response as any;
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
    const response = await getApiClient().patch<MusicFeatureResponseDTO>(
      `/musics/${id}`,
      payload,
      {},
    );

    return response as any;
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
    const response = await getApiClient().delete<boolean>(`/musics/${id}`, {});

    return response as any;
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
    const response = await getApiClient().post<AnalyzeMusicResponseDTO>(
      "/musics/analyze",
      payload,
      {},
    );

    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
