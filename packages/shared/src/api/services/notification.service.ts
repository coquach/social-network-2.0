/**
 * Notification Service
 * Platform-agnostic notification-related API operations
 */

import { getApiClient } from '../client';
import type {
  NotificationDTO,
  CursorPaginatedResponse,
} from '../../types';

export const notificationService = {
  /**
   * Get notifications (paginated)
   */
  async getNotifications(params?: {
    cursor?: string;
    limit?: number;
    status?: 'read' | 'unread';
  }): Promise<CursorPaginatedResponse<NotificationDTO>> {
    return getApiClient().get('/notifications', { params });
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<{ count: number }> {
    return getApiClient().get('/notifications/unread-count');
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    return getApiClient().patch(`/notifications/${notificationId}/read`);
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    return getApiClient().post('/notifications/mark-all-read');
  },

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    return getApiClient().delete(`/notifications/${notificationId}`);
  },

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<any> {
    return getApiClient().get('/notifications/preferences');
  },

  /**
   * Update notification preferences
   */
  async updatePreferences(data: any): Promise<any> {
    return getApiClient().patch('/notifications/preferences', data);
  },
};
