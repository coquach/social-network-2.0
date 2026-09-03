import { getApiClient } from "@repo/shared";
import {
  CursorPageResponse,
  CursorPagination,
  PageResponse,
  Pagination,
} from "@repo/shared";
import { AdminGroupDTO, GroupStatus, GroupReportDTO } from '@repo/shared';
import { ReportStatus } from "@/models/report/reportDTO";

export interface GroupReportQuery extends CursorPagination {
  groupId?: string;
  status?: ReportStatus;
}

export const getGroupReports = async (
  token: string,
  query: GroupReportQuery,
): Promise<CursorPageResponse<GroupReportDTO>> => {
  try {
    const response = await getApiClient().get<
      CursorPageResponse<GroupReportDTO>
    >(`/group-reports`, {
      params: query,
    });
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export enum GroupMemberRange {
  LT_100 = "LT_100", // < 100
  BETWEEN_100_1000 = "BETWEEN_100_1000",
  GT_1000 = "GT_1000", // > 1000
}
export interface AdminGroupQuery extends Pagination {
  name?: string;
  status?: GroupStatus;
  memberRange?: GroupMemberRange;
}

export const getAdminGroups = async (
  token: string,
  filter: AdminGroupQuery,
): Promise<PageResponse<AdminGroupDTO>> => {
  try {
    const response = await getApiClient().get<PageResponse<AdminGroupDTO>>(
      `/groups/admin`,
      {
        params: filter,
      },
    );
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const banGroup = async (
  token: string,
  groupId: string,
): Promise<boolean> => {
  try {
    const response = await getApiClient().post<boolean>(
      `/group-reports/${groupId}/ban`,
      {},
      {},
    );
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const unbanGroup = async (
  token: string,
  groupId: string,
): Promise<boolean> => {
  try {
    const response = await getApiClient().post<boolean>(
      `/group-reports/${groupId}/unban`,
      {},
      {},
    );
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const ignoreReportGroup = async (
  token: string,
  targetId: string,
): Promise<boolean> => {
  try {
    const response = await getApiClient().post(
      `/group-reports/${targetId}/ignore`,
      {},
      {},
    );
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
