import { getApiClient } from "@repo/shared";
import { CursorPageResponse, CursorPagination } from "@repo/shared";
import {
  CreateReportForm,
  ReportDTO,
  ReportStatus,
} from "@/models/report/reportDTO";
import { TargetType } from '@repo/shared';

export const createReport = async (
  token: string,
  reportData: CreateReportForm,
): Promise<ReportDTO> => {
  try {
    const response = await getApiClient().post(
      "/reports/content",
      reportData,
      {},
    );
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const resolveReportTarget = async (
  token: string,
  targetId: string,
  targetType: TargetType,
): Promise<boolean> => {
  try {
    const response = await getApiClient().post(
      `/reports/content/resolve`,
      { targetId, targetType },
      {},
    );
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const ignoreReport = async (
  token: string,
  targetId: string,
  targetType: TargetType,
): Promise<boolean> => {
  try {
    const response = await getApiClient().post(
      `/reports/content/ignore`,
      { targetId, targetType },
      {},
    );
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export interface ReportFilterDTO extends CursorPagination {
  groupId?: string;
  reporterId?: string;
  targetType?: TargetType;
  targetId?: string;
  status?: ReportStatus;
}
export const getReports = async (
  token: string,
  filter: ReportFilterDTO,
): Promise<CursorPageResponse<ReportDTO>> => {
  try {
    const response = await getApiClient().get("/reports/content", {
      params: filter,
    });
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
