import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { EventType, type InitialNotification } from 'react-native-notify-kit';

import {
  getConversationId,
  isChatMessageNotificationData,
  type NotificationData,
} from './notification-payload';

export const PENDING_CHAT_NOTIFICATION_NAVIGATION_KEY =
  '@sentimeta:pending-chat-notification-navigation';

type PendingChatNavigation = {
  conversationId: string;
  recordedAt: string;
};

const toPendingNavigation = (
  data: NotificationData | undefined,
): PendingChatNavigation | null => {
  if (!isChatMessageNotificationData(data)) {
    return null;
  }

  const conversationId = getConversationId(data);

  if (!conversationId) {
    return null;
  }

  return {
    conversationId,
    recordedAt: new Date().toISOString(),
  };
};

async function storePendingChatNavigation(data: NotificationData | undefined) {
  const pendingNavigation = toPendingNavigation(data);

  if (!pendingNavigation) {
    return;
  }

  await AsyncStorage.setItem(
    PENDING_CHAT_NOTIFICATION_NAVIGATION_KEY,
    JSON.stringify(pendingNavigation),
  );
}

export async function consumePendingChatNavigation() {
  const rawValue = await AsyncStorage.getItem(
    PENDING_CHAT_NOTIFICATION_NAVIGATION_KEY,
  );

  if (!rawValue) {
    return null;
  }

  await AsyncStorage.removeItem(PENDING_CHAT_NOTIFICATION_NAVIGATION_KEY);
  return JSON.parse(rawValue) as PendingChatNavigation;
}

export async function extractConversationIdFromInitialNotification(
  initialNotification: InitialNotification | null,
) {
  const data = initialNotification?.notification?.data as
    | NotificationData
    | undefined;

  if (!isChatMessageNotificationData(data)) {
    return null;
  }

  return getConversationId(data);
}

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type !== EventType.PRESS && type !== EventType.ACTION_PRESS) {
    return;
  }

  await storePendingChatNavigation(
    detail.notification?.data as NotificationData | undefined,
  );
});
