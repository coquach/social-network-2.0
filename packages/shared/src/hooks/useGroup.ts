/**
 * Group Hooks
 * React Query hooks for group operations
 * 
 * Includes:
 * - Group CRUD operations
 * - Member management
 * - Join requests & invitations
 * - Settings & logs
 * - Reports
 */

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { groupService } from '../api/services';
import type {
  GroupDTO,
  GroupSettingDTO,
  GroupMemberDTO,
  GroupLogDTO,
  InvitedGroupDTO,
  JoinRequestResponseDTO,
  CreateGroupInput,
  UpdateGroupInput,
  UpdateGroupSettingInput,
  GroupMemberFilter,
  GroupLogFilter,
  JoinRequestFilter,
  CreateGroupReportInput,
} from '../types/group.types';
import type { CursorPaginatedResponse } from '../types';
import { queryKeys } from './query-keys';

// ==================== Query Hooks ====================

/**
 * Hook to get user's groups (infinite scroll)
 */
export const useMyGroups = (params?: { limit?: number }) => {
  return useInfiniteQuery<CursorPaginatedResponse<GroupDTO>>({
    queryKey: queryKeys.groups.myGroups(),
    queryFn: ({ pageParam }) =>
      groupService.getMyGroups({ ...params, cursor: pageParam as string | undefined }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  });
};

/**
 * Hook to get recommended groups (infinite scroll)
 */
export const useRecommendedGroups = (params?: { limit?: number }) => {
  return useInfiniteQuery<CursorPaginatedResponse<GroupDTO>>({
    queryKey: queryKeys.groups.recommended(),
    queryFn: ({ pageParam }) =>
      groupService.getRecommendedGroups({ ...params, cursor: pageParam as string | undefined }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  });
};

/**
 * Hook to get groups user is invited to (infinite scroll)
 */
export const useInvitedGroups = (params?: { limit?: number }) => {
  return useInfiniteQuery<CursorPaginatedResponse<InvitedGroupDTO>>({
    queryKey: queryKeys.groups.invited(),
    queryFn: ({ pageParam }) =>
      groupService.getInvitedGroups({ ...params, cursor: pageParam as string | undefined }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  });
};

/**
 * Hook to get a single group by ID
 */
export const useGroup = (groupId: string) => {
  return useQuery<GroupDTO>({
    queryKey: queryKeys.groups.detail(groupId),
    queryFn: () => groupService.getGroupById(groupId),
    enabled: !!groupId,
  });
};

/**
 * Hook to get group settings
 */
export const useGroupSettings = (groupId: string) => {
  return useQuery<GroupSettingDTO>({
    queryKey: queryKeys.groups.settings(groupId),
    queryFn: () => groupService.getGroupSettings(groupId),
    enabled: !!groupId,
  });
};

/**
 * Hook to get group members (infinite scroll)
 */
export const useGroupMembers = (groupId: string, filter?: GroupMemberFilter) => {
  return useInfiniteQuery<CursorPaginatedResponse<GroupMemberDTO>>({
    queryKey: [...queryKeys.groups.members(groupId), filter] as const,
    queryFn: ({ pageParam }) =>
      groupService.getGroupMembers(groupId, { ...filter, cursor: pageParam as string | undefined }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    enabled: !!groupId,
  });
};

/**
 * Hook to get group activity logs (infinite scroll)
 */
export const useGroupLogs = (groupId: string, filter?: GroupLogFilter) => {
  return useInfiniteQuery<CursorPaginatedResponse<GroupLogDTO>>({
    queryKey: [...queryKeys.groups.logs(groupId), filter] as const,
    queryFn: ({ pageParam }) =>
      groupService.getGroupLogs(groupId, { ...filter, cursor: pageParam as string | undefined }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    enabled: !!groupId,
  });
};

/**
 * Hook to get pending join requests for a group (infinite scroll)
 */
export const useGroupJoinRequests = (groupId: string, filter?: JoinRequestFilter) => {
  return useInfiniteQuery<CursorPaginatedResponse<JoinRequestResponseDTO>>({
    queryKey: [...queryKeys.groups.joinRequests(groupId), filter] as const,
    queryFn: ({ pageParam }) =>
      groupService.getGroupJoinRequests(groupId, { ...filter, cursor: pageParam as string | undefined }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    enabled: !!groupId,
  });
};

// ==================== Mutation Hooks ====================

/**
 * Hook to create a new group
 */
export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateGroupInput) => groupService.createGroup(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.myGroups() });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.lists() });
    },
  });
};

