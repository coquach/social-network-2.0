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
  moderationService,
  GetMyModerationQuery,
  CreateAppealRequestDTO,
} from '@repo/shared';

export const useMyModerationRecords = (filter: GetMyModerationQuery) => {
  return useQuery({
    queryKey: ['my-moderation-records', filter],
    queryFn: () => moderationService.getMyModerationRecords(filter),
    placeholderData: keepPreviousData,
    staleTime: 10_000,
    gcTime: 120_000,
  });
};

export const useModerationRecordDetail = (moderationId?: string) => {
  return useQuery({
    queryKey: ['moderation-record-detail', moderationId],
    enabled: Boolean(moderationId),
    queryFn: () => moderationService.getModerationRecordDetail(moderationId!),
    staleTime: 10_000,
    gcTime: 120_000,
  });
};

export const useCreateAppeal = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['my-moderation-records'] });
    queryClient.invalidateQueries({ queryKey: ['admin-moderation-appeals'] });
  };

  return useMutation({
    mutationFn: (body: CreateAppealRequestDTO) =>
      moderationService.createAppeal(body),

    onSuccess: () => {
      toast.success('Đã gửi kháng nghị');
      invalidate();
    },

    onError: (error: any) => {
      toast.error(error?.message ?? 'Không thể gửi kháng nghị');
    },
  });
};
