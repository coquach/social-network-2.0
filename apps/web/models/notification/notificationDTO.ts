import { NotificationStatus } from '@repo/shared';

export type NotificationPayload = {
  targetType?: string;
  targetId?: string;
  actorId?: string;
  actorName?: string;
  actorAvatar?: string;
  content?: string;
  [key: string]: unknown;
};

export interface NotificationDTO {
  _id: string;
  requestId?: string;
  userId: string;
  type: string;
  message?: string;
  payload: NotificationPayload;
  channels?: string[];
  status: NotificationStatus;
  retries?: number;
  sendAt?: string;
  meta?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
