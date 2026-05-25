import api from '@/lib/api-client';
import {
  AppealStatus,
  FinalDecision,
  Severity,
} from '@/models/moderation/enums/moderationEnum';
import {
  ContentModerationDTO,
  ModerationAppealResponseDTO,
  ModerationRecordDetailDTO,
} from '@/models/moderation/moderationDTO';
import { PageResponse, Pagination, TargetType } from '@repo/shared';

export interface AdminModerationQuery extends Pagination {
  targetType?: TargetType;
  maxSeverity?: Severity;
  finalDecision?: FinalDecision;
  fromDate?: string;
  toDate?: string;
}

export interface AdminAppealQuery extends Pagination {
  status?: AppealStatus;
}

export interface CreateAdminReviewAppealDTO {
  status: AppealStatus;
  reviewNote?: string;
}

export const getAdminModerationRecords = async (
  token: string,
  query: AdminModerationQuery,
): Promise<PageResponse<ContentModerationDTO>> => {
  try {
    const response = await api.get<PageResponse<ContentModerationDTO>>(
      '/moderations/admin/records',
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

export const getAdminAppeals = async (
  token: string,
  query: AdminAppealQuery,
): Promise<PageResponse<ModerationAppealResponseDTO>> => {
  try {
    const response = await api.get<PageResponse<ModerationAppealResponseDTO>>(
      '/moderations/admin/appeals',
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

export const reviewAppeal = async (
  token: string,
  appealId: string,
  body: CreateAdminReviewAppealDTO,
): Promise<ModerationAppealResponseDTO> => {
  try {
    const response = await api.patch<ModerationAppealResponseDTO>(
      `/moderations/admin/appeals/${appealId}`,
      body,
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

export const restoreModeratedContent = async (
  token: string,
  moderationId: string,
  status: AppealStatus,
): Promise<ContentModerationDTO> => {
  try {
    const response = await api.post<ContentModerationDTO>(
      `/moderations/${moderationId}/restore`,
      { status },
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

export const getAdminModerationRecordDetail = async (
  token: string,
  moderationId: string,
): Promise<ModerationRecordDetailDTO> => {
  try {
    const response = await api.get<ModerationRecordDetailDTO>(
      `/moderations/admin/records/${moderationId}`,
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
