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

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { groupService } from '../api/services';
import type { CursorPageResponse } from '../types';
import { useUploadOptional } from '../contexts/upload-context';
import type { UploadableFile } from '../types/upload.types';
import {
  CreateGroupInput,
  CreateGroupReportInput,
  GroupDTO,
  GroupLogDTO,
  GroupLogFilter,
  GroupMemberDTO,
  GroupMemberFilter,
  GroupSettingDTO,
  InvitedGroupDTO,
  JoinRequestFilter,
  JoinRequestResponseDTO,
  MediaInput,
  UpdateGroupInput,
  UpdateGroupSettingInput,
} from '../types/group.types';
import { MediaType } from '../types/enums';
import {
  addItemToInfiniteCache,
  cancelQueries,
  invalidateQueries,
  removeItemFromInfiniteCache,
  restoreQueryData,
  snapshotQueryData,
} from '../utils/cache-utils';
import { queryConfigs } from '../utils/query-configs';
import { queryKeys } from './query-keys';

// ==================== Query Hooks ====================

/**
 * Hook to get user's groups (infinite scroll)
 */
export const useMyGroups = (params?: { limit?: number }) => {
  return useInfiniteQuery<CursorPageResponse<GroupDTO>>({
    queryKey: queryKeys.groups.myGroups(),
    queryFn: async ({ pageParam }) => {
      return groupService.getMyGroups({
        ...params,
        cursor: pageParam as string | undefined,
      });
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    ...queryConfigs.standard,
  });
};

/**
 * Hook to get recommended groups (infinite scroll)
 */
export const useRecommendedGroups = (params?: { limit?: number }) => {
  return useInfiniteQuery<CursorPageResponse<GroupDTO>>({
    queryKey: queryKeys.groups.recommended(),
    queryFn: async ({ pageParam }) => {
      return groupService.getRecommendedGroups({
        ...params,
        cursor: pageParam as string | undefined,
      });
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    ...queryConfigs.standard,
  });
};

/**
 * Hook to get groups user is invited to (infinite scroll)
 */
export const useInvitedGroups = (params?: { limit?: number }) => {
  return useInfiniteQuery<CursorPageResponse<InvitedGroupDTO>>({
    queryKey: queryKeys.groups.invited(),
    queryFn: async ({ pageParam }) => {
      return groupService.getInvitedGroups({
        ...params,
        cursor: pageParam as string | undefined,
      });
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    ...queryConfigs.realtime,
  });
};

/**
 * Hook to get a single group by ID
 */
export const useGroup = (groupId: string) => {
  return useQuery<GroupDTO>({
    queryKey: queryKeys.groups.detail(groupId),
    queryFn: async () => {
      return groupService.getGroupById(groupId);
    },
    enabled: !!groupId,
    ...queryConfigs.semiStatic,
  });
};

/**
 * Hook to get group settings
 */
export const useGroupSettings = (groupId: string) => {
  return useQuery<GroupSettingDTO>({
    queryKey: queryKeys.groups.settings(groupId),
    queryFn: async () => {
      return groupService.getGroupSettings(groupId);
    },
    enabled: !!groupId,
    ...queryConfigs.semiStatic,
  });
};

/**
 * Hook to get group members (infinite scroll)
 */
export const useGroupMembers = (
  groupId: string,
  filter?: GroupMemberFilter,
) => {
  return useInfiniteQuery<CursorPageResponse<GroupMemberDTO>>({
    queryKey: [...queryKeys.groups.members(groupId), filter] as const,
    queryFn: async ({ pageParam }) => {
      return groupService.getGroupMembers(groupId, {
        ...filter,
        cursor: pageParam as string | undefined,
      });
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    enabled: !!groupId,
    ...queryConfigs.standard,
  });
};

/**
 * Hook to get group activity logs (infinite scroll)
 */
export const useGroupLogs = (groupId: string, filter?: GroupLogFilter) => {
  return useInfiniteQuery<CursorPageResponse<GroupLogDTO>>({
    queryKey: [...queryKeys.groups.logs(groupId), filter] as const,
    queryFn: async ({ pageParam }) => {
      return groupService.getGroupLogs(groupId, {
        ...filter,
        cursor: pageParam as string | undefined,
      });
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    enabled: !!groupId,
    ...queryConfigs.standard,
  });
};

/**
 * Hook to get pending join requests for a group (infinite scroll)
 */
export const useGroupJoinRequests = (
  groupId: string,
  filter?: JoinRequestFilter,
  options?: { enabled?: boolean }
) => {
  return useInfiniteQuery<CursorPageResponse<JoinRequestResponseDTO>>({
    queryKey: [...queryKeys.groups.joinRequests(groupId), filter] as const,
    queryFn: async ({ pageParam }) => {
      return groupService.getGroupJoinRequests(groupId, {
        ...filter,
        cursor: pageParam as string | undefined,
      });
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    enabled: !!groupId && (options?.enabled ?? true),
    ...queryConfigs.realtime,
  });
};

// ==================== Mutation Hooks ====================

/**
 * Hook to create a new group
 * 
 * @example
 * const createGroup = useCreateGroup();
 * createGroup.mutate({
 *   name: 'My Group',
 *   privacy: GroupPrivacy.PUBLIC,
 *   uploadAvatar: { file: avatarFile, type: MediaType.IMAGE },
 *   uploadCover: { file: coverFile, type: MediaType.IMAGE }
 * });
 */
export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  const uploadService = useUploadOptional();

  return useMutation<
    GroupDTO,
    Error,
    CreateGroupInput & {
      uploadAvatar?: UploadableFile;
      uploadCover?: UploadableFile;
    }
  >({
    mutationFn: async ({ uploadAvatar, uploadCover, ...input }) => {
      // Upload avatar if provided
      if (uploadAvatar && uploadService) {
        try {
          const avatarResult = await uploadService.uploadFile(uploadAvatar, {
            folder: 'groups/avatars',
          });

          const avatar: MediaInput = {
            type: avatarResult.type,
            url: avatarResult.url,
            publicId: avatarResult.publicId,
          };

          input.avatar = avatar;
        } catch (uploadError) {
          console.error('Avatar upload failed:', uploadError);
          throw new Error('Failed to upload avatar. Please try again.');
        }
      } else {
        // WORKAROUND: Prevent backend crash (Cannot read properties of null (reading 'url'))
        input.avatar = { type: MediaType.IMAGE, url: '' };
      }

      // Upload cover image if provided
      if (uploadCover && uploadService) {
        try {
          const coverResult = await uploadService.uploadFile(uploadCover, {
            folder: 'groups/covers',
          });

          const coverImage: MediaInput = {
            type: coverResult.type,
            url: coverResult.url,
            publicId: coverResult.publicId,
          };

          input.coverImage = coverImage;
        } catch (uploadError) {
          console.error('Cover image upload failed:', uploadError);
          throw new Error('Failed to upload cover image. Please try again.');
        }
      } else {
        // WORKAROUND: Prevent backend crash (Cannot read properties of null (reading 'url'))
        input.coverImage = { type: MediaType.IMAGE, url: '' };
      }

      return groupService.createGroup(input);
    },
    onSuccess: (newGroup) => {
      // Add to my groups cache
      addItemToInfiniteCache(
        queryClient,
        [...queryKeys.groups.myGroups()] as unknown[],
        newGroup,
      );
      // Invalidate lists for fresh counts
      invalidateQueries(queryClient, [
        [...queryKeys.groups.lists()] as unknown[],
      ]);
    },
  });
};

/**
 * Hook to update a group
 * 
 * @example
 * const updateGroup = useUpdateGroup();
 * updateGroup.mutate({
 *   groupId: 'group-123',
 *   input: { name: 'Updated Name' },
 *   uploadAvatar: { file: newAvatar, type: MediaType.IMAGE }
 * });
 */
export const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  const uploadService = useUploadOptional();

  return useMutation<
    GroupDTO,
    Error,
    {
      groupId: string;
      input: UpdateGroupInput;
      uploadAvatar?: UploadableFile;
      uploadCover?: UploadableFile;
    }
  >({
    mutationFn: async ({ groupId, input, uploadAvatar, uploadCover }) => {
      // Upload avatar if provided
      if (uploadAvatar && uploadService) {
        try {
          const avatarResult = await uploadService.uploadFile(uploadAvatar, {
            folder: `groups/${groupId}/avatars`,
          });

          const avatar: MediaInput = {
            type: avatarResult.type,
            url: avatarResult.url,
            publicId: avatarResult.publicId,
          };

          input.avatar = avatar;
        } catch (uploadError) {
          console.error('Avatar upload failed:', uploadError);
          throw new Error('Failed to upload avatar. Please try again.');
        }
      }

      // Upload cover image if provided
      if (uploadCover && uploadService) {
        try {
          const coverResult = await uploadService.uploadFile(uploadCover, {
            folder: `groups/${groupId}/covers`,
          });

          const coverImage: MediaInput = {
            type: coverResult.type,
            url: coverResult.url,
            publicId: coverResult.publicId,
          };

          input.coverImage = coverImage;
        } catch (uploadError) {
          console.error('Cover image upload failed:', uploadError);
          throw new Error('Failed to upload cover image. Please try again.');
        }
      }

      return groupService.updateGroup(groupId, input);
    },
    onMutate: async ({ groupId }) => {
      await cancelQueries(queryClient, [
        [...queryKeys.groups.detail(groupId)] as unknown[],
      ]);
      return snapshotQueryData(queryClient, [
        ...queryKeys.groups.detail(groupId),
      ] as unknown[]);
    },
    onSuccess: (_, { groupId }) => {
      invalidateQueries(queryClient, [
        [...queryKeys.groups.detail(groupId)] as unknown[],
        [...queryKeys.groups.myGroups()] as unknown[],
        [...queryKeys.groups.logs(groupId)] as unknown[],
      ]);
    },
    onError: (_error, { groupId }, context) => {
      if (context) {
        restoreQueryData(
          queryClient,
          [...queryKeys.groups.detail(groupId)] as unknown[],
          context,
        );
      }
    },
  });
};

/**
 * Hook to delete a group
 */
export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      return groupService.deleteGroup(groupId);
    },
    onMutate: async (groupId) => {
      await cancelQueries(queryClient, [
        [...queryKeys.groups.detail(groupId)] as unknown[],
      ]);
      const snapshot = snapshotQueryData(queryClient, [
        ...queryKeys.groups.detail(groupId),
      ] as unknown[]);
      // Optimistically remove from my groups
      removeItemFromInfiniteCache<GroupDTO>(
        queryClient,
        [...queryKeys.groups.myGroups()] as unknown[],
        (item) => item.id === groupId,
      );
      return snapshot;
    },
    onSuccess: (_, groupId) => {
      queryClient.removeQueries({ queryKey: queryKeys.groups.detail(groupId) });
      invalidateQueries(queryClient, [[...queryKeys.groups.all] as unknown[]]);
    },
    onError: (_error, groupId, context) => {
      if (context) {
        restoreQueryData(
          queryClient,
          [...queryKeys.groups.detail(groupId)] as unknown[],
          context,
        );
      }
      // Re-fetch to restore state
      invalidateQueries(queryClient, [
        [...queryKeys.groups.myGroups()] as unknown[],
      ]);
    },
  });
};

