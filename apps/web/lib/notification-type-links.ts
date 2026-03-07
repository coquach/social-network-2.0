import { NotificationDTO } from '@/models/notification/notificationDTO';

const getPayloadString = (
  payload: Record<string, unknown> | null,
  key: string
) => (typeof payload?.[key] === 'string' ? (payload[key] as string) : undefined);

export const getNotificationTypeHref = (notif: NotificationDTO) => {
  const payload =
    notif.payload && typeof notif.payload === 'object'
      ? (notif.payload as Record<string, unknown>)
      : null;
  const targetId = getPayloadString(payload, 'targetId');
  const actorId = getPayloadString(payload, 'actorId');

  switch (notif.type) {
    case 'friendship_request':
      return '/friends/requests'
    case 'friendship_accept':
    case 'friend':
      return '/friends';
    case 'follow':
      return actorId || targetId
        ? `/profile/${actorId || targetId}`
        : '/notifications';
    case 'comment':
    case 'reply_comment':
    case 'reaction':
    case 'share':
      return targetId ? `/posts/${targetId}` : '/notifications';
    case 'group_noti':
      return targetId ? `/groups/${targetId}` : '/groups';
    case 'group_invite':
      return '/groups/invites';
    case 'join_request_approved':
      return targetId ? `/groups/${targetId}` : '/groups';
    default:
      return '/notifications';
  }
};
