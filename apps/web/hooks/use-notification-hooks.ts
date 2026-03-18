'use client';

import { getNotifications } from '@/lib/actions/notification/notification-action';
import { CursorPageResponse, CursorPagination, getStandardNextPageParam } from '@repo/shared';
import { queryKeys } from '@/lib/query-keys';
import { NotificationDTO } from '@/models/notification/notificationDTO';
import { useNotificationStore } from '@repo/shared';
import { useAuth } from '@clerk/nextjs';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useNotifications(userId: string) {
  const {getToken} = useAuth();
  const {
    notifications,
    setNotifications,
    markRead,
    markReadAll,
    unreadCount,
  } = useNotificationStore();

  // ==================== Fetch via React Query ====================
  // Auto-refetch every 30 seconds to sync with push notifications
  const { data, isLoading, fetchNextPage, hasNextPage, refetch } =
    useInfiniteQuery<CursorPageResponse<NotificationDTO>>({
      queryKey: queryKeys.notifications.list(userId),
      queryFn: async ({ pageParam }) => {
        const token = await getToken();
        if (!token) throw new Error('Token is required');
        return await getNotifications(token, {
          cursor: pageParam,
          limit: 10,
        } as CursorPagination);
      },
      getNextPageParam: getStandardNextPageParam,
      initialPageParam: undefined,
      staleTime: 30_000, // Consider data stale after 30s
      refetchInterval: 30_000, // Auto-refetch every 30s when tab is active
      refetchOnWindowFocus: true, // Refetch when user returns to tab
      refetchIntervalInBackground: false, // Don't poll when tab is inactive
    });

  // ==================== Sync query data vào Zustand ====================
  useEffect(() => {
    if (!data) return;
    const merged = data.pages.flatMap((p) => p.data || []);
    setNotifications(merged);
  }, [data, setNotifications]);

  // ==================== Action gửi về server ====================
  // These actions will sync via API calls
  const handleMarkRead = async (id: string) => {
    markRead(id);
    // API call handled by React Query mutation in the component
  };

  const handleMarkReadAll = async () => {
    markReadAll();
    // API call handled by React Query mutation in the component
  };

  return {
    notifications,
    isLoading,
    fetchNextPage,
    hasNextPage,
    markRead: handleMarkRead,
    markReadAll: handleMarkReadAll,
    unreadCount,
  };
}
