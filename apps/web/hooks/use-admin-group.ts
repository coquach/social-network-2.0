'use client';

import { useAuth } from '@clerk/nextjs';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  AdminGroupQuery,
  banGroup,
  getAdminGroups,
  getGroupReports,
  ignoreReportGroup,
  GroupReportQuery,
  unbanGroup,
} from '@/lib/actions/admin/admin-group-action';
import { CursorPageResponse, getStandardNextPageParam, PageResponse } from '@repo/shared';
import { AdminGroupDTO } from '@/models/group/adminGroupDTO';
import { GroupReportDTO } from '@/models/group/groupReportDTO';
import { GroupStatus } from '@/models/group/enums/group-status.enum';
import { LogType } from '@/models/log/logDTO';

export const useAdminGroups = (filter: AdminGroupQuery) => {
  const { getToken } = useAuth();

  return useQuery<PageResponse<AdminGroupDTO>>({
    queryKey: ['admin-groups', filter],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');

      return getAdminGroups(token, {
        ...filter,
      });
    },
    placeholderData: keepPreviousData,
    staleTime: 10_000,
    gcTime: 120_000,
  });
};

export const useGroupReports = (
  groupId?: string,
  query: Omit<GroupReportQuery, 'groupId'> = {}
) => {
  const { getToken } = useAuth();

  return useInfiniteQuery<CursorPageResponse<GroupReportDTO>>({
    queryKey: ['group-reports', groupId, query],
    enabled: Boolean(groupId),
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');

      return getGroupReports(token, {
        ...query,
        groupId,
        cursor: pageParam as string | undefined,
      });
    },
    getNextPageParam: getStandardNextPageParam,
    placeholderData: keepPreviousData,
    staleTime: 10_000,
    gcTime: 120_000,
  });
};

export const useGroupModeration = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const invalidateGroups = () => queryClient.invalidateQueries({ queryKey: ['admin-groups'] });
  const invalidateLogs = () => queryClient.invalidateQueries({ queryKey: ['admin-audit-logs', LogType.POST_LOG] });

  const banMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return banGroup(token, groupId);
    },
    onSuccess: () => {
      toast.success('Đã hạn chế nhóm thành công');
      invalidateGroups();
      invalidateLogs();
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Không thể hạn chế nhóm');
    },
  });

  const unbanMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return unbanGroup(token, groupId);
    },
    onSuccess: () => {
      toast.success('Đã bỏ hạn chế nhóm');
      invalidateGroups();
      invalidateLogs();
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Không thể bỏ hạn chế nhóm');
    },
  });

  const updateStatusLocally = (groupId: string, status: GroupStatus): boolean => {
    let updated = false;
    queryClient.setQueriesData<PageResponse<AdminGroupDTO>>({ queryKey: ['admin-groups'] }, (old) => {
      if (!old) return old;
      updated = true;
      return {
        ...old,
        data: old.data.map((group) => (group.id === groupId ? { ...group, status } : group)),
      };
    });
    return updated;
  };

  return { banMutation, unbanMutation, updateStatusLocally };
};

export const useIgnoreGroupReports = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const invalidateLogs = () =>
    queryClient.invalidateQueries({
      queryKey: ['admin-audit-logs', LogType.POST_LOG],
    });
  return useMutation({
    mutationFn: async (groupId: string) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return ignoreReportGroup(token, groupId);
    },
    onSuccess: () => {
      toast.success('Đã bỏ qua báo cáo nhóm');
      invalidateLogs();
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Không thể bỏ qua báo cáo nhóm');
    },
  });
};
