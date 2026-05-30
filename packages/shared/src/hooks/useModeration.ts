/**
 * Moderation Hooks
 * React Query hooks for moderation operations
 */

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  moderationService,
  type ModerationService,
} from '../api/services/moderation.service';
import type {
  ContentModerationDTO,
  CreateAppealRequestDTO,
  GetMyModerationQuery,
  ModerationAppealResponseDTO,
  ModerationPageResponseDTO,
  ModerationRecordDetailDTO,
} from '../types/moderation.types';
import { queryKeys } from './query-keys';

/**
 * Hook to get current user's moderation records
 */
export const useModeration = (query?: GetMyModerationQuery) => {
  return useQuery<ModerationPageResponseDTO>({
    queryKey: queryKeys.moderations.me(query),
    queryFn: () => moderationService.getMyModerationRecords(query),
    placeholderData: keepPreviousData,
  });
};

export const useUserModerationHistory = useModeration;

export const useUserModerationHistoryHook = useUserModerationHistory;

export const UseUserModerationHistoryHook = useUserModerationHistory;

/**
 * Hook to get a moderation record detail
 */
export const useModerationRecordDetail = (id: string) => {
  return useQuery<ModerationRecordDetailDTO>({
    queryKey: queryKeys.moderations.detail(id),
    queryFn: () => moderationService.getModerationRecordDetail(id),
    enabled: !!id,
  });
};

/**
 * Hook to create an appeal for a moderation record
 */
export const useCreateModerationAppeal = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ModerationAppealResponseDTO,
    Error,
    CreateAppealRequestDTO
  >({
    mutationFn: (body) => moderationService.createAppeal(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.moderations.all });
    },
  });
};

export const UseModeration = useModeration;

export type { ContentModerationDTO, ModerationService };
