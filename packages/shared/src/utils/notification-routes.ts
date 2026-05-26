import type { NotificationDTO } from '../types/notification.types';

export type NotificationData = Record<string, string | undefined> & {
  type?: string;
  conversationId?: string;
  messageId?: string;
  senderId?: string;
  senderName?: string;
  conversationName?: string;
  senderAvatar?: string;
  preview?: string;
  unreadCount?: string;
  sentAt?: string;
  targetType?: string;
  targetId?: string;
  actorId?: string;
  actorName?: string;
  actorAvatar?: string;
  title?: string;
  body?: string;
  callId?: string;
  callType?: string;
  callerId?: string;
  callerName?: string;
  callerAvatar?: string;
  isGroup?: string;
  userId?: string;
};

/**
 * Maps incoming notification data to the correct route.
 * Fully dry and platform-aware, sharing single source of truth between Web & Native.
 */
export const getNotificationRoute = (
  data: NotificationData | NotificationDTO | undefined,
  platform: 'web' | 'native' = 'web',
): string => {
  if (!data) {
    return '/notifications';
  }

  // 1. Extract type
  const type = typeof data.type === 'string' ? data.type : '';
  if (!type) {
    return '/notifications';
  }

  // 2. Extract properties based on DTO vs flat structure
  let conversationId: string | undefined;
  let targetId: string | undefined;
  let actorId: string | undefined;

  if ('payload' in data && data.payload && typeof data.payload === 'object') {
    const payload = data.payload as Record<string, unknown>;
    conversationId = typeof payload.conversationId === 'string' ? payload.conversationId : undefined;
    targetId = typeof payload.targetId === 'string' ? payload.targetId : undefined;
    actorId = typeof payload.actorId === 'string' ? payload.actorId : undefined;
  } else {
    const flatData = data as NotificationData;
    conversationId = flatData.conversationId;
    targetId = flatData.targetId;
    actorId = flatData.actorId;
  }

  // 3. Chat / Message / Call routing
  if (type === 'call') {
    return '/chat/call';
  }

  if (type === 'message' || (!targetId && conversationId)) {
    return conversationId ? `/chat/${conversationId}` : '/notifications';
  }

  // 4. Platform-specific routing mapping
  if (platform === 'native') {
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
  }

  // Web Next.js routing
  switch (type) {
    case 'friendship_request':
      return '/friends/requests';
    case 'friendship_accept':
    case 'friend':
      return '/friends';
    case 'follow':
      return actorId || targetId ? `/profile/${actorId || targetId}` : '/notifications';
    case 'comment':
    case 'reply_comment':
    case 'reaction':
    case 'share':
      return targetId ? `/posts/${targetId}` : '/notifications';
    case 'group_noti':
    case 'join_request_approved':
      return targetId ? `/groups/${targetId}` : '/groups';
    case 'group_invite':
      return '/groups/invites';
    default:
      return '/notifications';
  }
};
