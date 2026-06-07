'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { NotificationDTO } from '@repo/shared';
import { getNotificationTypeLabel } from '@/lib/notification-type-labels';
import { getNotificationTypeHref } from '@/lib/notification-type-links';
import { BLUR_PLACEHOLDERS } from '@/lib/blur-placeholder';

interface NotificationCardCompactProps {
  notif: NotificationDTO;
  onClick?: (id: string) => void;
}

/**
 * NotificationCardCompact - Compact notification card with truncated text
 * Used in notification dropdown/popover where space is limited
 */
export const NotificationCardCompact = ({
  notif,
  onClick,
}: NotificationCardCompactProps) => {
  const { payload, message, status, createdAt } = notif;
  const href = getNotificationTypeHref(notif);
  const safePayload =
    payload && typeof payload === 'object'
      ? (payload as Record<string, unknown>)
      : null;
  const actorAvatar =
    typeof safePayload?.actorAvatar === 'string'
      ? safePayload.actorAvatar
      : '/images/placeholder.png';
  const content =
    typeof message === 'string' && message.length > 0
      ? message
      : typeof safePayload?.content === 'string'
      ? safePayload.content
      : '';
  const handleClick = () => onClick?.(notif._id);

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border border-transparent transition-colors',
        status !== 'read'
          ? 'bg-sky-50 hover:bg-sky-100'
          : 'bg-white hover:bg-sky-100'
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <Image
          src={actorAvatar}
          alt="avatar"
          width={40}
          height={40}
          loading="lazy"
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDERS.avatar}
          className="rounded-full border border-gray-200 object-cover"
        />
      </div>

      {/* Nội dung */}
      <div className="flex flex-col flex-1 min-w-0 gap-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wide text-sky-500">
            {getNotificationTypeLabel(notif.type)}
          </span>
        </div>
        <span className="text-sm text-gray-800 max-w-full truncate">
          {content || 'Thông báo mới'}
        </span>
        <span className="text-xs text-gray-400 text-right mt-1">
          {new Date(createdAt).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
          })}
        </span>
      </div>
    </Link>
  );
};

NotificationCardCompact.Skeleton = function NotificationCardCompactSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border-b border-gray-100 animate-pulse">
      {/* Avatar skeleton */}
      <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />

      {/* Content skeleton */}
      <div className="flex flex-col flex-1 gap-2">
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
        <div className="h-3 w-1/2 bg-gray-200 rounded mt-1" />
      </div>
    </div>
  );
};