/**
 * Hook to update group settings
 */
export const useUpdateGroupSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupId,
      input,
    }: {
      groupId: string;
      input: UpdateGroupSettingInput;
    }) => {
      return groupService.updateGroupSettings(groupId, input);
    },
    onMutate: async ({ groupId }) => {
      await cancelQueries(queryClient, [
        [...queryKeys.groups.settings(groupId)] as unknown[],
      ]);
      return snapshotQueryData(queryClient, [
        ...queryKeys.groups.settings(groupId),
      ] as unknown[]);
    },
    onSuccess: (_, { groupId }) => {
      invalidateQueries(queryClient, [
        [...queryKeys.groups.settings(groupId)] as unknown[],
        [...queryKeys.groups.logs(groupId)] as unknown[],
      ]);
    },
    onError: (_error, { groupId }, context) => {
      if (context) {
        restoreQueryData(
          queryClient,
          [...queryKeys.groups.settings(groupId)] as unknown[],
          context,
        );
      }
    },
  });
};

/**
 * Hook to leave a group
 */
export const useLeaveGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      return groupService.leaveGroup(groupId);
    },
    onMutate: async (groupId) => {
      await cancelQueries(queryClient, [
        [...queryKeys.groups.myGroups()] as unknown[],
        [...queryKeys.groups.detail(groupId)] as unknown[],
      ]);
      // Optimistically remove from my groups
      removeItemFromInfiniteCache<GroupDTO>(
        queryClient,
        [...queryKeys.groups.myGroups()] as unknown[],
        (item) => item.id === groupId,
      );
    },
    onSuccess: (_, groupId) => {
      invalidateQueries(queryClient, [
        [...queryKeys.groups.myGroups()] as unknown[],
        [...queryKeys.groups.detail(groupId)] as unknown[],
        [...queryKeys.groups.members(groupId)] as unknown[],
        [...queryKeys.groups.logs(groupId)] as unknown[],
      ]);
    },
    onError: (_error, _groupId) => {
      // Restore my groups list
      invalidateQueries(queryClient, [
        [...queryKeys.groups.myGroups()] as unknown[],
      ]);
    },
  });
};

