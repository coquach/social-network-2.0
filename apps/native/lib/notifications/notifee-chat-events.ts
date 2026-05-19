import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { EventType, type InitialNotification } from 'react-native-notify-kit';
import { callService } from '@repo/shared';

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

  const data = detail.notification?.data as NotificationData | undefined;

  if (detail.pressAction?.id === 'answer_call') {
    const callId = data?.callId;
    const conversationId = data?.conversationId;
    if (typeof callId === 'string' && typeof conversationId === 'string') {
      try {
        await callService.acceptCall(callId);
      } catch (err) {
        console.error('[notifications] Failed to accept call in background:', err);
      }
      await storePendingChatNavigation({
        type: 'message',
        conversationId,
        messageId: 'call_nav',
        senderId: 'system',
        senderName: 'System',
        preview: 'Call answering',
        unreadCount: '0',
      });
    }
    if (detail.notification?.id) {
      await notifee.cancelNotification(detail.notification.id);
    }
    return;
  }

  if (detail.pressAction?.id === 'reject_call') {
    const callId = data?.callId;
    if (typeof callId === 'string') {
      try {
        await callService.rejectCall(callId);
      } catch (err) {
        console.error('[notifications] Failed to reject call in background:', err);
      }
    }
    if (detail.notification?.id) {
      await notifee.cancelNotification(detail.notification.id);
    }
    return;
  }

  await storePendingChatNavigation(data);
});
