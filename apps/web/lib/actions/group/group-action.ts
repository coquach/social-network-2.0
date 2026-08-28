import { GroupEventLog } from "@/models/group/enums/group-envent-log.enum";
import {
  JoinRequestSortBy,
  JoinRequestStatus,
} from "@/models/group/enums/group-invite-status.enum";
import { GroupMemberStatus } from "@/models/group/enums/group-member-status.enum";
import { GroupPermission } from "@/models/group/enums/group-permission.enum";
import { GroupRole } from "@/models/group/enums/group-role.enum";
import {
  CreateGroupForm,
  GroupDTO,
  UpdateGroupForm,
} from "@/models/group/groupDTO";
import { InvitedGroupDTO } from "@/models/group/groupInviteDTO";
import { GroupLogDTO } from "@/models/group/groupLogDTO";
import { GroupMemberDTO } from "@/models/group/groupMemberDTO";
import {
  CreateGroupReportForm,
  GroupReportDTO,
} from "@/models/group/groupReportDTO";
import { JoinRequestResponseDTO } from "@/models/group/groupRequestDTO";
import {
  GroupSettingDTO,
  UpdateGroupSettingForm,
} from "@/models/group/groupSettingDTO";
import { getApiClient } from '@repo/shared';
import { CursorPageResponse, CursorPagination } from "@repo/shared";

