/**
 * Group Service
 * Platform-agnostic group-related API operations
 */

import { getApiClient } from '../client';
import type {
  GroupDTO,
  InvitedGroupDTO,
  GroupMemberDTO,
  GroupSettingDTO,
  GroupLogDTO,
  GroupReportDTO,
  JoinRequestResponseDTO,
  CreateGroupInput,
  UpdateGroupInput,
  UpdateGroupSettingInput,
  CreateGroupReportInput,
  GroupMemberFilter,
  GroupLogFilter,
  JoinRequestFilter,
  CursorPageResponse,
  GroupRole,
  GroupPermission,
} from '../../types';

export const groupService = {
  // ==================== Group CRUD ====================

  /**
   * Get current user's groups (paginated)
   */
  async getMyGroups(params?: {
    cursor?: string;
    limit?: number;
  }): Promise<CursorPageResponse<GroupDTO>> {
    return getApiClient().getCursorPage('/groups/my-groups', { params });
  },

  /**
   * Get recommended groups for user (paginated)
   */
  async getRecommendedGroups(params?: {
    cursor?: string;
    limit?: number;
  }): Promise<CursorPageResponse<GroupDTO>> {
    return getApiClient().getCursorPage('/groups/recommendations', { params });
  },

  /**
   * Get groups user has been invited to (paginated)
   */
  async getInvitedGroups(params?: {
    cursor?: string;
    limit?: number;
  }): Promise<CursorPageResponse<InvitedGroupDTO>> {
    return getApiClient().getCursorPage('/groups/invited-groups', { params });
  },

  /**
   * Get single group by ID
   */
  async getGroupById(groupId: string): Promise<GroupDTO> {
    return getApiClient().get(`/groups/${groupId}`);
  },

  /**
   * Create a new group
   */
  async createGroup(data: CreateGroupInput): Promise<GroupDTO> {
    return getApiClient().post('/groups', data);
  },

  /**
   * Update existing group
   */

  async updateGroup(
    groupId: string,
    data: UpdateGroupInput,
  ): Promise<GroupDTO> {
    return getApiClient().patch(`/groups/${groupId}`, data);
  },

  /**
   * Delete group
   */
  async deleteGroup(groupId: string): Promise<boolean> {
    return getApiClient().delete(`/groups/${groupId}`);
  },

  // ==================== Group Settings ====================

  /**
   * Get group settings
   */
  async getGroupSettings(groupId: string): Promise<GroupSettingDTO> {
    return getApiClient().get(`/groups/${groupId}/settings`);
  },

  /**
   * Update group settings
   */
  async updateGroupSettings(
    groupId: string,
    data: UpdateGroupSettingInput,
  ): Promise<GroupSettingDTO> {
    return getApiClient().patch(`/groups/${groupId}/settings`, data);
  },

  // ==================== Group Reports ====================

  /**
   * Create a report for group content
   */
  async createGroupReport(
    groupId: string,
    data: CreateGroupReportInput,
  ): Promise<GroupReportDTO> {
    return getApiClient().post(`/group-reports/${groupId}`, data);
  },

  // ==================== Member Management ====================

  /**
   * Leave group (current user)
   */
  async leaveGroup(groupId: string): Promise<void> {
    return getApiClient().post(`/groups/${groupId}/members/leave`, {});
  },

  /**
   * Remove member from group
   */
  async removeMember(groupId: string, memberId: string): Promise<void> {
    return getApiClient().post(
      `/groups/${groupId}/members/${memberId}/remove`,
      {},
    );
  },

  /**
   * Ban member from group
   */
  async banMember(groupId: string, memberId: string): Promise<void> {
    return getApiClient().post(
      `/groups/${groupId}/members/${memberId}/ban`,
      {},
    );
  },

  /**
   * Unban member from group
   */
  async unbanMember(groupId: string, memberId: string): Promise<void> {
    return getApiClient().post(
      `/groups/${groupId}/members/${memberId}/unban`,
      {},
    );
  },

  /**
   * Change member's role in group
   */
  async changeMemberRole(
    groupId: string,
    memberId: string,
    newRole: GroupRole,
  ): Promise<void> {
    return getApiClient().put(
      `/groups/${groupId}/members/${memberId}/change-role`,
      {
        newRole,
      },
    );
  },

  /**
   * Change member's custom permissions
   */
  async changeMemberPermission(
    groupId: string,
    memberId: string,
    permissions: GroupPermission[],
  ): Promise<void> {
    return getApiClient().put(
      `/groups/${groupId}/members/${memberId}/change-permission`,
      {
        permissions,
      },
    );
  },

  /**
   * Get group members (paginated with filters)
   */
  async getGroupMembers(
    groupId: string,
    params?: GroupMemberFilter,
  ): Promise<CursorPageResponse<GroupMemberDTO>> {
    return getApiClient().getCursorPage(`/groups/${groupId}/members`, {
      params,
    });
  },

  // ==================== Activity Logs ====================

  /**
   * Get group activity logs (paginated with filters)
   */
  async getGroupLogs(
    groupId: string,
    params?: GroupLogFilter,
  ): Promise<CursorPageResponse<GroupLogDTO>> {
    return getApiClient().getCursorPage(`/groups/${groupId}/logs`, { params });
  },

  // ==================== Join Requests ====================

  /**
   * Request to join group
   */
  async requestToJoinGroup(groupId: string): Promise<any> {
    return getApiClient().post(`/groups/${groupId}/join-requests`, {});
  },

  /**
   * Approve join request
   */
  async approveJoinRequest(
    groupId: string,
    requestId: string,
  ): Promise<boolean> {
    return getApiClient().post(
      `/groups/${groupId}/join-requests/${requestId}/approve`,
      {},
    );
  },

  /**
   * Reject join request
   */
  async rejectJoinRequest(
    groupId: string,
    requestId: string,
  ): Promise<boolean> {
    return getApiClient().post(
      `/groups/${groupId}/join-requests/${requestId}/reject`,
      {},
    );
  },

  /**
   * Cancel join request
   */
  async cancelJoinRequest(
    groupId: string,
    requestId: string,
  ): Promise<boolean> {
    return getApiClient().post(
      `/groups/${groupId}/join-requests/${requestId}/cancel`,
      {},
    );
  },

  /**
   * Get group join requests (paginated with filters)
   */
  async getGroupJoinRequests(
    groupId: string,
    params?: JoinRequestFilter,
  ): Promise<CursorPageResponse<JoinRequestResponseDTO>> {
    return getApiClient().getCursorPage(`/groups/${groupId}/join-requests`, {
      params,
    });
  },

  // ==================== Group Invitations ====================

  /**
   * Invite user to group
   */
  async inviteUserToGroup(
    groupId: string,
    inviteeId: string,
  ): Promise<boolean> {
    return getApiClient().post(`/groups/${groupId}/invites/${inviteeId}`, {});
  },

  /**
   * Accept group invitation
   */
  async acceptGroupInvite(groupId: string): Promise<boolean> {
    return getApiClient().post(`/groups/${groupId}/invites/accept`, {});
  },

  /**
   * Decline group invitation
   */
  async declineGroupInvite(groupId: string): Promise<boolean> {
    return getApiClient().post(`/groups/${groupId}/invites/decline`, {});
  },
};
