import { uploadToCloudinary } from '@/lib/actions/cloudinary/upload-action';
import { getStandardNextPageParam } from '@repo/shared';
import { handleMutationError, handleMutationSuccess } from '@/lib/mutation-utils';
import {
  approveJoinRequest,
  banMember,
  cancelJoinRequest,
  changeMemberPermission,
  changeMemberRole,
  createGroup,
  createGroupReport,
  deleteGroup,
  getInvitedGroups,
  getGroupById,
  getGroupJoinRequests,
  getGroupLogs,
  getGroupMembers,
  getGroupSettings,
  getMyGroups,
  getRecommendedGroups,
  GroupLogFilter,
  GroupMemberFilter,
  JoinRequestFilter,
  leaveGroup,
  inviteUserToGroup,
  acceptGroupInvite,
  declineGroupInvite,
  rejectJoinRequest,
  removeMember,
  requestToJoinGroup,
  unbanMember,
  updateGroup,
  updateGroupSettings,
} from '@/lib/actions/group/group-action';
import {
  CursorPageResponse,
  CursorPagination,
} from '@repo/shared';
import { getQueryClient } from '@/lib/query-client';
import { queryKeys, mutationKeys } from '@/lib/query-keys';
import { MediaItem } from '@/lib/types/media';
import { GroupPermission } from '@/models/group/enums/group-permission.enum';
import { GroupRole } from '@/models/group/enums/group-role.enum';
import {
  CreateGroupForm,
  GroupDTO,
  UpdateGroupForm,
} from '@/models/group/groupDTO';
import { InvitedGroupDTO } from '@/models/group/groupInviteDTO';
import { GroupLogDTO } from '@/models/group/groupLogDTO';
import { GroupMemberDTO } from '@/models/group/groupMemberDTO';
import {
  CreateGroupReportForm,
  GroupReportDTO,
} from '@/models/group/groupReportDTO';
import { JoinRequestResponseDTO } from '@/models/group/groupRequestDTO';
import {
  GroupSettingDTO,
  UpdateGroupSettingForm,
} from '@/models/group/groupSettingDTO';
import { useAuth } from '@clerk/nextjs';
import {
  InfiniteData,
  QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { withAbortOnUnload } from '@/utils/with-abort-unload';
import { toast } from 'sonner';
export const useGetMyGroups = (query: CursorPagination) => {
  const { getToken } = useAuth();
  return useInfiniteQuery<CursorPageResponse<GroupDTO>>({
    queryKey: queryKeys.groups.myGroups(),
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await getMyGroups(token, {
        ...query,
        cursor: pageParam,
      } as CursorPagination);
    },
    getNextPageParam: getStandardNextPageParam,
    initialPageParam: undefined,
  });
};

export const useGetInvitedGroups = (query: CursorPagination) => {
  const { getToken } = useAuth();
  return useInfiniteQuery<CursorPageResponse<InvitedGroupDTO>>({
    queryKey: queryKeys.groups.invited(query),
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await getInvitedGroups(token, {
        ...query,
        cursor: pageParam,
      } as CursorPagination);
    },
    getNextPageParam: getStandardNextPageParam,
    initialPageParam: undefined,
  });
};

export const useGetRecommendedGroups = (query: CursorPagination) => {
  const { getToken } = useAuth();
  return useInfiniteQuery<CursorPageResponse<GroupDTO>>({
    queryKey: queryKeys.groups.recommended(query),
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await getRecommendedGroups(token, {
        ...query,
        cursor: pageParam,
      } as CursorPagination);
    },
    getNextPageParam: getStandardNextPageParam,
    initialPageParam: undefined,
  });
};

