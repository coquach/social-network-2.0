'use client';

/**
 * Notification Store
 * Platform-agnostic Zustand store for notification state management
 * 
 * Features:
 * - Store notifications list
 * - Track unread count
 * - Mark as read operations
 */

import { create } from 'zustand';
import type { NotificationDTO } from '../types';
import { NotificationStatus } from '../types/enums';

interface NotificationState {
  notifications: NotificationDTO[];
  unreadCount: number;

  // Actions
  setNotifications: (notifications: NotificationDTO[]) => void;
  addNotification: (notification: NotificationDTO) => void;
  markRead: (id: string) => void;
  markReadAll: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) => {
    const unread = notifications.filter((n) => n.status !== NotificationStatus.READ).length;
    set({ notifications, unreadCount: unread });
  },

  addNotification: (notification) => {
    const exists = get().notifications.some((n) => n._id === notification._id);
    if (exists) return;

    const newList = [notification, ...get().notifications];
    const unread = newList.filter((n) => n.status !== NotificationStatus.READ).length;
    set({ notifications: newList, unreadCount: unread });
  },

  markRead: (id) => {
    const newList = get().notifications.map((n) =>
      n._id === id ? { ...n, status: NotificationStatus.READ } : n
    );
    const unread = newList.filter((n) => n.status !== NotificationStatus.READ).length;
    set({ notifications: newList, unreadCount: unread });
  },

  markReadAll: () => {
    const newList = get().notifications.map((n) => ({
      ...n,
      status: NotificationStatus.READ,
    }));
    set({ notifications: newList, unreadCount: 0 });
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));
