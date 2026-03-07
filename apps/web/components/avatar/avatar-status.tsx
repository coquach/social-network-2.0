'use client';

import { useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';
import { vi as viVN } from 'date-fns/locale';
import { usePresenceStore } from '@repo/shared';
import { useAvatarContext } from './avatar-context';

interface AvatarStatusProps {
  className?: string;
}

export const AvatarStatus = ({ className = '' }: AvatarStatusProps) => {
  const { userId } = useAvatarContext();
  const { userId: currentUserId } = useAuth();
  const isOnline = usePresenceStore((state) => state.isOnline(userId));
  const presence = usePresenceStore((state) => state.getById(userId));

  const shouldShow = userId !== currentUserId;

  const statusText = useMemo(() => {
    if (!shouldShow) return '';

    if (!presence || presence.status === 'offline') {
      if (presence?.lastSeen) {
        const ts =
          typeof presence.lastSeen === 'string'
            ? Number(presence.lastSeen)
            : presence.lastSeen;
        const d = new Date(ts);
        if (!isNaN(d.getTime())) {
          return `${formatDistanceToNow(d, {
            addSuffix: true,
            locale: viVN,
          })}`;
        }
      }
      return 'Ngoại tuyến';
    }

    if (presence.status === 'away') {
      return 'Tạm vắng';
    }

    return 'Trực tuyến';
  }, [presence, shouldShow]);

  if (!shouldShow) return null;

  return (
    <span
      className={`text-xs ${
        isOnline || presence?.status === 'away'
          ? 'text-green-600'
          : 'text-gray-400'
      } truncate ${className}`}
    >
      {statusText}
    </span>
  );
};
