import AsyncStorage from '@react-native-async-storage/async-storage';
import { callService } from '@repo/shared';
import notifee, { EventType, type InitialNotification } from 'react-native-notify-kit';

import {
  getConversationId,
  isChatMessageNotificationData,
  type NotificationData
} from './notification-payload';

export const PENDING_CHAT_NOTIFICATION_NAVIGATION_KEY =
  '@sentimeta:pending-chat-notification-navigation';

/**
 * Persisted when user taps "Answer" on a call notification while the app is
 * in the background / killed. The foreground bootstrap reads this and triggers
 * the full answerCall flow (acceptCall REST + Stream join + store update).
 */
export const PENDING_CALL_ANSWER_KEY = '@sentimeta:pending-call-answer';

export type PendingCallAnswer = {
  callId: string;
  conversationId: string;
  recordedAt: string;
};

export async function storePendingCallAnswer(
  callId: string,
  conversationId: string,
): Promise<void> {
  const payload: PendingCallAnswer = {
    callId,
    conversationId,
    recordedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(PENDING_CALL_ANSWER_KEY, JSON.stringify(payload));
}

export async function consumePendingCallAnswer(): Promise<PendingCallAnswer | null> {
  const raw = await AsyncStorage.getItem(PENDING_CALL_ANSWER_KEY);
  if (!raw) return null;
  await AsyncStorage.removeItem(PENDING_CALL_ANSWER_KEY);
  const parsed = JSON.parse(raw) as PendingCallAnswer;
  // Discard if older than 60 seconds — the call ring timeout is ~30s
  const ageMs = Date.now() - new Date(parsed.recordedAt).getTime();
  if (ageMs > 60_000) return null;
  return parsed;
}

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
      // Persist intent so the foreground bootstrap can run the full join flow
      // (acceptCall REST + Stream join + store hydration).
      await storePendingCallAnswer(callId, conversationId);
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
