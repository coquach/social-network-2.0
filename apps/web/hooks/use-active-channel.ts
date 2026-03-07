'use client';

import { useEffect, useMemo } from 'react';
import { useSocket } from '@/components/providers/socket-provider';
import { usePresenceStore, type PresenceStatus } from '@repo/shared';

type PresenceSubscription = {
  count: number;
  teardown: () => void;
};

const presenceSubscriptions = new Map<string, PresenceSubscription>();

export const useActiveChannel = (userIds: string[]) => {
  const { upsert, remove } = usePresenceStore();
  const { chatSocket } = useSocket();

  const targetIds = useMemo(() => {
    return Array.from(new Set(userIds.filter(Boolean))).sort();
  }, [userIds]);

  const targetKey = useMemo(() => targetIds.join('|'), [targetIds]);

  useEffect(() => {
    if (!chatSocket) return;
    if (targetIds.length === 0) return;

    const existing = presenceSubscriptions.get(targetKey);
    if (existing) {
      existing.count += 1;
      return () => {
        existing.count -= 1;
        if (existing.count <= 0) {
          existing.teardown();
          presenceSubscriptions.delete(targetKey);
        }
      };
    }

    chatSocket.emit('presence.subscribe', { userIds: targetIds });

    const handleSnapshot = (
      payload: Record<string, { status: string; lastSeen: string | null }>
    ) => {
      Object.entries(payload).forEach(([userId, info]) => {
        if (!targetIds.includes(userId)) return;

        const normalizedStatus = info.status.toLowerCase() as PresenceStatus;

        upsert(userId, {
          status: normalizedStatus,
          lastSeen: info.lastSeen ?? null,
        });
      });
    };

    const handlePresenceUpdate = (payload: {
      userId: string;
      status: string;
      lastSeen: string | null;
    }) => {
      if (!targetIds.includes(payload.userId)) return;

      const normalizedStatus = payload.status.toLowerCase() as PresenceStatus;

      if (normalizedStatus === 'online' || normalizedStatus === 'away') {
        upsert(payload.userId, {
          status: normalizedStatus,
          lastSeen: payload.lastSeen ?? null,
        });
      } else {
        remove(payload.userId);
      }
    };

    chatSocket.on('presence.snapshot', handleSnapshot);
    chatSocket.on('presence.update', handlePresenceUpdate);

    const teardown = () => {
      chatSocket.emit('presence.unsubscribe', { userIds: targetIds });
      chatSocket.off('presence.snapshot', handleSnapshot);
      chatSocket.off('presence.update', handlePresenceUpdate);
    };

    presenceSubscriptions.set(targetKey, {
      count: 1,
      teardown,
    });

    return () => {
      const current = presenceSubscriptions.get(targetKey);
      if (!current) return;

      current.count -= 1;
      if (current.count <= 0) {
        current.teardown();
        presenceSubscriptions.delete(targetKey);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatSocket, upsert, remove, targetKey]);
};
