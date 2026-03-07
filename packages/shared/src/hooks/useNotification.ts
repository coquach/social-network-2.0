/**
 * Notification-related React Query hooks
 *
 * Platform-agnostic hooks for notifications.
 * Note: Real-time updates via WebSocket should be implemented at the platform level.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { notificationService } from '../api/services/notification.service';
import { queryKeys } from './query-keys';
import type { NotificationDTO } from '../types/notification.types';
import type {
  CursorPaginatedResponse,
  QueryParams,
} from '../types/common.types';

// ==================== Query Hooks ====================

/**
 * Get notifications list with infinite scroll
 */
export const useNotifications = (params?: QueryParams) => {
  return useInfiniteQuery<CursorPaginatedResponse<NotificationDTO>>({
    queryKey: queryKeys.notifications.list(),
    queryFn: ({ pageParam }) =>
      notificationService.getNotifications({
        ...params,
        cursor: pageParam as string | undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    staleTime: 100_000, // 100 seconds
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Get unread notification count
 */
export const useUnreadCount = () => {
  return useQuery<number>({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      const result = await notificationService.getUnreadCount();
      return result.count;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

/**
 * Get notification preferences
 */
export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: [...queryKeys.notifications.all, 'preferences'],
    queryFn: () => notificationService.getPreferences(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,
  });
};

// ==================== Mutation Hooks ====================

/**
 * Mark a notification as read
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (notificationId) =>
      notificationService.markAsRead(notificationId),
    onSuccess: (_, notificationId) => {
      // Update notification in cache
      queryClient.setQueriesData<{
        pages: CursorPaginatedResponse<NotificationDTO>[];
      }>({ queryKey: queryKeys.notifications.list() }, (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((notif) =>
              notif._id === notificationId ? { ...notif, isRead: true } : notif,
            ),
          })),
        };
      });

      // Decrement unread count
      queryClient.setQueryData<number>(
        queryKeys.notifications.unreadCount(),
        (old) => (old ? Math.max(0, old - 1) : 0),
      );
    },
  });
};

/**
 * Mark all notifications as read
 */
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      // Update all notifications in cache
      queryClient.setQueriesData<{
        pages: CursorPaginatedResponse<NotificationDTO>[];
      }>({ queryKey: queryKeys.notifications.list() }, (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((notif) => ({
              ...notif,
              isRead: true,
            })),
          })),
        };
      });

      // Reset unread count to 0
      queryClient.setQueryData<number>(
        queryKeys.notifications.unreadCount(),
        0,
      );
    },
  });
};

/**
 * Delete a notification
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (notificationId) =>
      notificationService.deleteNotification(notificationId),
    onSuccess: (_, notificationId) => {
      // Remove notification from cache
      queryClient.setQueriesData<{
        pages: CursorPaginatedResponse<NotificationDTO>[];
      }>({ queryKey: queryKeys.notifications.list() }, (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.filter((notif) => notif._id !== notificationId),
          })),
        };
      });

      // Invalidate unread count
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unreadCount(),
      });
    },
  });
};

/**
 * Helper hook to refetch notifications
 * Useful for manual refresh or after reconnection
 */
export const useRefetchNotifications = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  };
};
