'use client';

import { useAuth } from '@clerk/nextjs';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  ContentModerationDTO,
  ModerationRecordDetailDTO,
  ModerationAppealResponseDTO,
} from '@/models/moderation/moderationDTO';

import { PageResponse } from '@repo/shared';
import {
  AdminAppealQuery,
  AdminModerationQuery,
  CreateAdminReviewAppealDTO,
  getAdminAppeals,
  getAdminModerationRecordDetail,
  getAdminModerationRecords,
  restoreModeratedContent,
  reviewAppeal,
} from '@/lib/actions/moderations/admin-moderation';

export const useAdminModerationRecords = (filter: AdminModerationQuery) => {
  const { getToken } = useAuth();

  return useQuery<PageResponse<ContentModerationDTO>>({
    queryKey: ['admin-moderation-records', filter],
    queryFn: async () => {
      const token = await getToken();

      if (!token) {
        throw new Error('Token is required');
      }

      return getAdminModerationRecords(token, filter);
    },
    placeholderData: keepPreviousData,
    staleTime: 10_000,
    gcTime: 120_000,
  });
};

export const useAdminAppeals = (filter: AdminAppealQuery) => {
  const { getToken } = useAuth();

  return useQuery<PageResponse<ModerationAppealResponseDTO>>({
    queryKey: ['admin-moderation-appeals', filter],
    queryFn: async () => {
      const token = await getToken();

      if (!token) {
        throw new Error('Token is required');
      }

      return getAdminAppeals(token, filter);
    },
    placeholderData: keepPreviousData,
    staleTime: 10_000,
    gcTime: 120_000,
  });
};

export const useReviewAppeal = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: ['admin-moderation-appeals'],
    });

    queryClient.invalidateQueries({
      queryKey: ['admin-moderation-records'],
    });
  };

  return useMutation({
    mutationFn: async ({
      appealId,
      body,
    }: {
      appealId: string;
      body: CreateAdminReviewAppealDTO;
    }) => {
      const token = await getToken();

      if (!token) {
        throw new Error('Token is required');
      }

      return reviewAppeal(token, appealId, body);
    },

    onSuccess: () => {
      toast.success('Đã xử lý kháng nghị');
      invalidate();
    },

    onError: (error: any) => {
      toast.error(error?.message ?? 'Không thể xử lý kháng nghị');
    },
  });
};

export const useRestoreModeratedContent = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: ['admin-moderation-records'],
    });

    queryClient.invalidateQueries({
      queryKey: ['admin-moderation-appeals'],
    });

    queryClient.invalidateQueries({
      queryKey: ['my-moderation-records'],
    });
  };

  return useMutation({
    mutationFn: async ({
      moderationId,
      status,
    }: {
      moderationId: string;
      status: any;
    }) => {
      const token = await getToken();

      if (!token) {
        throw new Error('Token is required');
      }

      return restoreModeratedContent(token, moderationId, status);
    },

    onSuccess: () => {
      toast.success('Đã khôi phục nội dung');
      invalidate();
    },

    onError: (error: any) => {
      toast.error(error?.message ?? 'Không thể khôi phục nội dung');
    },
  });
};

export const useAdminModerationRecordDetail = (moderationId?: string) => {
  const { getToken } = useAuth();

  return useQuery<ModerationRecordDetailDTO>({
    queryKey: ['admin-moderation-record-detail', moderationId],
    enabled: Boolean(moderationId),
    queryFn: async () => {
      const token = await getToken();

      if (!token || !moderationId) {
        throw new Error('Token is required');
      }

      return getAdminModerationRecordDetail(token, moderationId);
    },
    staleTime: 10_000,
    gcTime: 120_000,
  });
};
