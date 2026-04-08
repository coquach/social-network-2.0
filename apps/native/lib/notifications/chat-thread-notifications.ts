import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidStyle,
  type AndroidMessagingStyleMessage,
} from '@notifee/react-native';
import { Platform } from 'react-native';
import {
  toChatNotificationPayload,
  type NotificationData,
} from './notification-payload';

const CHAT_CHANNEL_GROUP_ID = 'chat';
const CHAT_CHANNEL_ID = 'messages';
const CHAT_NOTIFICATION_GROUP_ID = 'chat-threads';
const CHAT_SUMMARY_NOTIFICATION_ID = 'chat-thread-summary';
const CHAT_THREAD_STORAGE_KEY = '@sentimeta:chat-thread-notifications';
const MAX_THREAD_MESSAGES = 5;

export type ChatThreadNotificationPayload = {
  conversationId: string;
  messageId: string;
  senderId: string;
  senderName: string;
  conversationName?: string;
  isGroup: boolean;
  preview: string;
  unreadCount: number;
  senderAvatar?: string;
  sentAt?: number | string;
};

type ChatThreadMessage = {
  messageId: string;
  senderId: string;
  senderName: string;
  preview: string;
  timestamp: number;
};

type ChatThreadState = {
  conversationId: string;
  isGroup: boolean;
  conversationName?: string;
  unreadCount: number;
  messages: ChatThreadMessage[];
  updatedAt: number;
};

type ChatThreadStateMap = Record<string, ChatThreadState>;

const isAndroid = Platform.OS === 'android';

const getThreadNotificationId = (conversationId: string) =>
  `chat-thread:${conversationId}`;

const normalizeTimestamp = (value?: number | string) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const timestamp = Date.parse(value);
    if (Number.isFinite(timestamp)) {
      return timestamp;
    }
  }

  return Date.now();
};

const sanitizePreview = (value?: string) => {
  if (!value?.trim()) {
    return 'Bạn có tin nhắn mới';
  }

  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized.length > 120
    ? `${normalized.slice(0, 117).trim()}...`
    : normalized;
};

const getConversationTitle = (thread: ChatThreadState) =>
  thread.isGroup
    ? thread.conversationName || 'Nhóm chat'
    : thread.messages.at(-1)?.senderName || 'Tin nhắn mới';

const toMessagingStyleMessages = (
  messages: ChatThreadMessage[],
): AndroidMessagingStyleMessage[] =>
  messages.map((message) => ({
    text: message.preview,
    timestamp: message.timestamp,
    person: {
      name: message.senderName,
    },
  }));

async function readThreadStateMap(): Promise<ChatThreadStateMap> {
  try {
    const rawValue = await AsyncStorage.getItem(CHAT_THREAD_STORAGE_KEY);
    return rawValue ? (JSON.parse(rawValue) as ChatThreadStateMap) : {};
  } catch (error) {
    console.warn(
      '[notifications] Failed to read chat thread notification state:',
      error,
    );
    return {};
  }
}

async function writeThreadStateMap(stateMap: ChatThreadStateMap) {
  await AsyncStorage.setItem(CHAT_THREAD_STORAGE_KEY, JSON.stringify(stateMap));
}

export async function ensureChatThreadNotificationInfrastructure() {
  if (!isAndroid) {
    return;
  }

  await notifee.createChannelGroup({
    id: CHAT_CHANNEL_GROUP_ID,
    name: 'Chat',
  });

  await notifee.createChannel({
    id: CHAT_CHANNEL_ID,
    name: 'Messages',
    description: 'Incoming chat message notifications',
    groupId: CHAT_CHANNEL_GROUP_ID,
    importance: AndroidImportance.HIGH,
    sound: 'message.wav',
    vibration: true,
    vibrationPattern: [0, 250, 150, 250],
    lights: true,
    lightColor: '#2563EB',
    badge: true,
  });
}

