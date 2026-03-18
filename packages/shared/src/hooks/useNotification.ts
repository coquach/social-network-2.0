/**
 * Notification-related React Query hooks
 *
 * Platform-agnostic hooks for notifications.
 * Note: Real-time updates via WebSocket should be implemented at the platform level.
 */

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { notificationService } from '../api/services/notification.service';
import type {
  CursorPageResponse,
  QueryParams,
} from '../types/common.types';
import type { NotificationDTO } from '../types/notification.types';
import {
  cancelQueries,
  invalidateQueries,
  removeItemFromInfiniteCache,
} from '../utils/cache-utils';
import { queryConfigs } from '../utils/query-configs';
import { queryKeys } from './query-keys';

// ==================== Query Hooks ====================

/**
 * Get notifications list with infinite scroll
 */
export const useNotifications = (params?: QueryParams) => {
  return useInfiniteQuery<CursorPageResponse<NotificationDTO>>({
    queryKey: queryKeys.notifications.list(),
    queryFn: async ({ pageParam }) => {
      return notificationService.getNotifications({
        ...params,
        cursor: pageParam as string | undefined,
      });
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    ...queryConfigs.realtime,
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
    ...queryConfigs.realtime,
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

/**
 * Get notification preferences
 */
export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: [...queryKeys.notifications.all, 'preferences'],
    queryFn: async () => {
      return notificationService.getPreferences();
    },
    ...queryConfigs.semiStatic,
  });
};

// ==================== Mutation Hooks ====================

/**
 * Mark a notification as read
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (notificationId) => {
      return notificationService.markAsRead(notificationId);
    },
    onSuccess: (_, notificationId) => {
      // Update notification in cache
      queryClient.setQueriesData<{
        pages: CursorPageResponse<NotificationDTO>[];
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
    mutationFn: async () => {
      return notificationService.markAllAsRead();
    },
    onSuccess: () => {
      // Update all notifications in cache
      queryClient.setQueriesData<{
        pages: CursorPageResponse<NotificationDTO>[];
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
    mutationFn: async (notificationId) => {
      return notificationService.deleteNotification(notificationId);
    },
    onMutate: async (notificationId) => {
      // Cancel outgoing queries
      await cancelQueries(queryClient, [[...queryKeys.notifications.list()]]);

      // Optimistically remove from cache
      removeItemFromInfiniteCache<NotificationDTO>(
        queryClient,
        [...queryKeys.notifications.list()] as unknown[],
        (notif) => notif._id === notificationId,
      );
    },
    onSuccess: () => {
      // Invalidate unread count
      invalidateQueries(queryClient, [
        [...queryKeys.notifications.unreadCount()],
      ]);
    },
    onError: () => {
      // Refetch on error to restore state
      invalidateQueries(queryClient, [
        [...queryKeys.notifications.list()],
        [...queryKeys.notifications.unreadCount()],
      ]);
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
