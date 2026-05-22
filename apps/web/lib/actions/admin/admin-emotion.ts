import api from '@/lib/api-client';
import {
  DashboardOverviewResponseDTO,
  FeedbackAccuracySummaryDTO,
  FeedbackListItemDTO,
  RiskLevel,
  RiskUserDTO,
} from '@/models/emotion/adminEmotionDTO';

import { PageResponse, Pagination } from '@repo/shared';

export interface AdminRiskUserQuery extends Pagination {
  riskLevel?: RiskLevel;

  search?: string;
}

export interface AdminFeedbackQuery extends Pagination {
  isAccurate?: boolean;

  search?: string;
}

export const getEmotionDashboardOverview = async (
  token: string,
): Promise<DashboardOverviewResponseDTO> => {
  try {
    const response = await api.get<DashboardOverviewResponseDTO>(
      '/admin/emotion/dashboard',
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

export const getRiskUsers = async (
  token: string,
  query: AdminRiskUserQuery,
): Promise<PageResponse<RiskUserDTO>> => {
  try {
    const response = await api.get<PageResponse<RiskUserDTO>>(
      '/admin/emotion/risk-users',
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

export const getFeedbacks = async (
  token: string,
  query: AdminFeedbackQuery,
): Promise<PageResponse<FeedbackListItemDTO>> => {
  try {
    const response = await api.get<PageResponse<FeedbackListItemDTO>>(
      '/admin/emotion/feedbacks',
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

export const getFeedbackAccuracySummary = async (
  token: string,
): Promise<FeedbackAccuracySummaryDTO> => {
  try {
    const response = await api.get<FeedbackAccuracySummaryDTO>(
      '/admin/emotion/feedbacks/accuracy',
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
