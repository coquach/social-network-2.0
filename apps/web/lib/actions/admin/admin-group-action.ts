import api from '@/lib/api-client';
import {
  CursorPageResponse,
  CursorPagination,
  PageResponse,
  Pagination,
} from '@repo/shared';
import { AdminGroupDTO } from '@/models/group/adminGroupDTO';
import { GroupStatus } from '@/models/group/enums/group-status.enum';
import { GroupReportDTO } from '@/models/group/groupReportDTO';
import { ReportStatus } from '@/models/report/reportDTO';

export interface GroupReportQuery extends CursorPagination {
  groupId?: string;
  status?: ReportStatus;
}

export const getGroupReports = async (
  token: string,
  query: GroupReportQuery,
): Promise<CursorPageResponse<GroupReportDTO>> => {
  try {
    const response = await api.get<CursorPageResponse<GroupReportDTO>>(
      `/group-reports`,
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

export enum GroupMemberRange {
  LT_100 = 'LT_100', // < 100
  BETWEEN_100_1000 = 'BETWEEN_100_1000',
  GT_1000 = 'GT_1000', // > 1000
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
    const response = await api.get<PageResponse<AdminGroupDTO>>(
      `/groups/admin`,
      {
        params: filter,
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

export const banGroup = async (
  token: string,
  groupId: string,
): Promise<boolean> => {
  try {
    const response = await api.post<boolean>(
      `/group-reports/${groupId}/ban`,
      {},
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

export const unbanGroup = async (
  token: string,
  groupId: string,
): Promise<boolean> => {
  try {
    const response = await api.post<boolean>(
      `/group-reports/${groupId}/unban`,
      {},
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

export const ignoreReportGroup = async (
  token: string,
  targetId: string,
): Promise<boolean> => {
  try {
    const response = await api.post(
      `/group-reports/${targetId}/ignore`,
      {},
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
