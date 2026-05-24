import {
  type NotificationDTO,
  type NotificationData,
  getNotificationRoute as sharedGetNotificationRoute,
} from '@repo/shared';

export type { NotificationData };

export type ChatNotificationPayload = {
  conversationId: string;
  messageId: string;
  senderId: string;
  senderName: string;
  conversationName?: string;
  senderAvatar?: string;
  preview: string;
  unreadCount: number;
  isGroup: boolean;
  sentAt?: string | number;
};

export const getConversationId = (data: NotificationData | undefined) => {
  if (!data?.conversationId) {
    return null;
  }

  return String(data.conversationId);
};

export const isChatMessageNotificationData = (
  data: NotificationData | undefined,
) => {
  if (!data) {
    return false;
  }

  if (data.type === 'call' || data.type === 'call_cancelled') {
    return false;
  }

  return data.type === 'message' || Boolean(getConversationId(data));
};

export const isCallNotificationData = (
  data: NotificationData | undefined,
): boolean => {
  return data?.type === 'call';
};

export const isCallCancelledNotificationData = (
  data: NotificationData | undefined,
): boolean => {
  return data?.type === 'call_cancelled';
};

export const toChatNotificationPayload = (
  data: NotificationData | undefined,
): ChatNotificationPayload | null => {
  const conversationId = getConversationId(data);
  const messageId =
    typeof data?.messageId === 'string' ? data.messageId : undefined;
  const senderId = typeof data?.senderId === 'string' ? data.senderId : undefined;
  const senderName =
    typeof data?.senderName === 'string' ? data.senderName : undefined;

  if (!conversationId || !messageId || !senderId || !senderName) {
    return null;
  }

  const unreadCount =
    typeof data?.unreadCount === 'number'
      ? data.unreadCount
      : Number(data?.unreadCount ?? 1);

  return {
    conversationId,
    messageId,
    senderId,
    senderName,
    conversationName:
      typeof data?.conversationName === 'string'
        ? data.conversationName
        : undefined,
    senderAvatar:
      typeof data?.senderAvatar === 'string' ? data.senderAvatar : undefined,
    preview: typeof data?.preview === 'string' ? data.preview : '',
    unreadCount:
      Number.isFinite(unreadCount) && unreadCount > 0 ? unreadCount : 1,
    isGroup: data?.isGroup === 'true',
    sentAt: typeof data?.sentAt === 'string' ? data.sentAt : undefined,
  };
};

/**
 * Maps incoming notification data to the correct Expo Router route.
 * Aligned with apps/web/lib/notification-type-links.ts
 */
export const getNotificationRoute = (
  data: NotificationData | NotificationDTO | undefined,
): string => {
  return sharedGetNotificationRoute(data, 'native');
};