export const useGetGroupById = (groupId: string) => {
  const { getToken } = useAuth();
  return useQuery<GroupDTO>({
    queryKey: queryKeys.groups.detail(groupId),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return getGroupById(token, groupId);
    },
    enabled: !!groupId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export const useCreateGroup = () => {
  const { getToken, userId } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationKey: mutationKeys.groups.create,
    mutationFn: async ({
      form,
      avatar,
      cover,
    }: {
      form: CreateGroupForm;
      avatar: MediaItem;
      cover?: MediaItem;
    }) => {
      return await withAbortOnUnload(async (signal) => {
        const token = await getToken();
        if (!token) throw new Error('No auth token found');

        // Upload avatar nếu có

        const uploadedAvatar = await uploadToCloudinary(
          avatar.file,
          'image',
          `groups/${userId}/avatar`,
          signal
        );

        form.avatar = {
          type: uploadedAvatar.type,
          url: uploadedAvatar.url,
          publicId: uploadedAvatar.publicId,
        };

        // Upload cover nếu có
        if (cover) {
          const uploadedCover = await uploadToCloudinary(
            cover.file,
            'image',
            `groups/${userId}/cover`,
            signal
          );
          form.coverImage = {
            type: uploadedCover.type,
            url: uploadedCover.url,
            publicId: uploadedCover.publicId,
          };
        }

        // Gọi API tạo group
        const newGroup = await createGroup(token, form);
        return newGroup;
      });
    },
    onSuccess: handleMutationSuccess('Tạo nhóm thành công', (newGroup) => {
      // update cache instant
      createGroupInCache(queryClient, newGroup);
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.myGroups() });
    }),
    onError: handleMutationError({ userMessage: 'Tạo nhóm thất bại. Vui lòng thử lại.' }),
    retry: false,
  });
};

export const useUpdateGroup = (groupId: string) => {
  const { getToken, userId } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationKey: mutationKeys.groups.update(groupId),
    mutationFn: async ({
      form,
      avatar,
      cover,
    }: {
      form: UpdateGroupForm;
      avatar?: MediaItem;
      cover?: MediaItem;
    }) => {
      return await withAbortOnUnload(async (signal) => {
        const token = await getToken();
        if (!token) throw new Error('No auth token found');

        // Upload avatar mới nếu có
        if (avatar) {
          const uploadedAvatar = await uploadToCloudinary(
            avatar.file,
            'image',
            `groups/${userId}/avatar`,
            signal
          );
          form.avatar = {
            type: uploadedAvatar.type,
            url: uploadedAvatar.url,
            publicId: uploadedAvatar.publicId,
          };
          console.log('Uploaded avatar:', form.avatar);
        }

        // Upload cover mới nếu có
        if (cover) {
          const uploadedCover = await uploadToCloudinary(
            cover.file,
            'image',
            `groups/${userId}/cover`,
            signal
          );
          form.coverImage = {
            url: uploadedCover.url,
            type: uploadedCover.type,
            publicId: uploadedCover.publicId,
          };
        }

        const updatedGroup = await updateGroup(token, groupId, form);
        return updatedGroup;
      });
    },
    onSuccess: handleMutationSuccess('Cập nhật nhóm thành công', (updatedGroup) => {
      updateGroupInCache(queryClient, updatedGroup);
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.myGroups() });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(groupId) });
    }),
    onError: handleMutationError({ userMessage: 'Cập nhật nhóm thất bại. Vui lòng thử lại.' }),
    retry: false,
  });
};

export const useDeleteGroup = (groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationKey: mutationKeys.groups.delete(groupId),
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await deleteGroup(token, groupId);
    },
    onSuccess: handleMutationSuccess('Xóa nhóm thành công', () => {
      deleteGroupInCache(queryClient, groupId);
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.myGroups() });
    }),
    onError: handleMutationError({ userMessage: 'Xóa nhóm thất bại. Vui lòng thử lại.' }),
  });
};

const createGroupInCache = (queryClient: QueryClient, newGroup: GroupDTO) => {
  // update danh sách "nhóm của tôi"
  queryClient.setQueriesData<InfiniteData<CursorPageResponse<GroupDTO>>>(
    { queryKey: queryKeys.groups.myGroups() },
    (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page, index) =>
          index === 0
            ? { ...page, data: [newGroup, ...page.data] } // thêm vào page đầu
            : page
        ),
      };
    }
  );

  // cache chi tiết group
  queryClient.setQueriesData<GroupDTO>(
    { queryKey: queryKeys.groups.detail(newGroup.id) },
    newGroup
  );
};

