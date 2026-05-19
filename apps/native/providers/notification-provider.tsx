import { useAuth } from '@clerk/expo';
import notifee, { EventType } from 'react-native-notify-kit';
import { notificationService } from '@repo/shared';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import messaging from '@react-native-firebase/messaging';
import { useRouter } from 'expo-router';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';

import {
  registerForPushNotificationsAsync,
  type NativePushRegistration,
} from '../utils/registerForPushNotificationsAsync';
import {
  isChatMessageNotificationData,
  getNotificationRoute,
  type NotificationData,
} from '~/lib/notifications/notification-payload';
import {
  consumePendingChatNavigation,
  extractConversationIdFromInitialNotification,
} from '~/lib/notifications/notifee-chat-events';
import {
  upsertChatThreadNotificationFromData,
  displayRegularNotification,
} from '~/lib/notifications/chat-thread-notifications';

type NotificationContextValue = {
  pushToken: string | null;
  error: Error | null;
};

type NotificationProviderProps = {
  children: ReactNode;
};

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
);

const appId =
  Constants.expoConfig?.android?.package ??
  Constants.expoConfig?.ios?.bundleIdentifier ??
  'com.sentimeta.app';

const normalizeError = (error: unknown) =>
  error instanceof Error ? error : new Error(String(error));

const isBackendCompatibleRegistration = (
  registration: NativePushRegistration | null,
): registration is NativePushRegistration & { pushToken: string } =>
  Boolean(registration && registration.pushToken);

const buildBackendPayload = (registration: NativePushRegistration & { pushToken: string }) => ({
  token: registration.pushToken,
  platform: registration.platform,
  provider: 'fcm' as const,
  appId,
  deviceId: Device.osBuildId ?? undefined,
  deviceName: Device.modelName ?? 'Device',
});

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      'useNotification must be used within a NotificationProvider',
    );
  }

  return context;
}

export const NotificationProvider = ({
  children,
}: NotificationProviderProps) => {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const registeredTokenRef = useRef<string | null>(null);

  // Handle FCM foreground messages
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      const incomingData = remoteMessage.data as NotificationData | undefined;

      if (Platform.OS === 'android') {
        if (isChatMessageNotificationData(incomingData)) {
          void upsertChatThreadNotificationFromData(incomingData).catch((notificationError) => {
            setError(normalizeError(notificationError));
          });
        } else {
          const title = remoteMessage.notification?.title || incomingData?.title;
          const body = remoteMessage.notification?.body || incomingData?.body;
          if (title || body) {
            void displayRegularNotification({
              ...incomingData,
              title,
              body,
              messageId: remoteMessage.messageId,
            }).catch((notificationError) => {
              setError(normalizeError(notificationError));
            });
          }
        }
      }
    });

    return unsubscribe;
  }, []);

  // Handle Notifee display events & taps
  useEffect(() => {
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      if (type !== EventType.PRESS && type !== EventType.ACTION_PRESS) {
        return;
      }

      const data = detail.notification?.data as NotificationData | undefined;
      const targetRoute = getNotificationRoute(data);
      router.push(targetRoute as any);
    });

    const resolveInitialNavigation = async () => {
      try {
        const [initialNotification, pendingNavigation] = await Promise.all([
          notifee.getInitialNotification(),
          consumePendingChatNavigation(),
        ]);

        const initialConversationId =
          await extractConversationIdFromInitialNotification(initialNotification);

        if (initialConversationId) {
          router.push(`/chat/${initialConversationId}`);
          return;
        }

        if (pendingNavigation?.conversationId) {
          router.push(`/chat/${pendingNavigation.conversationId}`);
          return;
        }

        // Also resolve initial navigation for regular notifications if launched via tap
        if (initialNotification?.notification?.data) {
          const data = initialNotification.notification.data as NotificationData | undefined;
          if (data && !isChatMessageNotificationData(data)) {
            const targetRoute = getNotificationRoute(data);
            router.push(targetRoute as any);
          }
        }
      } catch (initialNotificationError) {
        setError(normalizeError(initialNotificationError));
      }
    };

    void resolveInitialNavigation();

    return unsubscribe;
  }, [router]);

  // Sync Token and Auth transitions
  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }

    let isCancelled = false;

    const syncTokens = async () => {
      try {
        const registration = await registerForPushNotificationsAsync();

        if (!registration || isCancelled) {
          return;
        }

        setPushToken(registration.pushToken);
        setError(null);

        if (!isBackendCompatibleRegistration(registration)) {
          return;
        }

        if (registeredTokenRef.current === registration.pushToken) {
          return;
        }

        await notificationService.registerDeviceToken(
          buildBackendPayload(registration),
        );

        registeredTokenRef.current = registration.pushToken;
      } catch (registrationError) {
        if (!isCancelled) {
          setError(normalizeError(registrationError));
        }
      }
    };

    void syncTokens();

    // Listen to token refresh events from Firebase
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (nextToken) => {
      if (!nextToken) {
        return;
      }

      setPushToken(nextToken);

      if (registeredTokenRef.current === nextToken) {
        return;
      }

      void notificationService
        .registerDeviceToken({
          token: nextToken,
          platform: Platform.OS as any,
          provider: 'fcm',
          appId,
          deviceId: Device.osBuildId ?? undefined,
          deviceName: Device.modelName ?? 'Device',
        })
        .then(() => {
          registeredTokenRef.current = nextToken;
          setError(null);
        })
        .catch((registrationError) => {
          setError(normalizeError(registrationError));
        });
    });

    return () => {
      isCancelled = true;
      unsubscribeTokenRefresh();
    };
  }, [isLoaded, isSignedIn]);

  // Handle Sign Out token cleanup
  useEffect(() => {
    if (!isLoaded || isSignedIn || !registeredTokenRef.current) {
      return;
    }

    const tokenToRemove = registeredTokenRef.current;
    registeredTokenRef.current = null;
    setPushToken(null);

    void notificationService.removeDeviceToken(tokenToRemove).catch(() => {
      registeredTokenRef.current = tokenToRemove;
    });
  }, [isLoaded, isSignedIn]);

  const value = useMemo<NotificationContextValue>(
    () => ({
      pushToken,
      error,
    }),
    [error, pushToken],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
