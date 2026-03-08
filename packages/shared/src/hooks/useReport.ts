/**
 * Report-related React Query hooks
 *
 * Platform-agnostic hooks for reporting content.
 * These hooks use the appropriate service and provide type-safe queries and mutations.
 */

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  CursorPaginatedResponse,
  QueryParams,
} from '../types/common.types';
import type { TargetType } from '../types/enums';
import { queryKeys } from './query-keys';

// ==================== Types ====================

export interface ReportDTO {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: TargetType;
  reason: string;
  status: ReportStatusEnum;
  createdAt: string;
  updatedAt: string;
}

export enum ReportStatusEnum {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

export interface CreateReportInput {
  targetId: string;
  targetType: TargetType;
  reason: string;
  description?: string;
}

export interface ReportFilterParams extends QueryParams {
  targetId?: string;
  targetType?: TargetType;
  status?: ReportStatusEnum;
}

// Note: These functions would need to be implemented in a report service
// For now, we'll create placeholder types that platforms can implement
interface ReportService {
  createReport: (input: CreateReportInput) => Promise<ReportDTO>;
  getReports: (
    params: ReportFilterParams,
  ) => Promise<CursorPaginatedResponse<ReportDTO>>;
  resolveReport: (targetId: string, targetType: TargetType) => Promise<void>;
  ignoreReport: (reportId: string) => Promise<void>;
}

// This would be imported from services, but for now we'll create a placeholder
const reportService: ReportService = {
  createReport: async () => {
    throw new Error('Not implemented');
  },
  getReports: async () => {
    throw new Error('Not implemented');
  },
  resolveReport: async () => {
    throw new Error('Not implemented');
  },
  ignoreReport: async () => {
    throw new Error('Not implemented');
  },
};

// ==================== Mutation Hooks ====================

/**
 * Create a new report
 */
export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation<ReportDTO, Error, CreateReportInput>({
    mutationFn: async (input) => {
      return reportService.createReport(input);
    },
    onSuccess: () => {
      // Invalidate reports list
      queryClient.invalidateQueries({ queryKey: queryKeys.reports?.all });
    },
  });
};

// ==================== Query Hooks ====================

/**
 * Get reports with filtering (admin/moderator)
 */
export const useReports = (params?: ReportFilterParams) => {
  return useInfiniteQuery<CursorPaginatedResponse<ReportDTO>>({
    queryKey: [
      'reports',
      params?.targetId,
      params?.targetType,
      params?.status ?? 'all',
    ],
    queryFn: async ({ pageParam }) => {
      return reportService.getReports({
        ...params,
        cursor: pageParam as string | undefined,
      });
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    enabled: !!(params?.targetId && params?.targetType),
  });
};

/**
 * Resolve a report (admin/moderator action)
 */
export const useResolveReport = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { targetId: string; targetType: TargetType }>(
    {
      mutationFn: async ({ targetId, targetType }) => {
        return reportService.resolveReport(targetId, targetType);
      },
      onSuccess: () => {
        // Invalidate reports
        queryClient.invalidateQueries({ queryKey: ['reports'] });
      },
    },
  );
};

/**
 * Ignore a report (admin/moderator action)
 */
export const useIgnoreReport = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (reportId) => {
      return reportService.ignoreReport(reportId);
    },
    onSuccess: () => {
      // Invalidate reports
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};
