/**
 * Emotion Hooks
 * React Query hooks for emotion operations
 */

import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import {
  AnalysisSummaryDto,
  CreateFeedbackDto,
  DashboardDistributionResponseDto,
  DashboardInsightItemDto,
  DashboardSummaryResponseDto,
  DashboardTrendResponseDto,
  EmotionHistoryItemDto,
  FeedbackResponseDto,
} from '../types/emotion.types';
import {
  EmotionDistributionFilter,
  EmotionHistoryFilter,
  emotionService,
  EmotionTrendFilter,
} from '../api/services/emotion.service';
import { CursorPageResponse, TargetType } from '../types';

/**
 * Hook to get emotion dashboard summary
 */
export const useEmotionDashboardSummary = () => {
  return useQuery<DashboardSummaryResponseDto>({
    queryKey: queryKeys.emotionJournal.analytics({
      type: 'summary',
    }),

    queryFn: async () => {
      try {
        const data = await emotionService.getDashboardSummary();
        return data;
      } catch (error) {
        throw error;
      }
    },
  });
};

/**
 * Hook to get emotion dashboard trend
 */
export const useEmotionDashboardTrend = (filter: EmotionTrendFilter) => {
  return useQuery<DashboardTrendResponseDto>({
    queryKey: queryKeys.emotionJournal.analytics({
      type: 'trend',
      ...filter,
    }),

    queryFn: () => emotionService.getDashboardTrend(filter),
  });
};

/**
 * Hook to get emotion dashboard distribution
 */
export const useEmotionDashboardDistribution = (
  filter: EmotionDistributionFilter,
) => {
  return useQuery<DashboardDistributionResponseDto>({
    queryKey: queryKeys.emotionJournal.analytics({
      type: 'distribution',
      ...filter,
    }),

    queryFn: () => emotionService.getDashboardDistribution(filter),
  });
};

/**
 * Hook to get emotion dashboard insights
 */
export const useEmotionDashboardInsights = () => {
  return useQuery<DashboardInsightItemDto[]>({
    queryKey: queryKeys.emotionJournal.analytics({
      type: 'insights',
    }),

    queryFn: () => emotionService.getDashboardInsights(),
  });
};

/**
 * Hook to get emotion history
 */
export const useEmotionHistory = (filter?: EmotionHistoryFilter) => {
  return useInfiniteQuery<CursorPageResponse<EmotionHistoryItemDto>>({
    queryKey: queryKeys.emotionJournal.entries(filter),

    queryFn: ({ pageParam }) =>
      emotionService.getEmotionHistory({
        ...filter,
        cursor: pageParam as string | undefined,
      }),

    getNextPageParam: (lastPage) => lastPage.nextCursor,

    initialPageParam: undefined,
  });
};

/**
 * Hook to get emotion analysis by target
 */
export const useEmotionAnalysis = (
  targetType: TargetType,
  targetId: string,
) => {
  return useQuery<AnalysisSummaryDto>({
    queryKey: queryKeys.emotionJournal.analysis(targetType, targetId),

    queryFn: () => emotionService.getEmotionAnalysis(targetType, targetId),

    enabled: !!targetType && !!targetId,
  });
};

/**
 * Hook to get feedback by target
 */
export const useEmotionFeedback = (
  targetType: TargetType,
  targetId: string,
) => {
  return useQuery<FeedbackResponseDto[]>({
    queryKey: queryKeys.emotionJournal.feedback(targetType, targetId),

    queryFn: () => emotionService.getFeedbackByTarget(targetType, targetId),

    enabled: !!targetType && !!targetId,
  });
};

/**
 * Hook to submit feedback
 */
export const useSubmitEmotionFeedback = () => {
  return useMutation<FeedbackResponseDto, Error, CreateFeedbackDto>({
    mutationFn: (payload) => emotionService.submitFeedback(payload),
  });
};
