/**
 * @vitest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  useNotifications,
  useUnreadCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from '../useNotification';

// Important: mock the service file directly, not the index barrel file
vi.mock('../../api/services/notification.service', () => {
  return {
    notificationService: {
      getNotifications: vi.fn(),
      getUnreadCount: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      deleteNotification: vi.fn(),
    },
  };
});

import { notificationService } from '../../api/services/notification.service';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

export function createWrapper() {
  const testQueryClient = createTestQueryClient();
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('useNotification hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useNotifications', () => {
    it('should fetch notifications list', async () => {
      const mockResponse = {
        data: [{ _id: '1', content: 'test', isRead: false }],
        nextCursor: null,
        totalCount: 1,
      };

      vi.mocked(notificationService.getNotifications).mockResolvedValue(
        mockResponse as any,
      );

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.pages[0]).toEqual(mockResponse);
      expect(notificationService.getNotifications).toHaveBeenCalledTimes(1);
    });
  });

  describe('useUnreadCount', () => {
    it('should fetch unread count', async () => {
      vi.mocked(notificationService.getUnreadCount).mockResolvedValue({
        count: 5,
      });

      const { result } = renderHook(() => useUnreadCount(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBe(5);
      expect(notificationService.getUnreadCount).toHaveBeenCalledTimes(1);
    });
  });

  describe('useMarkNotificationAsRead', () => {
    it('should call markAsRead API', async () => {
      vi.mocked(notificationService.markAsRead).mockResolvedValue(undefined);

      const { result } = renderHook(() => useMarkNotificationAsRead(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('notif-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(notificationService.markAsRead).toHaveBeenCalledWith('notif-1');
    });
  });

  describe('useMarkAllNotificationsAsRead', () => {
    it('should call markAllAsRead API', async () => {
      vi.mocked(notificationService.markAllAsRead).mockResolvedValue(undefined);

      const { result } = renderHook(() => useMarkAllNotificationsAsRead(), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(notificationService.markAllAsRead).toHaveBeenCalledTimes(1);
    });
  });

  describe('useDeleteNotification', () => {
    it('should call deleteNotification API', async () => {
      vi.mocked(notificationService.deleteNotification).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteNotification(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('notif-2');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(notificationService.deleteNotification).toHaveBeenCalledWith(
        'notif-2',
      );
    });
  });
});
