/**
 * User Activity Hooks
 * React Query hooks for user activity operations
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import {
  userActivityService,
  type UserActivityLogFilter,
} from '../api/services/user-activity.service';
import type { CursorPageResponse } from '../types/common.types';
import type { UserActivityDto } from '../types/user-activity.types';
import { queryKeys } from './query-keys';

/**
 * Hook to get user activity logs
 */
export const useUserActivity = (filter?: UserActivityLogFilter) => {
  return useInfiniteQuery<CursorPageResponse<UserActivityDto>>({
    queryKey: queryKeys.userActivity.entries(filter),

    queryFn: async ({ pageParam }) =>
      userActivityService.getUserActivityLogs({
        ...filter,
        cursor: pageParam as string | undefined,
      }),

    getNextPageParam: (lastPage) => lastPage.nextCursor,

    initialPageParam: undefined,
  });
};

export const useUserActivityHook = useUserActivity;

export const UseUserActivityHook = useUserActivity;
