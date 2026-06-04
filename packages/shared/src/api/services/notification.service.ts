/**
 * Notification Service
 * Platform-agnostic notification-related API operations
 */

import { getApiClient } from '../client';
import type {
  NotificationDTO,
  CursorPageResponse,
} from '../../types';

export const notificationService = {
  /**
   * Get notifications (paginated)
   */
  async getNotifications(params?: {
    cursor?: string;
    limit?: number;
    isRead?: boolean;
    type?: string;
  }): Promise<CursorPageResponse<NotificationDTO>> {
    return getApiClient().getCursorPage('/notifications', { params });
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
    return getApiClient().patch('/notifications/read-all');
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

  /**
   * Register device token for push notifications
   */
  async registerDeviceToken(data: {
    token: string;
    platform: 'ios' | 'android' | 'web';
    provider?: 'fcm';
    appId?: string;
    deviceId?: string;
    deviceName?: string;
  }): Promise<void> {
    return getApiClient().post('/notifications/device-tokens', data);
  },

  /**
   * Remove device token
   */
  async removeDeviceToken(token: string): Promise<void> {
    return getApiClient().delete(`/notifications/device-tokens/${token}`);
  },

  /**
   * Get user's registered device tokens
   */
  async getUserDeviceTokens(): Promise<any> {
    return getApiClient().get('/notifications/device-tokens');
  },

  /**
   * Remove all device tokens for current user
   */
  async removeAllDeviceTokens(): Promise<void> {
    return getApiClient().delete('/notifications/device-tokens');
  },
};