export const getMyGroups = async (
  token: string,
  query: CursorPagination,
): Promise<CursorPageResponse<GroupDTO>> => {
  try {
    const response = await getApiClient().get<CursorPageResponse<GroupDTO>>(
      `/groups/my-groups`,
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

export const getRecommendedGroups = async (
  token: string,
  query: CursorPagination,
): Promise<CursorPageResponse<GroupDTO>> => {
  try {
    const response = await getApiClient().get<CursorPageResponse<GroupDTO>>(
      `/groups/recommendations`,
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

export const getInvitedGroups = async (
  token: string,
  query: CursorPagination,
): Promise<CursorPageResponse<InvitedGroupDTO>> => {
  try {
    const response = await getApiClient().get<CursorPageResponse<InvitedGroupDTO>>(
      `/groups/invited-groups`,
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

export const getGroupById = async (
  token: string,
  groupId: string,
): Promise<GroupDTO> => {
  try {
    const response = await getApiClient().get<GroupDTO>(`/groups/${groupId}`, {
      });
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createGroup = async (
  token: string,
  createGroupDto: CreateGroupForm,
): Promise<GroupDTO> => {
  try {
    const response = await getApiClient().post<GroupDTO>(`/groups`, createGroupDto, {
      });
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateGroup = async (
  token: string,
  groupId: string,
  updateGroupDto: UpdateGroupForm,
): Promise<GroupDTO> => {
  try {
    const response = await getApiClient().patch<GroupDTO>(
      `/groups/${groupId}`,
      updateGroupDto,
      {
        },
    );
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteGroup = async (
  token: string,
  groupId: string,
): Promise<boolean> => {
  try {
    const response = await getApiClient().delete<boolean>(`/groups/${groupId}`, {
      });
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getGroupSettings = async (
  token: string,
  groupId: string,
): Promise<GroupSettingDTO> => {
  try {
    const response = await getApiClient().get<GroupSettingDTO>(
      `/groups/${groupId}/settings`,
      {
        },
    );
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const updateGroupSettings = async (
  token: string,
  groupId: string,
  settings: UpdateGroupSettingForm,
): Promise<GroupSettingDTO> => {
  try {
    const response = await getApiClient().patch<GroupSettingDTO>(
      `/groups/${groupId}/settings`,
      settings,
      {
        },
    );
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/*  Group Report*/
export const createGroupReport = async (
  token: string,
  groupId: string,
  createGroupReportDto: CreateGroupReportForm,
): Promise<GroupReportDTO> => {
  try {
    const response = await getApiClient().post<GroupReportDTO>(
      `/groups-reports/${groupId}`,
      createGroupReportDto,
      {
        },
    );
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const leaveGroup = async (
  token: string,
  groupId: string,
): Promise<void> => {
  try {
    await getApiClient().post<void>(
      `/groups/${groupId}/members/leave`,
      {},
      {
        },
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const removeMember = async (
  token: string,
  groupId: string,
  memberId: string,
): Promise<void> => {
  try {
    await getApiClient().post<void>(
      `/groups/${groupId}/members/${memberId}/remove`,
      {},
      {
        },
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const banMember = async (
  token: string,
  groupId: string,
  memberId: string,
): Promise<void> => {
  try {
    await getApiClient().post<void>(
      `/groups/${groupId}/members/${memberId}/ban`,
      {},
      {
        },
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const unbanMember = async (
  token: string,
  groupId: string,
  memberId: string,
): Promise<void> => {
  try {
    await getApiClient().post<void>(
      `/groups/${groupId}/members/${memberId}/unban`,
      {},
      {
        },
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const changeMemberRole = async (
  token: string,
  groupId: string,
  memberId: string,
  newRole: GroupRole,
): Promise<void> => {
  try {
    await getApiClient().put<void>(
      `/groups/${groupId}/members/${memberId}/change-role`,
      { newRole },
      {
        },
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const changeMemberPermission = async (
  token: string,
  groupId: string,
  memberId: string,
  permissions: GroupPermission[],
): Promise<void> => {
  try {
    await getApiClient().put<void>(
      `/groups/${groupId}/members/${memberId}/change-permission`,
      { permissions },
      {
        },
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export interface GroupMemberFilter {
  cursor?: string;
  limit?: number;
  role?: GroupRole;
  status?: GroupMemberStatus;
}

export const getGroupMembers = async (
  token: string,
  groupId: string,
  query: GroupMemberFilter,
): Promise<CursorPageResponse<GroupMemberDTO>> => {
  try {
    const response = await getApiClient().get<CursorPageResponse<GroupMemberDTO>>(
      `/groups/${groupId}/members`,
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

export interface GroupLogFilter extends CursorPagination {
  eventType?: GroupEventLog;
  startTime?: Date;
  endTime?: Date;
}

export const getGroupLogs = async (
  token: string,
  groupId: string,
  query: GroupLogFilter,
): Promise<CursorPageResponse<GroupLogDTO>> => {
  try {
    const response = await getApiClient().get<CursorPageResponse<GroupLogDTO>>(
      `/groups/${groupId}/logs`,
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

export const requestToJoinGroup = async (token: string, groupId: string) => {
  try {
    const response = await getApiClient().post(
      `/groups/${groupId}/join-requests`,
      {},
      {
        },
    );
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const inviteUserToGroup = async (
  token: string,
  groupId: string,
  inviteeId: string,
): Promise<boolean> => {
  try {
    const response = await getApiClient().post<boolean>(
      `/groups/${groupId}/invites/${inviteeId}`,
      {},
      {
        },
    );
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const acceptGroupInvite = async (
  token: string,
  groupId: string,
): Promise<boolean> => {
  try {
    const response = await getApiClient().post<boolean>(
      `/groups/${groupId}/invites/accept`,
      {},
      {
        },
    );
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const declineGroupInvite = async (
  token: string,
  groupId: string,
): Promise<boolean> => {
  try {
    const response = await getApiClient().post<boolean>(
      `/groups/${groupId}/invites/decline`,
      {},
      {
        },
    );
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const approveJoinRequest = async (
  token: string,
  groupId: string,
  requestId: string,
): Promise<boolean> => {
  try {
    const response = await getApiClient().post<boolean>(
      `/groups/${groupId}/join-requests/${requestId}/approve`,
      {},
      {
        },
    );
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const rejectJoinRequest = async (
  token: string,
  groupId: string,
  requestId: string,
): Promise<boolean> => {
  try {
    const response = await getApiClient().post<boolean>(
      `/groups/${groupId}/join-requests/${requestId}/reject`,
      {},
      {
        },
    );
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const cancelJoinRequest = async (
  token: string,
  groupId: string,
  requestId: string,
): Promise<boolean> => {
  try {
    const response = await getApiClient().post<boolean>(
      `/groups/${groupId}/join-requests/${requestId}/cancel`,
      {},
      {
        },
    );
    return response as any;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export interface JoinRequestFilter extends CursorPagination {
  sortBy?: JoinRequestSortBy;
  status?: JoinRequestStatus;
}
export const getGroupJoinRequests = async (
  token: string,
  groupId: string,
  query: JoinRequestFilter,
): Promise<CursorPageResponse<JoinRequestResponseDTO>> => {
  try {
    const response = await getApiClient().get<CursorPageResponse<JoinRequestResponseDTO>>(
      `/groups/${groupId}/join-requests`,
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
