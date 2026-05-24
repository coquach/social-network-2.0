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
  ModerationAppealResponseDTO,
  ModerationRecordDetailDTO,
} from '@/models/moderation/moderationDTO';

import { PageResponse } from '@repo/shared';
import {
  createAppeal,
  CreateAppealRequestDTO,
  getModerationRecordDetail,
  GetMyModerationQuery,
  getMyModerationRecords,
} from '@/lib/actions/moderations/user-moderation';

export const useMyModerationRecords = (filter: GetMyModerationQuery) => {
  const { getToken } = useAuth();

  return useQuery<PageResponse<ContentModerationDTO>>({
    queryKey: ['my-moderation-records', filter],

    queryFn: async () => {
      const token = await getToken();

      if (!token) {
        throw new Error('Token is required');
      }

      return getMyModerationRecords(token, filter);
    },

    placeholderData: keepPreviousData,
    staleTime: 10_000,
    gcTime: 120_000,
  });
};

export const useModerationRecordDetail = (moderationId?: string) => {
  const { getToken } = useAuth();

  return useQuery<ModerationRecordDetailDTO>({
    queryKey: ['moderation-record-detail', moderationId],

    enabled: Boolean(moderationId),

    queryFn: async () => {
      const token = await getToken();

      if (!token || !moderationId) {
        throw new Error('Token is required');
      }

      return getModerationRecordDetail(token, moderationId);
    },

    staleTime: 10_000,
    gcTime: 120_000,
  });
};

export const useCreateAppeal = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: ['my-moderation-records'],
    });

    queryClient.invalidateQueries({
      queryKey: ['admin-moderation-appeals'],
    });
  };

  return useMutation({
    mutationFn: async (
      body: CreateAppealRequestDTO,
    ): Promise<ModerationAppealResponseDTO> => {
      const token = await getToken();

      if (!token) {
        throw new Error('Token is required');
      }

      return createAppeal(token, body);
    },

    onSuccess: () => {
      toast.success('Đã gửi kháng nghị');
      invalidate();
    },

    onError: (error: any) => {
      toast.error(error?.message ?? 'Không thể gửi kháng nghị');
    },
  });
};
