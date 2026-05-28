/**
 * Device Token Hooks
 * Hooks for managing FCM device tokens
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../api/services/notification.service';
import { queryKeys } from './query-keys';

/**
 * Register device token for push notifications
 */
export const useRegisterDeviceToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      token: string;
      platform: 'ios' | 'android' | 'web';
      provider?: 'fcm';
      appId?: string;
      deviceId?: string;
      deviceName?: string;
    }) => {
      return notificationService.registerDeviceToken(data);
    },
    onSuccess: () => {
      // Invalidate device tokens list
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.notifications.all, 'device-tokens'],
      });
    },
  });
};

/**
 * Remove device token
 */
export const useRemoveDeviceToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      return notificationService.removeDeviceToken(token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.notifications.all, 'device-tokens'],
      });
    },
  });
};

/**
 * Get user's registered device tokens
 */
export const useDeviceTokens = () => {
  return useQuery({
    queryKey: [...queryKeys.notifications.all, 'device-tokens'],
    queryFn: async () => {
      return notificationService.getUserDeviceTokens();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Remove all device tokens
 */
export const useRemoveAllDeviceTokens = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return notificationService.removeAllDeviceTokens();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.notifications.all, 'device-tokens'],
      });
    },
  });
};