/**
 * Hook to remove a member from group
 */
export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupId,
      memberId,
    }: {
      groupId: string;
      memberId: string;
    }) => {
      return groupService.removeMember(groupId, memberId);
    },
    onMutate: async ({ groupId, memberId }) => {
      await cancelQueries(queryClient, [
        [...queryKeys.groups.members(groupId)] as unknown[],
      ]);
      // Optimistically remove member
      removeItemFromInfiniteCache<GroupMemberDTO>(
        queryClient,
        [...queryKeys.groups.members(groupId)] as unknown[],
        (item) => item.userId === memberId,
      );
    },
    onSuccess: (_, { groupId }) => {
      invalidateQueries(queryClient, [
        [...queryKeys.groups.members(groupId)] as unknown[],
        [...queryKeys.groups.detail(groupId)] as unknown[],
        [...queryKeys.groups.logs(groupId)] as unknown[],
      ]);
    },
    onError: (_error, { groupId }) => {
      // Restore members list
      invalidateQueries(queryClient, [
        [...queryKeys.groups.members(groupId)] as unknown[],
      ]);
    },
  });
};

/**
 * Hook to ban a member from group
 */
export const useBanMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupId,
      memberId,
    }: {
      groupId: string;
      memberId: string;
    }) => {
      return groupService.banMember(groupId, memberId);
    },
    onMutate: async ({ groupId }) => {
      await cancelQueries(queryClient, [
        [...queryKeys.groups.members(groupId)] as unknown[],
        [...queryKeys.groups.detail(groupId)] as unknown[],
      ]);
    },
    onSuccess: (_, { groupId }) => {
      invalidateQueries(queryClient, [
        [...queryKeys.groups.members(groupId)] as unknown[],
        [...queryKeys.groups.detail(groupId)] as unknown[],
        [...queryKeys.groups.logs(groupId)] as unknown[],
      ]);
    },
  });
};

