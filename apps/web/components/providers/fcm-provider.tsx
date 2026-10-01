/**
 * FCM Provider
 * Handles Firebase Cloud Messaging setup and token registration
 */

'use client';

import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { useNotificationStore, getNotificationRoute } from '@repo/shared';
import { useEffect, useRef } from 'react';
import {
  registerFCMToken,
  setupForegroundMessageListener,
  unregisterFCMToken,
} from '../../lib/fcm-service';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Bell, X } from 'lucide-react';
import Image from 'next/image';

export const FCMProvider = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();
  const hasRegistered = useRef(false);
  const router = useRouter();

  // Helper function to play sound
  const playSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      // Browsers may block autoplay if user hasn't interacted with the page yet
      audio.play().catch((err) => {
        console.warn('Could not play notification sound. User interaction may be required:', err);
      });
    } catch (e) {
      console.error('Error playing sound:', e);
    }
  };

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

      // ✅ Display Custom UI Toast & Play Sound
      if (payload.notification) {
        playSound();
        
        const title = payload.notification.title || 'Thông báo mới';
        const body = payload.notification.body || '';
        const targetUrl = getNotificationRoute(payload.data, 'web');
        const iconUrl = payload.notification.icon || '/logo.svg';

        toast.custom(
          (t) => (
            <div
              className="pointer-events-auto flex w-[350px] max-w-full flex-col gap-2 rounded-2xl bg-white p-4 shadow-xl border border-slate-100 transition-all hover:shadow-2xl hover:border-slate-200 cursor-pointer"
              onClick={() => {
                toast.dismiss(t);
                if (targetUrl) {
                  router.push(targetUrl);
                }
              }}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50 overflow-hidden">
                  {iconUrl ? (
                    <Image
                      src={iconUrl}
                      alt="icon"
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo.svg';
                      }}
                    />
                  ) : (
                    <Bell className="h-5 w-5 text-sky-500" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                    {title}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {body}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.dismiss(t);
                  }}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ),
          { duration: 5000, position: 'bottom-right' }
        );
      }
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
