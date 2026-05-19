export type NotificationData = Record<string, unknown> & {
  type?: string;
  conversationId?: string;
  messageId?: string;
  senderId?: string;
  senderName?: string;
  conversationName?: string;
  senderAvatar?: string;
  preview?: string;
  unreadCount?: string | number;
  sentAt?: string | number;
  // Regular notification specific fields
  targetType?: string;
  targetId?: string;
  actorId?: string;
  actorName?: string;
  actorAvatar?: string;
  title?: string;
  body?: string;
};

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
    isGroup: data?.isGroup === 'true' || data?.isGroup === true,
    sentAt:
      typeof data?.sentAt === 'string' || typeof data?.sentAt === 'number'
        ? data.sentAt
        : undefined,
  };
};

/**
 * Maps incoming notification data to the correct Expo Router route.
 * Aligned with apps/web/lib/notification-type-links.ts
 */
export const getNotificationRoute = (
  data: NotificationData | undefined,
): string => {
  if (!data) {
    return '/notifications';
  }

  // 1. Chat notifications
  if (isChatMessageNotificationData(data)) {
    const conversationId = getConversationId(data);
    return conversationId ? `/chat/${conversationId}` : '/notifications';
  }

  // 2. Regular notifications
  const targetId = typeof data.targetId === 'string' ? data.targetId : undefined;
  const type = typeof data.type === 'string' ? data.type : '';

  switch (type) {
    case 'friendship_request':
    case 'friendship_accept':
    case 'friend':
    case 'follow':
      return '/profile';
    case 'comment':
    case 'reply_comment':
    case 'reaction':
    case 'share':
      return targetId ? `/posts/${targetId}` : '/notifications';
    case 'group_noti':
    case 'join_request_approved':
      return targetId ? `/groups/${targetId}` : '/groups';
    default:
      return '/notifications';
  }
};