/**
 * Hook to unban a member from group
 */
export const useUnbanMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupId,
      memberId,
    }: {
      groupId: string;
      memberId: string;
    }) => {
      return groupService.unbanMember(groupId, memberId);
    },
    onMutate: async ({ groupId }) => {
      await cancelQueries(queryClient, [
        [...queryKeys.groups.members(groupId)] as unknown[],
      ]);
    },
    onSuccess: (_, { groupId }) => {
      invalidateQueries(queryClient, [
        [...queryKeys.groups.members(groupId)] as unknown[],
        [...queryKeys.groups.logs(groupId)] as unknown[],
      ]);
    },
  });
};

/**
 * Hook to change a member's role
 */
export const useChangeMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupId,
      memberId,
      role,
    }: {
      groupId: string;
      memberId: string;
      role: import('../types/enums').GroupRole;
    }) => {
      return groupService.changeMemberRole(groupId, memberId, role);
    },
    onMutate: async ({ groupId }) => {
      await cancelQueries(queryClient, [
        [...queryKeys.groups.members(groupId)] as unknown[],
      ]);
    },
    onSuccess: (_, { groupId }) => {
      invalidateQueries(queryClient, [
        [...queryKeys.groups.members(groupId)] as unknown[],
        [...queryKeys.groups.logs(groupId)] as unknown[],
      ]);
    },
  });
};

/**
 * Hook to change a member's permissions
 */
export const useChangeMemberPermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupId,
      memberId,
      permissions,
    }: {
      groupId: string;
      memberId: string;
      permissions: import('../types/enums').GroupPermission[];
    }) => {
      return groupService.changeMemberPermission(
        groupId,
        memberId,
        permissions,
      );
    },
    onMutate: async ({ groupId }) => {
      await cancelQueries(queryClient, [
        [...queryKeys.groups.members(groupId)] as unknown[],
      ]);
    },
    onSuccess: (_, { groupId }) => {
      invalidateQueries(queryClient, [
        [...queryKeys.groups.members(groupId)] as unknown[],
        [...queryKeys.groups.logs(groupId)] as unknown[],
      ]);
    },
  });
};

/**
 * Hook to request to join a private group
 */
export const useRequestToJoinGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      return groupService.requestToJoinGroup(groupId);
    },
    onMutate: async (groupId) => {
      await cancelQueries(queryClient, [
        [...queryKeys.groups.detail(groupId)] as unknown[],
      ]);
    },
    onSuccess: (_, groupId) => {
      invalidateQueries(queryClient, [
        [...queryKeys.groups.detail(groupId)] as unknown[],
      ]);
    },
  });
};

/**
 * Hook to approve a join request
 */