export async function upsertChatThreadNotification(
  payload: ChatThreadNotificationPayload,
) {
  if (!isAndroid) {
    return;
  }

  await ensureChatThreadNotificationInfrastructure();

  const stateMap = await readThreadStateMap();
  const timestamp = normalizeTimestamp(payload.sentAt);
  const nextMessage: ChatThreadMessage = {
    messageId: payload.messageId,
    senderId: payload.senderId,
    senderName: payload.senderName,
    preview: sanitizePreview(payload.preview),
    timestamp,
  };

  const currentThread = stateMap[payload.conversationId];
  const dedupedMessages = (currentThread?.messages || []).filter(
    (message) => message.messageId !== payload.messageId,
  );
  const nextMessages = [...dedupedMessages, nextMessage]
    .sort((left, right) => left.timestamp - right.timestamp)
    .slice(-MAX_THREAD_MESSAGES);

  const nextThread: ChatThreadState = {
    conversationId: payload.conversationId,
    isGroup: payload.isGroup,
    conversationName: payload.conversationName,
    unreadCount:
      Number.isFinite(payload.unreadCount) && payload.unreadCount > 0
        ? payload.unreadCount
        : Math.max(currentThread?.unreadCount || 0, 1),
    messages: nextMessages,
    updatedAt: timestamp,
  };

  stateMap[payload.conversationId] = nextThread;
  await writeThreadStateMap(stateMap);

  const latestMessage = nextMessages.at(-1);
  const notificationId = getThreadNotificationId(payload.conversationId);
  const title =
    nextThread.unreadCount > 1
      ? `${nextThread.unreadCount} tin nhan moi`
      : getConversationTitle(nextThread);
  const body = payload.isGroup
    ? latestMessage
      ? `${latestMessage.senderName}: ${latestMessage.preview}`
      : payload.senderName
    : latestMessage?.preview || 'Ban co tin nhan moi';

  await notifee.displayNotification({
    id: notificationId,
    title,
    body,
    data: {
      type: 'message',
      conversationId: payload.conversationId,
      messageId: payload.messageId,
      senderId: payload.senderId,
      senderName: payload.senderName,
      conversationName: payload.conversationName || '',
      isGroup: payload.isGroup ? 'true' : 'false',
    },
    android: {
      channelId: CHAT_CHANNEL_ID,
      category: AndroidCategory.MESSAGE,
      pressAction: {
        id: 'open-chat',
      },
      groupId: CHAT_NOTIFICATION_GROUP_ID,
      showTimestamp: true,
      timestamp,
      onlyAlertOnce: false,
      style: {
        type: AndroidStyle.MESSAGING,
        person: {
          name: payload.isGroup ? payload.conversationName || 'Nhóm chat' : 'Bạn',
        },
        group: payload.isGroup,
        title: payload.isGroup ? payload.conversationName || 'Nhóm chat' : undefined,
        messages: toMessagingStyleMessages(nextMessages),
      },
    },
  });

  await syncChatThreadSummaryNotification(stateMap);
}

export async function upsertChatThreadNotificationFromData(
  data: NotificationData | undefined,
) {
  const payload = toChatNotificationPayload(data);

  if (!payload) {
    return false;
  }

  await upsertChatThreadNotification(payload);
  return true;
}

async function syncChatThreadSummaryNotification(stateMap: ChatThreadStateMap) {
  const threads = Object.values(stateMap).sort(
    (left, right) => right.updatedAt - left.updatedAt,
  );

  if (threads.length === 0) {
    await notifee.cancelNotification(CHAT_SUMMARY_NOTIFICATION_ID);
    return;
  }

  const totalUnread = threads.reduce(
    (sum, thread) => sum + Math.max(thread.unreadCount, 0),
    0,
  );
  const summaryLines = threads.slice(0, 5).map((thread) => {
    const latestMessage = thread.messages.at(-1);
    return `${getConversationTitle(thread)}: ${latestMessage?.preview || 'Bạn có tin nhắn mới'}`;
  });

  await notifee.displayNotification({
    id: CHAT_SUMMARY_NOTIFICATION_ID,
    title: `${totalUnread} tin nhắn mới`,
    body: `${threads.length} cuộc trò chuyện có tin nhắn mới`,
    android: {
      channelId: CHAT_CHANNEL_ID,
      groupId: CHAT_NOTIFICATION_GROUP_ID,
      groupSummary: true,
      pressAction: {
        id: 'open-notifications',
      },
      style: {
        type: AndroidStyle.INBOX,
        lines: summaryLines,
        summary: `${threads.length} cuộc trò chuyện`,
      },
      onlyAlertOnce: true,
    },
  });
}

export async function clearChatThreadNotification(conversationId: string) {
  if (!isAndroid) {
    return;
  }

  const stateMap = await readThreadStateMap();
  delete stateMap[conversationId];
  await writeThreadStateMap(stateMap);
  await notifee.cancelNotification(getThreadNotificationId(conversationId));
  await syncChatThreadSummaryNotification(stateMap);
}

export async function clearAllChatThreadNotifications() {
  if (!isAndroid) {
    return;
  }

  await AsyncStorage.removeItem(CHAT_THREAD_STORAGE_KEY);
  await notifee.cancelNotification(CHAT_SUMMARY_NOTIFICATION_ID);
  const displayed = await notifee.getDisplayedNotifications();
  const threadIds = displayed
    .map((item) => item.notification.id)
    .filter((id): id is string => Boolean(id?.startsWith('chat-thread:')));

  await Promise.all(threadIds.map((id) => notifee.cancelNotification(id)));
}
