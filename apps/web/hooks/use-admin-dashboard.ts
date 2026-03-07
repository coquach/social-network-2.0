'use client';

import {
  DashboardQueryDTO,
  EmotionDashboardDTO,
  getContentChart,
  getDashboard,
  getEmotionDashboard,
  getReportChart,
} from '@/lib/actions/admin/dashboard-action';
import { useAuth } from '@clerk/nextjs';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

type DateRangeQuery = DashboardQueryDTO & { from: Date; to: Date };

const serializeRange = (query?: DashboardQueryDTO) => {
  if (!query) return 'none';
  const from = query.from ? new Date(query.from).toISOString().slice(0, 10) : 'none';
  const to = query.to ? new Date(query.to).toISOString().slice(0, 10) : 'none';
  return `${from}|${to}`;
};

export const useDashboardSummary = (query?: DateRangeQuery) => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['admin-dashboard-summary', serializeRange(query)],
    enabled: Boolean(query?.from && query?.to),
    staleTime: 10_000,
    gcTime: 60_000,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');

      return getDashboard(token, query!);
    },
  });
};

export const useContentChart = (query?: DateRangeQuery) => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['admin-dashboard-content-chart', serializeRange(query)],
    enabled: Boolean(query?.from && query?.to),
    staleTime: 10_000,
    gcTime: 60_000,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');

      return getContentChart(token, query!);
    },
  });
};

export const useReportChart = (query?: DateRangeQuery) => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['admin-dashboard-report-chart', serializeRange(query)],
    enabled: Boolean(query?.from && query?.to),
    staleTime: 10_000,
    gcTime: 60_000,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');

      return getReportChart(token, query!);
    },
  });
};

export const useEmotionChart = (query?: DateRangeQuery) => {
  const { getToken } = useAuth();

  return useQuery<EmotionDashboardDTO[]>({
    queryKey: ['admin-dashboard-emotion-chart', serializeRange(query)],
    enabled: Boolean(query?.from && query?.to),
    staleTime: 10_000,
    gcTime: 60_000,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');

      return getEmotionDashboard(token, query!);
    },
  });
};
