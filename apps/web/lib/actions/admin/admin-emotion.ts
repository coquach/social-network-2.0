import { getApiClient } from "@repo/shared";
import {
  DashboardOverviewResponseDTO,
  FeedbackAccuracySummaryDTO,
  FeedbackListItemDTO,
  RiskLevel,
  RiskUserDTO,
} from "@/models/emotion/adminEmotionDTO";

import { PageResponse, Pagination } from "@repo/shared";

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
    const response = await getApiClient().get<DashboardOverviewResponseDTO>(
      "/admin/emotion/dashboard",
      {},
    );

    return response as any;
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
    const response = await getApiClient().get<PageResponse<RiskUserDTO>>(
      "/admin/emotion/risk-users",
      {
        params: query,
      },
    );

    return response as any;
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
    const response = await getApiClient().get<
      PageResponse<FeedbackListItemDTO>
    >("/admin/emotion/feedbacks", {
      params: query,
    });

    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getFeedbackAccuracySummary = async (
  token: string,
): Promise<FeedbackAccuracySummaryDTO> => {
  try {
    const response = await getApiClient().get<FeedbackAccuracySummaryDTO>(
      "/admin/emotion/feedbacks/accuracy",
      {},
    );

    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
