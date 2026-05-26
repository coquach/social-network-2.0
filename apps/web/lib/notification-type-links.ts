import { getNotificationRoute } from '@repo/shared';
import type { NotificationDTO } from '@repo/shared';

export const getNotificationTypeHref = (notif: NotificationDTO): string => {
  return getNotificationRoute(notif, 'web');
};
