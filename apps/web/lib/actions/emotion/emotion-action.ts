import api from '@/lib/api-client';
import {
  EmotionAnalysisDTO,
  EmotionByHourDTO,
  EmotionDailyTrendDTO,
  EmotionHistoryResponse,
  EmotionPreset,
  EmotionSummaryDTO,
} from '@/models/emotion/emotionDTO';

const normalizeDate = (value?: string | Date) => {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  return value.toISOString().slice(0, 10);
};

export interface EmotionQuery {
  preset?: EmotionPreset;
  fromDate?: string | Date;
  toDate?: string | Date;
}

export interface EmotionHistoryFilter extends EmotionQuery {
  cursor?: string;
  limit?: number;
}

export const getEmotionSummary = async (
  token: string,
  query?: EmotionQuery
): Promise<EmotionSummaryDTO> => {
  try {
    const response = await api.get('/emotion/summary', {
      params: {
        ...query,
        fromDate: normalizeDate(query?.fromDate),
        toDate: normalizeDate(query?.toDate),
      },
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

export const getEmotionDailyTrend = async (
  token: string,
  query?: EmotionQuery
): Promise<EmotionDailyTrendDTO[]> => {
  try {
    const response = await api.get('/emotion/summary/daily-trend', {
      params: {
        ...query,
        fromDate: normalizeDate(query?.fromDate),
        toDate: normalizeDate(query?.toDate),
      },
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

export const getEmotionByHour = async (
  token: string
): Promise<EmotionByHourDTO[]> => {
  try {
    const response = await api.get('/emotion/summary/by-hour', {
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

export const getEmotionHistory = async (
  token: string,
  filter: EmotionHistoryFilter
): Promise<EmotionHistoryResponse> => {
  try {
    const response = await api.get('/emotion/history', {
      params: {
        ...filter,
        fromDate: normalizeDate(filter?.fromDate),
        toDate: normalizeDate(filter?.toDate),
      },
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

export const getEmotionDetail = async (
  token: string,
  id: string
): Promise<EmotionAnalysisDTO> => {
  try {
    const response = await api.get(`/emotion/detail/${id}`, {
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