const updateGroupInCache = (
  queryClient: QueryClient,
  updatedGroup: GroupDTO
) => {
  queryClient.setQueriesData<InfiniteData<CursorPageResponse<GroupDTO>>>(
    { queryKey: queryKeys.groups.myGroups() },
    (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          data: page.data.map((group) =>
            group.id === updatedGroup.id ? updatedGroup : group
          ),
        })),
      };
    }
  );

  queryClient.setQueriesData<GroupDTO>(
    { queryKey: queryKeys.groups.detail(updatedGroup.id) },
    updatedGroup
  );
};

const deleteGroupInCache = (queryClient: QueryClient, groupId: string) => {
  queryClient.setQueriesData<InfiniteData<CursorPageResponse<GroupDTO>>>(
    { queryKey: queryKeys.groups.myGroups() },
    (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          data: page.data.filter((group) => group.id !== groupId),
        })),
      };
    }
  );

  queryClient.removeQueries({ queryKey: queryKeys.groups.detail(groupId) });
};

/* ====================== SETTINGS ====================== */

export const useGetGroupSettings = (groupId: string) => {
  const { getToken } = useAuth();

  return useQuery<GroupSettingDTO>({
    queryKey: queryKeys.groups.settings(groupId),
    enabled: !!groupId,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return getGroupSettings(token, groupId);
    },
  });
};

export const useUpdateGroupSettings = (groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateGroupSettingForm) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return updateGroupSettings(token, groupId, data);
    },
    onSuccess: (updated) => {
      queryClient.setQueriesData<GroupSettingDTO>(
        { queryKey: queryKeys.groups.settings(groupId) },
        updated
      );
      toast.success('Cập nhật cài đặt nhóm thành công');
    },
    onError: handleMutationError({ userMessage: 'Cập nhật cài đặt nhóm thất bại. Vui lòng thử lại.' }),
  });
};

export const useCreateGroupReport = (groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async (data: CreateGroupReportForm) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return createGroupReport(token, groupId, data);
    },
    onSuccess: handleMutationSuccess('Gửi báo cáo nhóm thành công', (newReport) => {
      addGroupReportToCache(queryClient, groupId, newReport);
    }),
    onError: handleMutationError({ userMessage: 'Gửi báo cáo nhóm thất bại. Vui lòng thử lại.' }),
  });
};

const addGroupReportToCache = (
  queryClient: QueryClient,
  groupId: string,
  report: GroupReportDTO
) => {
  queryClient.setQueriesData<InfiniteData<CursorPageResponse<GroupReportDTO>>>(
    { queryKey: queryKeys.reports.all },
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page, i) =>
          i === 0 ? { ...page, data: [report, ...page.data] } : page
        ),
      };
    }
  );
};

/* ====================== MEMBERS ====================== */

export const useGetGroupMembers = (
  groupId: string,
  filter: GroupMemberFilter
) => {
  const { getToken } = useAuth();

  return useInfiniteQuery<CursorPageResponse<GroupMemberDTO>>({
    queryKey: queryKeys.groups.members(groupId),
    enabled: !!groupId,
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return getGroupMembers(token, groupId, {
        ...filter,
        cursor: pageParam,
      } as GroupMemberFilter);
    },
    getNextPageParam: getStandardNextPageParam,
  });
};

