'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

import { getAuditLogs, AuditLogQuery } from '@/lib/actions/admin/admin-log-action';
import { CursorPageResponse, getStandardNextPageParam } from '@repo/shared';
import { AuditLogResponseDTO } from '@/models/log/logDTO';

export const useAdminAuditLogs = (filter: AuditLogQuery) => {
  const { getToken } = useAuth();

  return useInfiniteQuery<CursorPageResponse<AuditLogResponseDTO>>({
    queryKey: ['admin-audit-logs', filter.logType],
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');

      return getAuditLogs(token, { ...filter, cursor: pageParam } as AuditLogQuery);
    },
    getNextPageParam: getStandardNextPageParam,
  });
};
