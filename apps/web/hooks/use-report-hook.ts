'use client';

import { useAuth } from '@clerk/nextjs';
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  createReport,
  getReports,
  ignoreReport,
  ReportFilterDTO,
  resolveReportTarget,
} from '@/lib/actions/admin/report-action';
import {
  CreateReportForm,
  ReportDTO,
  ReportStatus,
} from '@/models/report/reportDTO';
import { TargetType } from '@/models/social/enums/social.enum';
import { CursorPageResponse, getStandardNextPageParam } from '@repo/shared';
import { LogType } from '@/models/log/logDTO';

export const useCreateReport = () => {
  const { getToken } = useAuth();
  return useMutation({
    mutationKey: ['create-report'],
    mutationFn: async (data: CreateReportForm) => {
      const token = await getToken();
      if (!token) throw new Error('Unauthorized');
      return await createReport(token, data);
    },
    onSuccess: () => {
      toast.success('Tạo báo cáo thành công');
    },
    onError: (error) => {
      toast.error(error?.message || 'Đã có lỗi xảy ra khi tạo báo cáo');
    },
  });
};

export const useReportsByTarget = (
  targetId?: string,
  targetType?: TargetType,
  status?: ReportStatus | 'all'
) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const invalidateLogs = () =>
    queryClient.invalidateQueries({
      queryKey: ['admin-audit-logs', LogType.POST_LOG],
    });

  const queryKey = ['admin-reports', targetId, targetType, status ?? 'all'];

  const reportsQuery = useInfiniteQuery<CursorPageResponse<ReportDTO>>({
    queryKey,
    enabled: Boolean(targetId && targetType),
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');

      const filter: ReportFilterDTO = {
        targetId,
        targetType,
        cursor: pageParam as string | undefined,
        limit: 5,
        status: status && status !== 'all' ? status : undefined,
      };

      return getReports(token, filter);
    },
    getNextPageParam: getStandardNextPageParam,
  });

  const resolveTargetMutation = useMutation({
    mutationFn: async () => {
      if (!targetId || !targetType) throw new Error('Target is required');

      const token = await getToken();
      if (!token) throw new Error('Token is required');

      return resolveReportTarget(token, targetId, targetType);
    },
    onSuccess: () => {
      invalidateLogs();
      queryClient.setQueryData<InfiniteData<CursorPageResponse<ReportDTO>>>(
        queryKey,
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data
                .map((report) => ({
                  ...report,
                  status: ReportStatus.RESOLVED,
                }))
                .filter((report) =>
                  status && status !== 'all' ? report.status === status : true
                ),
            })),
            pageParams: old.pageParams,
          };
        }
      );
      toast.success('Ẩn báo cáo thành công');
    },
    onError: (error) => {
      toast.error(error?.message || 'Đã có lỗi xảy ra khi xử lý báo cáo');
    },
  });

  const ignoreReportMutation = useMutation({
    mutationFn: async () => {
      if (!targetId || !targetType) throw new Error('Target is required');
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return ignoreReport(token, targetId, targetType);
    },
    onSuccess: () => {
      invalidateLogs();
      queryClient.setQueryData<InfiniteData<CursorPageResponse<ReportDTO>>>(
        queryKey,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data
                .map((report) => ({
                  ...report,
                  status: ReportStatus.REJECTED,
                }))
                .filter((report) =>
                  status && status !== 'all' ? report.status === status : true
                ),
            })),
            pageParams: old.pageParams,
          };
        }
      );
      toast.success('Bỏ qua báo cáo thành công');
    },
    onError: (error) => {
      toast.error(error?.message || 'Đã có lỗi xảy ra khi bỏ qua báo cáo');
    },
  });

  return {
    ...reportsQuery,
    resolveTargetMutation,
    ignoreReportMutation,
  };
};
