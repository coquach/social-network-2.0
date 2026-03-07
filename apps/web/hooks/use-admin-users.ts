'use client';

import {
  banUser,
  createSystemUser,
  getSystemUsers,
  SystemUserFilter,
  unbanUser,
  updateSystemUserRole,
} from '@/lib/actions/admin/admin-users-action';
import { PageResponse } from '@/lib/pagination.dto';
import { LogType } from '@/models/log/logDTO';
import {
  CreateSystemUserDTO,
  SystemRole,
  SystemUserDTO,
} from '@/models/user/systemUserDTO';
import { withAbortOnUnload } from '@/utils/with-abort-unload';
import { useAuth } from '@clerk/nextjs';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

export const useSystemUsers = (filter: SystemUserFilter) => {
  const { getToken } = useAuth();

  return useQuery<PageResponse<SystemUserDTO>>({
    queryKey: ['admin-system-users', filter],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');

      return getSystemUsers(token, filter);
    },
    staleTime: 10_000,
    gcTime: 120_000,
    placeholderData: keepPreviousData,
  });
};

export const useCreateSystemUser = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const invalidateLogs = () =>
    queryClient.invalidateQueries({
      queryKey: ['admin-audit-logs', LogType.USER_LOG],
    });

  return useMutation({
    mutationKey: ['admin-system-users', 'create'],
    mutationFn: async ({ form }: { form: CreateSystemUserDTO }) => {
      return await withAbortOnUnload(async () => {
        const token = await getToken();
        if (!token) throw new Error('Token is required');

        return createSystemUser(token, form);
      });
    },
    onError: (error) => {
      toast.error(
        error?.message || 'Có lỗi xảy ra khi tạo người dùng hệ thống'
      );
    },
    onSuccess: () => {
      toast.success('Tạo tài khoản hệ thống thành công');

      queryClient.invalidateQueries({ queryKey: ['admin-system-users'] });
      invalidateLogs();
    },
  });
};

export const useUpdateUserRole = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const invalidateLogs = () =>
    queryClient.invalidateQueries({
      queryKey: ['admin-audit-logs', LogType.USER_LOG],
    });
  return useMutation({
    mutationKey: ['admin-system-users', 'update-role'],
    mutationFn: async (data: { userId: string; role: SystemRole }) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return updateSystemUserRole(token, data.userId, data.role);
    },
    onError: (error) => {
      toast.error(
        error?.message || 'Có lỗi xảy ra khi cập nhật vai trò người dùng'
      );
    },
    onSuccess: () => {
      toast.success('Cập nhật vai trò người dùng thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-system-users'] });
      invalidateLogs();
    },
  });
};

export const useBanUser = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const invalidateLogs = () =>
    queryClient.invalidateQueries({
      queryKey: ['admin-audit-logs'],
    });
  return useMutation({
    mutationKey: ['admin-system-users', 'ban'],
    mutationFn: async (userIdToBan: string) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return banUser(token, userIdToBan);
    },
    onError: (error) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi khóa người dùng');
    },
    onSuccess: () => {
      toast.success('Khóa tài khoản người dùng thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-system-users'] });
      invalidateLogs();
    },
  });
};

export const useUnbanUser = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const invalidateLogs = () =>
    queryClient.invalidateQueries({
      queryKey: ['admin-audit-logs' ],
    });
  return useMutation({
    mutationKey: ['admin-system-users', 'unban'],
    mutationFn: async (userIdToUnban: string) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return unbanUser(token, userIdToUnban);
    },
    onError: (error) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi mở khóa người dùng');
    },
    onSuccess: () => {
      toast.success('Mở khóa tài khoản người dùng thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-system-users'] });
      invalidateLogs();
    },
  });
};
