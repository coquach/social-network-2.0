import { useAuth } from '@clerk/expo';
import notifee, { EventType } from '@notifee/react-native';
import { notificationService } from '@repo/shared';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
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
  getConversationId,
  isChatMessageNotificationData,
  type NotificationData,
} from '~/lib/notifications/notification-payload';
import {
  consumePendingChatNavigation,
  extractConversationIdFromInitialNotification,
} from '~/lib/notifications/notifee-chat-events';
import { upsertChatThreadNotificationFromData } from '~/lib/notifications/chat-thread-notifications';

type NotificationContextValue = {
  pushToken: string | null;
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
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

const routeFromNotificationData = (
  router: ReturnType<typeof useRouter>,
  data: NotificationData | undefined,
) => {
  const conversationId = getConversationId(data);

  if (isChatMessageNotificationData(data)) {
    if (conversationId) {
      router.push(`/chat/${conversationId}`);
      return;
    }
  }

  router.push('/notifications');
};

const isBackendCompatibleRegistration = (
  registration: NativePushRegistration | null,
): registration is NativePushRegistration & { pushToken: string } =>
  Boolean(
    registration &&
      registration.platform === 'android' &&
      registration.pushToken,
  );

const buildBackendPayload = (registration: NativePushRegistration & { pushToken: string }) => ({
  token: registration.pushToken,
  platform: registration.platform,
  provider: 'fcm' as const,
  appId,
  deviceId: Device.osBuildId ?? undefined,
  deviceName: Device.modelName ?? 'Android device',
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
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const registeredTokenRef = useRef<string | null>(null);
  const handledResponseRef = useRef<string | null>(null);

  useEffect(() => {
    const handleNotificationResponse = (
      response: Notifications.NotificationResponse | null | undefined,
    ) => {
      const request = response?.notification?.request;

      if (!request) {
        return;
      }

      const responseId =
        request.identifier ?? JSON.stringify(request.content.data ?? {});
      const responseData = request.content.data as NotificationData | undefined;

      if (handledResponseRef.current === responseId) {
        return;
      }

      handledResponseRef.current = responseId;

      if (Platform.OS === 'android' && isChatMessageNotificationData(responseData)) {
        return;
      }

      routeFromNotificationData(router, responseData);
    };

    const notificationListener = Notifications.addNotificationReceivedListener(
      (incomingNotification) => {
        const incomingData = incomingNotification.request.content.data as
          | NotificationData
          | undefined;

        if (Platform.OS === 'android' && isChatMessageNotificationData(incomingData)) {
          void upsertChatThreadNotificationFromData(incomingData).catch((notificationError) => {
            setError(normalizeError(notificationError));
          });
          return;
        }

        setNotification(incomingNotification);
      },
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse,
      );

    try {
      handleNotificationResponse(Notifications.getLastNotificationResponse());
    } catch (responseError) {
      setError(normalizeError(responseError));
    }

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [router]);

  useEffect(() => {
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      if (type !== EventType.PRESS && type !== EventType.ACTION_PRESS) {
        return;
      }

      const data = detail.notification?.data as NotificationData | undefined;

      if (!isChatMessageNotificationData(data)) {
        return;
      }

      const conversationId = getConversationId(data);
      if (conversationId) {
        router.push(`/chat/${conversationId}`);
      }
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
        }
      } catch (initialNotificationError) {
        setError(normalizeError(initialNotificationError));
      }
    };

    void resolveInitialNavigation();

    return unsubscribe;
  }, [router]);

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
        setExpoPushToken(registration.expoPushToken);
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

    const tokenListener = Notifications.addPushTokenListener((nextToken) => {
      if (!nextToken?.data || Platform.OS !== 'android') {
        return;
      }

      const nextPushToken = nextToken.data;
      setPushToken(nextPushToken);

      if (registeredTokenRef.current === nextPushToken) {
        return;
      }

      void notificationService
        .registerDeviceToken({
          token: nextPushToken,
          platform: 'android',
          provider: 'fcm',
          appId,
          deviceId: Device.osBuildId ?? undefined,
          deviceName: Device.modelName ?? 'Android device',
        })
        .then(() => {
          registeredTokenRef.current = nextPushToken;
          setError(null);
        })
        .catch((registrationError) => {
          setError(normalizeError(registrationError));
        });
    });

    return () => {
      isCancelled = true;
      tokenListener.remove();
    };
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (!isLoaded || isSignedIn || !registeredTokenRef.current) {
      return;
    }

    const tokenToRemove = registeredTokenRef.current;
    registeredTokenRef.current = null;
    setPushToken(null);
    setExpoPushToken(null);

    void notificationService.removeDeviceToken(tokenToRemove).catch(() => {
      registeredTokenRef.current = tokenToRemove;
    });
  }, [isLoaded, isSignedIn]);

  const value = useMemo<NotificationContextValue>(
    () => ({
      pushToken,
      expoPushToken,
      notification,
      error,
    }),
    [error, expoPushToken, notification, pushToken],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
