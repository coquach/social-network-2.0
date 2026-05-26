'use client';

import { useAuth } from '@clerk/nextjs';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { PageResponse } from '@repo/shared';

import {
  AdminFeedbackQuery,
  AdminRiskUserQuery,
  getEmotionDashboardOverview,
  getFeedbackAccuracySummary,
  getFeedbacks,
  getRiskUsers,
} from '@/lib/actions/admin/admin-emotion';
import {
  DashboardOverviewResponseDTO,
  FeedbackAccuracySummaryDTO,
  FeedbackListItemDTO,
  RiskUserDTO,
} from '@/models/emotion/adminEmotionDTO';

export const useEmotionDashboardOverview = () => {
  const { getToken } = useAuth();

  return useQuery<DashboardOverviewResponseDTO>({
    queryKey: ['emotion-dashboard-overview'],
    queryFn: async () => {
      const token = await getToken();

      if (!token) {
        throw new Error('Token is required');
      }

      return getEmotionDashboardOverview(token);
    },
    staleTime: 10_000,
    gcTime: 120_000,
  });
};

export const useAdminRiskUsers = (filter: AdminRiskUserQuery) => {
  const { getToken } = useAuth();

  return useQuery<PageResponse<RiskUserDTO>>({
    queryKey: ['admin-emotion-risk-users', filter],
    queryFn: async () => {
      const token = await getToken();

      if (!token) {
        throw new Error('Token is required');
      }

      return getRiskUsers(token, filter);
    },
    placeholderData: keepPreviousData,
    staleTime: 10_000,
    gcTime: 120_000,
  });
};

export const useAdminFeedbacks = (filter: AdminFeedbackQuery) => {
  const { getToken } = useAuth();

  return useQuery<PageResponse<FeedbackListItemDTO>>({
    queryKey: ['admin-emotion-feedbacks', filter],
    queryFn: async () => {
      const token = await getToken();

      if (!token) {
        throw new Error('Token is required');
      }

      return getFeedbacks(token, filter);
    },
    placeholderData: keepPreviousData,
    staleTime: 10_000,
    gcTime: 120_000,
  });
};

export const useFeedbackAccuracySummary = () => {
  const { getToken } = useAuth();

  return useQuery<FeedbackAccuracySummaryDTO>({
    queryKey: ['emotion-feedback-accuracy-summary'],
    queryFn: async () => {
      const token = await getToken();

      if (!token) {
        throw new Error('Token is required');
      }

      return getFeedbackAccuracySummary(token);
    },
    staleTime: 10_000,
    gcTime: 120_000,
  });
};