export const useApproveJoinRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupId,
      requestId,
    }: {
      groupId: string;
      requestId: string;
    }) => {
      return groupService.approveJoinRequest(groupId, requestId);
    },
    onMutate: async ({ groupId, requestId }) => {
      await cancelQueries(queryClient, [
        [...queryKeys.groups.joinRequests(groupId)] as unknown[],
      ]);
      // Optimistically remove from join requests
      removeItemFromInfiniteCache<JoinRequestResponseDTO>(
        queryClient,
        [...queryKeys.groups.joinRequests(groupId)] as unknown[],
        (item) => item.id === requestId,
      );
    },
    onSuccess: (_, { groupId }) => {
      invalidateQueries(queryClient, [
        [...queryKeys.groups.joinRequests(groupId)] as unknown[],
        [...queryKeys.groups.members(groupId)] as unknown[],
        [...queryKeys.groups.detail(groupId)] as unknown[],
        [...queryKeys.groups.logs(groupId)] as unknown[],
      ]);
    },
    onError: (_error, { groupId }) => {
      // Restore join requests list
      invalidateQueries(queryClient, [
        [...queryKeys.groups.joinRequests(groupId)] as unknown[],
      ]);
    },
  });
};

/**
 * Hook to reject a join request
 */
export const useRejectJoinRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupId,
      requestId,
    }: {
      groupId: string;
      requestId: string;
    }) => {
      return groupService.rejectJoinRequest(groupId, requestId);
    },
    onMutate: async ({ groupId, requestId }) => {
      await cancelQueries(queryClient, [
        [...queryKeys.groups.joinRequests(groupId)] as unknown[],
      ]);
      // Optimistically remove from join requests
      removeItemFromInfiniteCache<JoinRequestResponseDTO>(
        queryClient,
        [...queryKeys.groups.joinRequests(groupId)] as unknown[],
        (item) => item.id === requestId,
      );
    },
    onSuccess: (_, { groupId }) => {
      invalidateQueries(queryClient, [
        [...queryKeys.groups.joinRequests(groupId)] as unknown[],
        [...queryKeys.groups.logs(groupId)] as unknown[],
      ]);
    },
    onError: (_error, { groupId }) => {
      // Restore join requests list
      invalidateQueries(queryClient, [
        [...queryKeys.groups.joinRequests(groupId)] as unknown[],
      ]);
    },
  });
};

/**
 * Hook to cancel own join request
 */
export const useCancelJoinRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupId,
      requestId,
    }: {
      groupId: string;
      requestId: string;
    }) => {
      return groupService.cancelJoinRequest(groupId, requestId);
    },
    onMutate: async ({ groupId }) => {
      await cancelQueries(queryClient, [
        [...queryKeys.groups.detail(groupId)] as unknown[],
      ]);
    },
    onSuccess: (_, { groupId }) => {
      invalidateQueries(queryClient, [
        [...queryKeys.groups.detail(groupId)] as unknown[],
      ]);
    },
  });
};

/**
 * Hook to invite a user to join group
 */
export const useInviteUserToGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupId,
      userId,
    }: {
      groupId: string;
      userId: string;
    }) => {
      return groupService.inviteUserToGroup(groupId, userId);
    },
    onSuccess: (_, { groupId }) => {
      invalidateQueries(queryClient, [
        [...queryKeys.groups.logs(groupId)] as unknown[],
      ]);
    },
  });
};

/**
 * Hook to accept a group invitation
 */
export const useAcceptGroupInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      return groupService.acceptGroupInvite(groupId);
    },
    onSuccess: (_, groupId) => {
      invalidateQueries(queryClient, [
        [...queryKeys.groups.invited()] as unknown[],
        [...queryKeys.groups.myGroups()] as unknown[],
        [...queryKeys.groups.detail(groupId)] as unknown[],
        [...queryKeys.groups.members(groupId)] as unknown[],
        [...queryKeys.groups.logs(groupId)] as unknown[],
      ]);
    },
  });
};

/**
 * Hook to decline a group invitation
 */
export const useDeclineGroupInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      return groupService.declineGroupInvite(groupId);
    },
    onSuccess: () => {
      invalidateQueries(queryClient, [
        [...queryKeys.groups.invited()] as unknown[],
      ]);
    },
  });
};

/**
 * Hook to create a group report
 */
export const useCreateGroupReport = () => {
  return useMutation({
    mutationFn: async ({
      groupId,
      data,
    }: {
      groupId: string;
      data: CreateGroupReportInput;
    }) => {
      return groupService.createGroupReport(groupId, data);
    },
    onSuccess: () => {
      // Reports are typically handled separately, but we can invalidate if needed
    },
  });
};
