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
import { NotificationStatus } from '../types/enums';
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
export const useNotifications = (params?: QueryParams & { type?: string; isRead?: boolean }) => {
  return useInfiniteQuery<CursorPageResponse<NotificationDTO>>({
    queryKey: [...queryKeys.notifications.list(), params],
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
 * Update notification preferences
 */
export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, any>({
    mutationFn: async (data) => {
      return notificationService.updatePreferences(data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData([...queryKeys.notifications.all, 'preferences'], data);
    },
  });
};

/**
 * Mark a notification as read
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (notificationId) => {
      return notificationService.markAsRead(notificationId);
    },
    onMutate: async (notificationId) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.list() });
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.unreadCount() });

      // Optimistically update notification in cache
      queryClient.setQueriesData<{
        pages: CursorPageResponse<NotificationDTO>[];
      }>({ queryKey: queryKeys.notifications.list() }, (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((notif) =>
              notif._id === notificationId ? { ...notif, isRead: true, status: NotificationStatus.READ } : notif,
            ),
          })),
        };
      });

      // Optimistically decrement unread count
      queryClient.setQueryData<number>(
        queryKeys.notifications.unreadCount(),
        (old) => (old ? Math.max(0, old - 1) : 0),
      );
    },
    onError: () => {
      // Invalidate on error to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    },
    onSettled: () => {
      // Background refetch to ensure sync
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
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
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.list() });
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.unreadCount() });

      // Optimistically update all notifications in cache
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
              status: NotificationStatus.READ
            })),
          })),
        };
      });

      // Optimistically reset unread count to 0
      queryClient.setQueryData<number>(
        queryKeys.notifications.unreadCount(),
        0,
      );
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
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
