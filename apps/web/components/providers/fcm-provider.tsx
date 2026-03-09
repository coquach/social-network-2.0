/**
 * FCM Provider
 * Handles Firebase Cloud Messaging setup and token registration
 */

'use client';

import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { useNotificationStore } from '@repo/shared';
import { useEffect, useRef } from 'react';
import {
  registerFCMToken,
  setupForegroundMessageListener,
  unregisterFCMToken,
} from '../../lib/fcm-service';

export const FCMProvider = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();
  const hasRegistered = useRef(false);

  useEffect(() => {
    if (!isSignedIn) {
      hasRegistered.current = false;
      return;
    }

    // Register FCM token when user signs in
    if (!hasRegistered.current) {
      registerFCMToken().then((success) => {
        if (success) {
          hasRegistered.current = true;
          console.log('✅ FCM initialized and token registered');
        }
      });
    }

    // Setup foreground message listener
    const unsubscribe = setupForegroundMessageListener((payload) => {
      console.log('🔔 New notification received:', payload);

      // ✅ Try to parse and add notification to store for instant UI update
      try {
        if (payload.data) {
          const notificationData = {
            _id: payload.data.notificationId || `temp-${Date.now()}`,
            userId: payload.data.userId || '',
            type: payload.data.type || 'default',
            message: payload.notification?.body || '',
            status: 'unread' as const,
            createdAt: new Date().toISOString(),
            payload: payload.data,
            isRead: false,
          };

          // Add to store for instant display in dropdown
          addNotification(notificationData as any);
        }
      } catch (error) {
        console.error('Failed to parse notification payload:', error);
      }

      // ✅ Background sync: Fetch full data from server to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ['notifications'],
      });

      // Auto-refetch to get complete notification data and sync with server
      setTimeout(() => {
        queryClient.refetchQueries({
          queryKey: ['notifications'],
          type: 'active',
        });
      }, 500); // Small delay to batch updates
    });

    // Cleanup on unmount or sign out
    return () => {
      if (!isSignedIn && hasRegistered.current) {
        unregisterFCMToken();
        hasRegistered.current = false;
      }
    };
  }, [isSignedIn, queryClient, addNotification]);

  return <>{children}</>;
};
