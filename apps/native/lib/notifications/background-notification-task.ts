import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import {
  isChatMessageNotificationData,
  type NotificationData,
} from './notification-payload';
import {
  upsertChatThreadNotificationFromData,
  displayRegularNotification,
} from './chat-thread-notifications';

export const LAST_BACKGROUND_NOTIFICATION_KEY =
  '@sentimeta:last-background-notification';

const isNativePlatform = Platform.OS === 'android' || Platform.OS === 'ios';

if (isNativePlatform) {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('[notifications] Message handled in the background!', remoteMessage);
    try {
      const notificationData = remoteMessage.data as NotificationData | undefined;
      const kind = isChatMessageNotificationData(notificationData)
        ? 'chat'
        : 'regular';

      if (kind === 'chat') {
        await upsertChatThreadNotificationFromData(notificationData);
      } else {
        const title = remoteMessage.notification?.title || notificationData?.title;
        const body = remoteMessage.notification?.body || notificationData?.body;
        if (title || body) {
          await displayRegularNotification({
            ...notificationData,
            title,
            body,
            messageId: remoteMessage.messageId,
          });
        }
      }

      await AsyncStorage.setItem(
        LAST_BACKGROUND_NOTIFICATION_KEY,
        JSON.stringify({
          receivedAt: new Date().toISOString(),
          data: remoteMessage.data,
          messageId: remoteMessage.messageId,
          kind,
        }),
      );
    } catch (storageError) {
      console.warn(
        '[notifications] Failed to persist background notification payload:',
        storageError,
      );
    }
  });
}

export async function getLastBackgroundNotificationPayload() {
  const rawValue = await AsyncStorage.getItem(LAST_BACKGROUND_NOTIFICATION_KEY);
  return rawValue ? JSON.parse(rawValue) : null;
}

export async function clearLastBackgroundNotificationPayload() {
  await AsyncStorage.removeItem(LAST_BACKGROUND_NOTIFICATION_KEY);
}
