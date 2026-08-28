import { getApiClient } from "@repo/shared";
import {
  AppealStatus,
  FinalDecision,
  Severity,
} from "@/models/moderation/enums/moderationEnum";
import {
  ContentModerationDTO,
  ModerationAppealResponseDTO,
  ModerationRecordDetailDTO,
} from "@/models/moderation/moderationDTO";
import { PageResponse, Pagination, TargetType } from "@repo/shared";

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
    const response = await getApiClient().get<
      PageResponse<ContentModerationDTO>
    >("/moderations/admin/records", {
      params: query,
    });

    return response as any;
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
    const response = await getApiClient().get<
      PageResponse<ModerationAppealResponseDTO>
    >("/moderations/admin/appeals", {
      params: query,
    });

    return response as any;
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
    const response = await getApiClient().patch<ModerationAppealResponseDTO>(
      `/moderations/admin/appeals/${appealId}`,
      body,
      {},
    );

    return response as any;
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
    const response = await getApiClient().post<ContentModerationDTO>(
      `/moderations/${moderationId}/restore`,
      { status },
      {},
    );

    return response as any;
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
    const response = await getApiClient().get<ModerationRecordDetailDTO>(
      `/moderations/admin/records/${moderationId}`,
      {},
    );

    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
