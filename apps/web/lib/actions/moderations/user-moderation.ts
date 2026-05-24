import api from '@/lib/api-client';
import {
  ContentModerationDTO,
  ModerationAppealResponseDTO,
  ModerationRecordDetailDTO,
} from '@/models/moderation/moderationDTO';
import { PageResponse, Pagination, TargetType } from '@repo/shared';

export interface GetMyModerationQuery extends Pagination {
  targetType?: TargetType;
}

export interface CreateAppealRequestDTO {
  moderationId: string;
  reason: string;
}

export const getMyModerationRecords = async (
  token: string,
  query: GetMyModerationQuery,
): Promise<PageResponse<ContentModerationDTO>> => {
  try {
    const response = await api.get<PageResponse<ContentModerationDTO>>(
      '/moderations/me',
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

export const getModerationRecordDetail = async (
  token: string,
  moderationId: string,
): Promise<ModerationRecordDetailDTO> => {
  try {
    const response = await api.get<ModerationRecordDetailDTO>(
      `/moderations/records/${moderationId}`,
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

export const createAppeal = async (
  token: string,
  body: CreateAppealRequestDTO,
): Promise<ModerationAppealResponseDTO> => {
  try {
    const response = await api.post<ModerationAppealResponseDTO>(
      '/moderations/appeals',
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
