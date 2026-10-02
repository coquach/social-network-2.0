'use client';

import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  createEmergencyHotline,
  createInterventionResource,
  deleteEmergencyHotline,
  deleteInterventionResource,
  getEmergencyHotlines,
  getInterventionResources,
  updateEmergencyHotline,
  updateInterventionResource,
} from '@/lib/actions/admin/admin-intervention';
import {
  CreateEmergencyHotlineDTO,
  CreateInterventionResourceDTO,
  EmergencyHotlineDTO,
  InterventionResourceDTO,
  UpdateEmergencyHotlineDTO,
  UpdateInterventionResourceDTO,
} from '@/models/emotion/adminInterventionDTO';

// --- Query Keys ---
export const adminInterventionKeys = {
  all: ['admin-interventions'] as const,
  hotlines: () => [...adminInterventionKeys.all, 'hotlines'] as const,
  resources: () => [...adminInterventionKeys.all, 'resources'] as const,
};

// ==========================================
// EMERGENCY HOTLINES HOOKS
// ==========================================

export const useAdminHotlines = () => {
  const { getToken } = useAuth();

  return useQuery<EmergencyHotlineDTO[]>({
    queryKey: adminInterventionKeys.hotlines(),
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      return getEmergencyHotlines(token);
    },
    staleTime: 15_000,
    gcTime: 120_000,
  });
};

export const useCreateHotline = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateEmergencyHotlineDTO) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return createEmergencyHotline(token, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminInterventionKeys.hotlines(),
      });
      queryClient.invalidateQueries({
        queryKey: ['emotion-dashboard-overview'],
      });
      toast.success('Đã thêm đường dây nóng thành công');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Không thể thêm đường dây nóng',
      );
    },
  });
};

export const useUpdateHotline = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: UpdateEmergencyHotlineDTO;
    }) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return updateEmergencyHotline(token, id, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminInterventionKeys.hotlines(),
      });
      queryClient.invalidateQueries({
        queryKey: ['emotion-dashboard-overview'],
      });
      toast.success('Đã cập nhật hotline thành công');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Không thể cập nhật hotline',
      );
    },
  });
};

export const useDeleteHotline = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return deleteEmergencyHotline(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminInterventionKeys.hotlines(),
      });
      queryClient.invalidateQueries({
        queryKey: ['emotion-dashboard-overview'],
      });
      toast.success('Đã xóa đường dây nóng');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Không thể xóa đường dây nóng',
      );
    },
  });
};

// ==========================================
// INTERVENTION RESOURCES HOOKS
// ==========================================

export const useAdminResources = () => {
  const { getToken } = useAuth();

  return useQuery<InterventionResourceDTO[]>({
    queryKey: adminInterventionKeys.resources(),
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      return getInterventionResources(token);
    },
    staleTime: 15_000,
    gcTime: 120_000,
  });
};

export const useCreateResource = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateInterventionResourceDTO) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return createInterventionResource(token, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminInterventionKeys.resources(),
      });
      queryClient.invalidateQueries({
        queryKey: ['emotion-dashboard-overview'],
      });
      toast.success('Đã đăng tài nguyên hỗ trợ thành công');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Không thể đăng tài nguyên hỗ trợ',
      );
    },
  });
};

export const useUpdateResource = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: UpdateInterventionResourceDTO;
    }) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return updateInterventionResource(token, id, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminInterventionKeys.resources(),
      });
      queryClient.invalidateQueries({
        queryKey: ['emotion-dashboard-overview'],
      });
      toast.success('Đã cập nhật tài nguyên hỗ trợ thành công');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Không thể cập nhật tài nguyên',
      );
    },
  });
};

export const useDeleteResource = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return deleteInterventionResource(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminInterventionKeys.resources(),
      });
      queryClient.invalidateQueries({
        queryKey: ['emotion-dashboard-overview'],
      });
      toast.success('Đã xóa tài nguyên hỗ trợ');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Không thể xóa tài nguyên hỗ trợ',
      );
    },
  });
};