/** Rời nhóm (current user) */
export const useLeaveGroup = (groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationKey: mutationKeys.groups.leave(groupId),
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return leaveGroup(token, groupId);
    },
    onSuccess: () => {
      // Xoá nhóm khỏi danh sách "nhóm của tôi"
      queryClient.setQueriesData<InfiniteData<CursorPageResponse<GroupDTO>>>(
        { queryKey: queryKeys.groups.myGroups() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((g) => g.id !== groupId),
            })),
          };
        }
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.members(groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.detail(groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.detail(groupId),
      });
    },
    onError: () => {
      toast.error('Rời khỏi nhóm thất bại. Vui lòng thử lại.');
    },
  });
};

/** Kick thành viên ra khỏi nhóm */
export const useRemoveMember = (groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationKey: mutationKeys.groups.removeMember(groupId, ''),
    mutationFn: async (memberId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return removeMember(token, groupId, memberId);
    },
    onSuccess: (_, memberId) => {
      removeMemberFromCache(queryClient, groupId, memberId);
      queryClient.invalidateQueries({
        queryKey: ['get-group-by-id', groupId],
      });
    },
    onError: () => {
      toast.error('Xoá thành viên thất bại. Vui lòng thử lại.');
    },
  });
};

/** Ban thành viên */
export const useBanMember = (groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationKey: mutationKeys.groups.banMember(groupId, ''),
    mutationFn: async (memberId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return banMember(token, groupId, memberId);
    },
    onSuccess: (_, memberId) => {
      // Giản lược: coi như bị ban thì biến khỏi list hiện tại
      removeMemberFromCache(queryClient, groupId, memberId);
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.detail(groupId),
      });
    },
    onError: () => {
      toast.error('Chặn thành viên thất bại. Vui lòng thử lại.');
    },
  });
};

/** Unban thành viên */
export const useUnbanMember = (groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationKey: mutationKeys.groups.unbanMember(groupId, ''),
    mutationFn: async (memberId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return unbanMember(token, groupId, memberId);
    },
    onSuccess: () => {
      // Tuỳ UI: thường bạn sẽ có tab "banned", ở đây mình chỉ refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.members(groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.detail(groupId),
      });
    },
    onError: () => {
      toast.error('Gỡ chặn thành viên thất bại. Vui lòng thử lại.');
    },
  });
};

/** Đổi role */
export const useChangeMemberRole = (groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      newRole,
    }: {
      memberId: string;
      newRole: GroupRole;
    }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return changeMemberRole(token, groupId, memberId, newRole);
    },
    onSuccess: (_, { memberId, newRole }) => {
      updateMemberInCache(queryClient, groupId, memberId, (m) => ({
        ...m,
        role: newRole,
      }));
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.detail(groupId),
      });
      toast.success('Cập nhật vai trò thành viên thành công');
    },
    onError: () => {
      toast.error('Cập nhật vai trò thất bại. Vui lòng thử lại.');
    },
  });
};

/** Đổi permission */
export const useChangeMemberPermission = (groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      permissions,
    }: {
      memberId: string;
      permissions: GroupPermission[];
    }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return changeMemberPermission(token, groupId, memberId, permissions);
    },
    onSuccess: (_, { memberId, permissions }) => {
      updateMemberInCache(queryClient, groupId, memberId, (m) => ({
        ...m,
        permissions,
      }));
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.detail(groupId),
      });
      toast.success('Cập nhật quyền thành viên thành công');
    },
    onError: () => {
      toast.error('Cập nhật quyền thất bại. Vui lòng thử lại.');
    },
  });
};

const removeMemberFromCache = (
  queryClient: QueryClient,
  groupId: string,
  memberId: string
) => {
  queryClient.setQueriesData<InfiniteData<CursorPageResponse<GroupMemberDTO>>>(
    { queryKey: queryKeys.groups.members(groupId) },
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: page.data.filter((m) => m.id !== memberId),
        })),
      };
    }
  );
};

const updateMemberInCache = (
  queryClient: QueryClient,
  groupId: string,
  memberId: string,
  updater: (m: GroupMemberDTO) => GroupMemberDTO
) => {
  queryClient.setQueriesData<InfiniteData<CursorPageResponse<GroupMemberDTO>>>(
    { queryKey: queryKeys.groups.members(groupId) },
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: page.data.map((m) => (m.id === memberId ? updater(m) : m)),
        })),
      };
    }
  );
};