/**
 * Hook to update a group
 */
export const useUpdateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, input }: { groupId: string; input: UpdateGroupInput }) =>
      groupService.updateGroup(groupId, input),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.myGroups() });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.logs(groupId) });
    },
  });
};

/**
 * Hook to delete a group
 */
export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) => groupService.deleteGroup(groupId),
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
      queryClient.removeQueries({ queryKey: queryKeys.groups.detail(groupId) });
    },
  });
};

/**
 * Hook to update group settings
 */
export const useUpdateGroupSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, input }: { groupId: string; input: UpdateGroupSettingInput }) =>
      groupService.updateGroupSettings(groupId, input),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.settings(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.logs(groupId) });
    },
  });
};

/**
 * Hook to leave a group
 */
export const useLeaveGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) => groupService.leaveGroup(groupId),
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.myGroups() });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.members(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.logs(groupId) });
    },
  });
};

/**
 * Hook to remove a member from group
 */
export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, memberId }: { groupId: string; memberId: string }) =>
      groupService.removeMember(groupId, memberId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.members(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.logs(groupId) });
    },
  });
};

/**
 * Hook to ban a member from group
 */
export const useBanMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, memberId }: { groupId: string; memberId: string }) =>
      groupService.banMember(groupId, memberId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.members(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.logs(groupId) });
    },
  });
};

/**
 * Hook to unban a member from group
 */
export const useUnbanMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, memberId }: { groupId: string; memberId: string }) =>
      groupService.unbanMember(groupId, memberId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.members(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.logs(groupId) });
    },
  });
};

/**
 * Hook to change a member's role
 */
export const useChangeMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, memberId, role }: { groupId: string; memberId: string; role: import('../types/enums').GroupRole }) =>
      groupService.changeMemberRole(groupId, memberId, role),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.members(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.logs(groupId) });
    },
  });
};

/**
 * Hook to change a member's permissions
 */
export const useChangeMemberPermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, memberId, permissions }: { groupId: string; memberId: string; permissions: import('../types/enums').GroupPermission[] }) =>
      groupService.changeMemberPermission(groupId, memberId, permissions),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.members(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.logs(groupId) });
    },
  });
};

/**
 * Hook to request to join a private group
 */
export const useRequestToJoinGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) => groupService.requestToJoinGroup(groupId),
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(groupId) });
    },
  });
};

/**
 * Hook to approve a join request
 */
export const useApproveJoinRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, requestId }: { groupId: string; requestId: string }) =>
      groupService.approveJoinRequest(groupId, requestId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.joinRequests(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.members(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.logs(groupId) });
    },
  });
};

/**
 * Hook to reject a join request
 */
export const useRejectJoinRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, requestId }: { groupId: string; requestId: string }) =>
      groupService.rejectJoinRequest(groupId, requestId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.joinRequests(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.logs(groupId) });
    },
  });
};

/**
 * Hook to cancel own join request
 */
export const useCancelJoinRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, requestId }: { groupId: string; requestId: string }) =>
      groupService.cancelJoinRequest(groupId, requestId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(groupId) });
    },
  });
};

/**
 * Hook to invite a user to join group
 */
export const useInviteUserToGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
      groupService.inviteUserToGroup(groupId, userId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.logs(groupId) });
    },
  });
};

/**
 * Hook to accept a group invitation
 */
export const useAcceptGroupInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) => groupService.acceptGroupInvite(groupId),
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.invited() });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.myGroups() });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.members(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.logs(groupId) });
    },
  });
};

/**
 * Hook to decline a group invitation
 */
export const useDeclineGroupInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) => groupService.declineGroupInvite(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.invited() });
    },
  });
};

/**
 * Hook to create a group report
 */
export const useCreateGroupReport = () => {
  return useMutation({
    mutationFn: ({ groupId, data }: { groupId: string; data: CreateGroupReportInput }) =>
      groupService.createGroupReport(groupId, data),
    onSuccess: () => {
      // Reports are typically handled separately, but we can invalidate if needed
    },
  });
};
