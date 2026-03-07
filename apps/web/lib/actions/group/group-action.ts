import { GroupEventLog } from '@/models/group/enums/group-envent-log.enum';
import { JoinRequestSortBy, JoinRequestStatus } from '@/models/group/enums/group-invite-status.enum';
import { GroupMemberStatus } from '@/models/group/enums/group-member-status.enum';
import { GroupPermission } from '@/models/group/enums/group-permission.enum';
import { GroupRole } from '@/models/group/enums/group-role.enum';
import {
  CreateGroupForm,
  GroupDTO,
  UpdateGroupForm
} from '@/models/group/groupDTO';
import { InvitedGroupDTO } from '@/models/group/groupInviteDTO';
import { GroupLogDTO } from '@/models/group/groupLogDTO';
import { GroupMemberDTO } from '@/models/group/groupMemberDTO';
import { CreateGroupReportForm, GroupReportDTO } from '@/models/group/groupReportDTO';
import { JoinRequestResponseDTO } from '@/models/group/groupRequestDTO';
import { GroupSettingDTO, UpdateGroupSettingForm } from '@/models/group/groupSettingDTO';
import api from '../../api-client';
import { CursorPageResponse, CursorPagination } from '../../cursor-pagination.dto';


export const getMyGroups = async (
  token: string,
  query: CursorPagination,
): Promise<CursorPageResponse<GroupDTO>> => {
  try {
    const response = await api.get<CursorPageResponse<GroupDTO>>(
      `/groups/my-groups`,
      {
        params: query,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }
    catch (error) {
    console.error(error);
    throw error;
  }
};

export const getRecommendedGroups = async (
  token: string,
  query: CursorPagination,
): Promise<CursorPageResponse<GroupDTO>> => {
  try {
    const response = await api.get<CursorPageResponse<GroupDTO>>(
      `/groups/recommendations`,
      {
        params: query,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }
    catch (error) {
    console.error(error);
    throw error;
  }
};

export const getInvitedGroups = async (
  token: string,
  query: CursorPagination,
): Promise<CursorPageResponse<InvitedGroupDTO>> => {
  try {
    const response = await api.get<CursorPageResponse<InvitedGroupDTO>>(
      `/groups/invited-groups`,
      {
        params: query,
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

export const getGroupById = async (
  token: string,
  groupId: string
): Promise<GroupDTO> => {
  try {
    const response = await api.get<GroupDTO>(`/groups/group/${groupId}`, {
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



export const createGroup = async (
  token: string,
  createGroupDto: CreateGroupForm
): Promise<GroupDTO> => {
  try {
    const response = await api.post<GroupDTO>(`/groups`, createGroupDto, {
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

export const updateGroup = async (
  token: string,
  groupId: string,
  updateGroupDto: UpdateGroupForm
): Promise<GroupDTO> => {
  try {
    const response = await api.patch<GroupDTO>(
      `/groups/group/${groupId}`,
      updateGroupDto,
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

export const deleteGroup = async (
  token: string,
  groupId: string
): Promise<boolean> => {
  try {
   const response = await api.delete<boolean>(`/groups/group/${groupId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getGroupSettings = async (
  token: string,
  groupId: string
): Promise<GroupSettingDTO> => {
  try {
    const response = await api.get<GroupSettingDTO>(
      `/groups/group/${groupId}/settings`,
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
export const updateGroupSettings = async (
  token: string,
  groupId: string,
  settings: UpdateGroupSettingForm
): Promise<GroupSettingDTO> => {
  try {
    const response = await api.patch<GroupSettingDTO>(
      `/groups/group/${groupId}/settings`,
      settings,
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

/*  Group Report*/
export const createGroupReport = async (
  token: string,
  groupId: string,
  createGroupReportDto: CreateGroupReportForm
): Promise<GroupReportDTO> => {
  try {
    const response = await api.post<GroupReportDTO>(
      `/groups/group/${groupId}/reports`,
      createGroupReportDto,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }
    catch (error) {
    console.error(error);
    throw error;
  }
}



export const leaveGroup = async (
  token: string,
  groupId: string
): Promise<void> => {
  try {
    await api.post<void>(`/groups/${groupId}/members/leave`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const removeMember = async (
  token: string,
  groupId: string,
  memberId: string
): Promise<void> => {
  try {
    await api.post<void>(`/groups/${groupId}/members/${memberId}/remove`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
    catch (error) {
    console.error(error);
    throw error;
  }
};

export const banMember = async (
  token: string,
  groupId: string,
  memberId: string
): Promise<void> => {
  try {
    await api.post<void>(`/groups/${groupId}/members/${memberId}/ban`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};  

export const unbanMember = async (
  token: string,
  groupId: string,
  memberId: string
): Promise<void> => {
  try {
    await api.post<void>(`/groups/${groupId}/members/${memberId}/unban`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
    catch (error) {
    console.error(error);
    throw error;
  }
};

export const changeMemberRole = async (
  token: string,
  groupId: string,  
  memberId: string,
  newRole: GroupRole
): Promise<void> => {
  try {
    await api.put<void>(
      `/groups/${groupId}/members/${memberId}/change-role`, 
      { newRole },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }
    catch (error) {
    console.error(error);
    throw error;
  }
};

export const changeMemberPermission = async (
  token: string,
  groupId: string,
  memberId: string,
  permissions: GroupPermission[]
): Promise<void> => {
  try {
    await api.put<void>(  
      `/groups/${groupId}/members/${memberId}/change-permission`,
      { permissions },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }
    catch (error) {
    console.error(error);
    throw error;
  }
};

export interface GroupMemberFilter extends CursorPagination {
  role?: GroupRole;
  status?: GroupMemberStatus
}

export const getGroupMembers = async (
  token: string,
  groupId: string,
  query: GroupMemberFilter
): Promise<CursorPageResponse<GroupMemberDTO>> => {
  try {
    const response = await api.get<CursorPageResponse<GroupMemberDTO>>(
      `/groups/${groupId}/members`,
      {
        params: query,
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

export interface GroupLogFilter extends CursorPagination {
  eventType?: GroupEventLog;
  startTime?: Date;
  endTime?: Date;
}

export const getGroupLogs = async (
  token: string,
  groupId: string,
  query: GroupLogFilter
): Promise<CursorPageResponse<GroupLogDTO>> => {
  try {
    const response = await api.get<CursorPageResponse<GroupLogDTO>>(
      `/groups/${groupId}/logs`,
      {
        params: query,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }
    catch (error) {
    console.error(error);
    throw error;
  }
};


export const requestToJoinGroup = async (
  token: string,
  groupId: string
) => {
  try {
    const response = await api.post(
      `/groups/${groupId}/join-requests`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data ;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const inviteUserToGroup = async (
  token: string,
  groupId: string,
  inviteeId: string
): Promise<boolean> => {
  try {
    const response = await api.post<boolean>(
      `/groups/${groupId}/invites/${inviteeId}`,
      {},
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

export const acceptGroupInvite = async (
  token: string,
  groupId: string
): Promise<boolean> => {
  try {
    const response = await api.post<boolean>(
      `/groups/${groupId}/invites/accept`,
      {},
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

export const declineGroupInvite = async (
  token: string,
  groupId: string
): Promise<boolean> => {
  try {
    const response = await api.post<boolean>(
      `/groups/${groupId}/invites/decline`,
      {},
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

export const approveJoinRequest = async (
  token: string,
  groupId: string,
  requestId: string
): Promise<boolean> => {
  try {
   const response = await api.post<boolean>(
      `/groups/${groupId}/join-requests/${requestId}/approve`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
      
    );
    return response.data ;
  }
    catch (error) {
    console.error(error);
    throw error;
  }
};

export const rejectJoinRequest = async (
  token: string,
  groupId: string,
  requestId: string
): Promise<boolean> => {
  try {
  const response =  await api.post<boolean>(
      `/groups/${groupId}/join-requests/${requestId}/reject`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data ;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const cancelJoinRequest = async (
  token: string,
  groupId: string,
  requestId: string
): Promise<boolean> => {
  try {
  const response =  await api.post<boolean>(
      `/groups/${groupId}/join-requests/${requestId}/cancel`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data ;
  }
    catch (error) {
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
  query: JoinRequestFilter
): Promise<CursorPageResponse<JoinRequestResponseDTO>> => {
  try {
    const response = await api.get<CursorPageResponse<JoinRequestResponseDTO>>(
      `/groups/${groupId}/join-requests`,
      {
        params: query,
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
