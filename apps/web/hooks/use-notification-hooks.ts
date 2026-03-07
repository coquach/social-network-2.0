'use client';

import { useSocket } from '@/components/providers/socket-provider';
import { getNotifications } from '@/lib/actions/notification/notification-action';
import { CursorPageResponse, getStandardNextPageParam } from '@repo/shared';
import { Pagination } from '@/lib/pagination.dto';
import { queryKeys } from '@/lib/query-keys';
import { NotificationDTO } from '@/models/notification/notificationDTO';
import { useNotificationStore } from '@repo/shared';
import { useAuth } from '@clerk/nextjs';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useNotifications(userId: string) {
  const {getToken} = useAuth();
  const { notificationSocket} = useSocket();
  const {
    notifications,
    setNotifications,
    addNotification,
    markRead,
    markReadAll,
    unreadCount,
  } = useNotificationStore();

  // ==================== Fetch via React Query ====================
  const { data, isLoading, fetchNextPage, hasNextPage, refetch } =
    useInfiniteQuery<CursorPageResponse<NotificationDTO>>({
      queryKey: queryKeys.notifications.list(userId),
      queryFn: async ({ pageParam }) => {
        const token = await getToken();
        if (!token) throw new Error('Token is required');
        return await getNotifications(token, {
          cursor: pageParam,
          limit: 10,
        } as Pagination);
      },
      getNextPageParam: getStandardNextPageParam,
      initialPageParam: undefined,
      staleTime: 100_000,
      refetchOnWindowFocus: true,
    });

  // ==================== Sync query data vào Zustand ====================
  useEffect(() => {
    if (!data) return;
    const merged = data.pages.flatMap((p) => p.data || []);
    setNotifications(merged);
  }, [data, setNotifications]);

  // ==================== Socket realtime ====================
  useEffect(() => {
    if (!userId || !notificationSocket) return;
      // Khi có notification mới
      notificationSocket.on('notification', (notif: NotificationDTO) => {
        addNotification(notif);
        refetch();
      });

      // Khi server báo mark read / mark all
      notificationSocket.on('mark_read', (id: string) => markRead(id));
      notificationSocket.on('mark_read_all', () => markReadAll());

      return () => {
        notificationSocket.off('notification');
        notificationSocket.off('mark_read');
        notificationSocket.off('mark_read_all');
      };
    
  }, [userId, addNotification, markRead, markReadAll, refetch, notificationSocket]);

  // ==================== Action gửi về server ====================
  const handleMarkRead = async (id: string) => {
    markRead(id);
    notificationSocket?.emit('mark_read', id);
  };

  const handleMarkReadAll = async () => {
    markReadAll();
    notificationSocket?.emit('mark_read_all', userId);
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
