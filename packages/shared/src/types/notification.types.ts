/**
 * Notification Types
 * Platform-agnostic notification-related type definitions
 */

import type { NotificationStatus } from './enums';

/**
 * Notification payload - flexible structure for different notification types
 */
export interface NotificationPayload {
  targetType?: string;
  targetId?: string;
  actorId?: string;
  actorName?: string;
  actorAvatar?: string;
  content?: string;
  [key: string]: unknown;
}

/**
 * Notification data transfer object
 */
export interface NotificationDTO {
  _id: string;
  requestId?: string;
  userId: string;
  type: string;
  message?: string;
  payload: NotificationPayload;
  channels?: string[];
  status: NotificationStatus;
  retries?: number;
  sendAt?: string;
  meta?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Grouped notifications (e.g., "John and 5 others liked your post")
 */
export interface GroupedNotificationDTO {
  type: string;
  targetId: string;
  targetType: string;
  count: number;
  actors: Array<{
    id: string;
    name: string;
    avatarUrl?: string;
  }>;
  latestTimestamp: string;
  isRead: boolean;
}

/**
 * Notification preferences/settings
 */
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  likeNotifications: boolean;
  commentNotifications: boolean;
  friendRequestNotifications: boolean;
  messageNotifications: boolean;
}