/* ====================== LOGS ====================== */

export const useGetGroupLogs = (groupId: string, filter: GroupLogFilter) => {
  const { getToken } = useAuth();

  return useInfiniteQuery<CursorPageResponse<GroupLogDTO>>({
    queryKey: queryKeys.groups.logs(groupId),
    enabled: !!groupId,
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return getGroupLogs(token, groupId, {
        ...filter,
        cursor: pageParam,
      } as GroupLogFilter);
    },
    getNextPageParam: getStandardNextPageParam,
  });
};

/* ====================== JOIN REQUESTS ====================== */

export const useGetGroupJoinRequests = (
  groupId: string,
  filter: JoinRequestFilter
) => {
  const { getToken } = useAuth();

  return useInfiniteQuery<CursorPageResponse<JoinRequestResponseDTO>>({
    queryKey: queryKeys.groups.joinRequests(groupId),
    enabled: !!groupId,
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return getGroupJoinRequests(token, groupId, {
        ...filter,
        cursor: pageParam,
      } as JoinRequestFilter);
    },
    getNextPageParam: getStandardNextPageParam,
  });
};

export const useRequestToJoinGroup = (groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return requestToJoinGroup(token, groupId);
    },
    onSuccess: () => {
      // Cập nhật lại chi tiết group + gợi ý nhóm, nếu đang dùng
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.detail(groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.all,
      });
    },
  });
};

export const useInviteUserToGroup = (groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async (inviteeId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return inviteUserToGroup(token, groupId, inviteeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.detail(groupId),
      });
    },
    onError: () => {
      toast.error('Mời thành viên thất bại. Vui lòng thử lại.');
    },
  });
};

export const useAcceptGroupInvite = (groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return acceptGroupInvite(token, groupId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.invited() });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.myGroups() });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(groupId) });
    },
    onError: () => {
      toast.error('Chấp nhận lời mời thất bại. Vui lòng thử lại.');
    },
  });
};

export const useDeclineGroupInvite = (groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return declineGroupInvite(token, groupId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.invited() });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(groupId) });
    },
    onError: () => {
      toast.error('Từ chối lời mời thất bại. Vui lòng thử lại.');
    },
  });
};

export const useApproveJoinRequest = (groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return approveJoinRequest(token, groupId, requestId);
    },
    onSuccess: (_, requestId) => {
      removeJoinRequestFromCache(queryClient, groupId, requestId);
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.members(groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.detail(groupId),
      });
    },
    onError: () => {
      toast.error('Chấp nhận yêu cầu thất bại. Vui lòng thử lại.');
    },
  });
};

export const useRejectJoinRequest = (groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return rejectJoinRequest(token, groupId, requestId);
    },
    onSuccess: (_, requestId) => {
      removeJoinRequestFromCache(queryClient, groupId, requestId);
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.detail(groupId),
      });
    },
    onError: () => {
      toast.error('Từ chối yêu cầu thất bại. Vui lòng thử lại.');
    },
  });
};

export const useCancelJoinRequest = (groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return cancelJoinRequest(token, groupId, requestId);
    },
    onSuccess: (_, requestId) => {
      removeJoinRequestFromCache(queryClient, groupId, requestId);
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.detail(groupId),
      });
    },
    onError: () => {
      toast.error('Huỷ yêu cầu tham gia thất bại. Vui lòng thử lại.');
    },
  });
};

const removeJoinRequestFromCache = (
  queryClient: QueryClient,
  groupId: string,
  requestId: string
) => {
  queryClient.setQueriesData<
    InfiniteData<CursorPageResponse<JoinRequestResponseDTO>>
  >({ queryKey: queryKeys.groups.joinRequests(groupId) }, (old) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        data: page.data.filter((r) => r.id !== requestId),
      })),
    };
  });
};
