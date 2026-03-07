'use client';

import { useAuth } from '@clerk/nextjs';
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';

import {
  EmotionHistoryFilter,
  EmotionQuery,
  getEmotionByHour,
  getEmotionDailyTrend,
  getEmotionDetail,
  getEmotionHistory,
  getEmotionSummary,
} from '@/lib/actions/emotion/emotion-action';
import {
  EmotionAnalysisDTO,
  EmotionByHourDTO,
  EmotionDailyTrendDTO,
  EmotionHistoryResponse,
  EmotionSummaryDTO,
} from '@/models/emotion/emotionDTO';

const normalizeDate = (value?: string | Date) => {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  return value.toISOString().slice(0, 10);
};

const normalizeQuery = <T extends EmotionQuery | EmotionHistoryFilter>(
  query?: T
) => {
  if (!query) return query;
  return {
    ...query,
    fromDate: normalizeDate(query.fromDate),
    toDate: normalizeDate(query.toDate),
  };
};

const serializeQuery = (query?: EmotionQuery | EmotionHistoryFilter) => {
  if (!query) return 'default';
  const preset = query.preset ?? 'none';
  const from = normalizeDate(query.fromDate) ?? 'none';
  const to = normalizeDate(query.toDate) ?? 'none';
  return `${preset}|${from}|${to}`;
};

export const useEmotionSummary = (query: EmotionQuery) => {
  const { getToken } = useAuth();
  const normalized = normalizeQuery(query);

  return useQuery<EmotionSummaryDTO>({
    queryKey: ['emotion-summary', serializeQuery(normalized)],
    enabled: Boolean(query?.preset),
    placeholderData: keepPreviousData,
    staleTime: 10_000,
    gcTime: 60_000,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return getEmotionSummary(token, normalized);
    },
  });
};

export const useEmotionTrend = (query: EmotionQuery) => {
  const { getToken } = useAuth();
  const normalized = normalizeQuery(query);

  return useQuery<EmotionDailyTrendDTO[]>({
    queryKey: ['emotion-trend', serializeQuery(normalized)],
    enabled: Boolean(query?.preset),
    placeholderData: keepPreviousData,
    staleTime: 10_000,
    gcTime: 60_000,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return getEmotionDailyTrend(token, normalized);
    },
  });
};

export const useEmotionByHour = () => {
  const { getToken } = useAuth();

  return useQuery<EmotionByHourDTO[]>({
    queryKey: ['emotion-by-hour'],
    staleTime: 10_000,
    gcTime: 60_000,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return getEmotionByHour(token);
    },
  });
};

export const useEmotionHistory = (filter: EmotionHistoryFilter) => {
  const { getToken } = useAuth();
  const normalized = normalizeQuery(filter);

  const query = useInfiniteQuery<EmotionHistoryResponse>({
    queryKey: ['emotion-history', serializeQuery(normalized)],
    initialPageParam: undefined as string | undefined,
    placeholderData: keepPreviousData,
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');

      return getEmotionHistory(token, {
        ...normalized,
        cursor: pageParam as string | undefined,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.meta?.hasNextPage ? lastPage.meta?.nextCursor : undefined,
    staleTime: 10_000,
    gcTime: 120_000,
  });

  const entries =
    query.data?.pages.flatMap((page) => page.data || []) || [];

  return {
    ...query,
    entries,
  };
};

export const useEmotionDetail = (analysisId?: string) => {
  const { getToken } = useAuth();

  return useQuery<EmotionAnalysisDTO>({
    queryKey: ['emotion-detail', analysisId],
    enabled: Boolean(analysisId),
    staleTime: 10_000,
    gcTime: 60_000,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return getEmotionDetail(token, analysisId as string);
    },
  });
};
