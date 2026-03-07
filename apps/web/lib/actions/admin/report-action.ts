import api from "@/lib/api-client";
import { CursorPageResponse, CursorPagination } from "@repo/shared";
import { CreateReportForm, ReportDTO, ReportStatus } from "@/models/report/reportDTO";
import { TargetType } from "@/models/social/enums/social.enum";

export const createReport = async (
  token: string,
  reportData: CreateReportForm
): Promise<ReportDTO> => {
  try {
    const response = await api.post('/reports', reportData, {
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

export const resolveReportTarget = async (
  token: string,
  targetId: string,
  targetType: TargetType
): Promise<boolean> => {
  try {
    const response = await api.post(
      `/reports/resolve`,
      { targetId, targetType },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const ignoreReport = async (
  token: string,
  targetId: string,
  targetType: TargetType
): Promise<boolean> => {
  try {
    const response = await api.post(
      `/reports/ignore`,
      { targetId, targetType },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
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
  filter: ReportFilterDTO
): Promise<CursorPageResponse<ReportDTO>> => {
  try {
    const response = await api.get('/reports', {
      params: filter,
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
