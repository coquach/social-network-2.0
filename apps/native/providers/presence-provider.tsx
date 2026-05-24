import { useAuth } from '@clerk/expo';
import { type PresenceStatus, useConversations, usePresenceStore } from '@repo/shared';
import React from 'react';

import { getConversationOtherUserId } from '~/components/chat/chat-helpers';
import { useSocket } from '~/providers/socket-provider';

type PresenceProviderProps = {
  children: React.ReactNode;
};

const presenceReferenceCounts = new Map<string, number>();

function getTrackedPresenceIds() {
  return Array.from(presenceReferenceCounts.entries())
    .filter(([, count]) => count > 0)
    .map(([userId]) => userId);
}

export function usePresenceChannel(userIds: string[]) {
  const { chatSocket } = useSocket();

  const targetIds = React.useMemo(() => {
    return Array.from(new Set(userIds.filter((value): value is string => Boolean(value)))).sort();
  }, [userIds]);

  const targetKey = React.useMemo(() => targetIds.join('|'), [targetIds]);

  React.useEffect(() => {
    if (!chatSocket || targetIds.length === 0) {
      return;
    }

    const idsToSubscribe: string[] = [];

    targetIds.forEach((userId) => {
      const nextCount = (presenceReferenceCounts.get(userId) ?? 0) + 1;
      presenceReferenceCounts.set(userId, nextCount);

      if (nextCount === 1) {
        idsToSubscribe.push(userId);
      }
    });

    if (idsToSubscribe.length > 0) {
      chatSocket.emit('presence.subscribe', { userIds: idsToSubscribe });
    }

    return () => {
      const idsToUnsubscribe: string[] = [];

      targetIds.forEach((userId) => {
        const currentCount = presenceReferenceCounts.get(userId) ?? 0;
        const nextCount = Math.max(0, currentCount - 1);

        if (nextCount === 0) {
          presenceReferenceCounts.delete(userId);
          idsToUnsubscribe.push(userId);
          return;
        }

        presenceReferenceCounts.set(userId, nextCount);
      });

      if (idsToUnsubscribe.length > 0) {
        chatSocket.emit('presence.unsubscribe', { userIds: idsToUnsubscribe });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatSocket, targetKey]);
}

function NativePresenceBootstrap() {
  const { userId } = useAuth();
  const { chatSocket } = useSocket();
  const upsert = usePresenceStore((state) => state.upsert);
  const remove = usePresenceStore((state) => state.remove);
  const clear = usePresenceStore((state) => state.clear);
  const { data } = useConversations({ limit: 20 });

  const directParticipantIds = React.useMemo(() => {
    const conversations = data?.pages.flatMap((page) => page.data) ?? [];

    return conversations
      .map((conversation) => getConversationOtherUserId(conversation, userId ?? null))
      .filter((value): value is string => Boolean(value));
  }, [data?.pages, userId]);

  React.useEffect(() => {
    if (!chatSocket) {
      clear();
      return;
    }

    const handleSnapshot = (payload: Record<string, { status: string; lastSeen: string | null }>) => {
      Object.entries(payload).forEach(([memberId, info]) => {
        const normalizedStatus = info.status.toLowerCase() as PresenceStatus;

        upsert(memberId, {
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
      const normalizedStatus = payload.status.toLowerCase() as PresenceStatus;

      if (normalizedStatus === 'online' || normalizedStatus === 'away') {
        upsert(payload.userId, {
          status: normalizedStatus,
          lastSeen: payload.lastSeen ?? null,
        });
        return;
      }

      remove(payload.userId);
    };

    const resubscribeTrackedUsers = () => {
      const trackedUserIds = getTrackedPresenceIds();

      if (trackedUserIds.length > 0) {
        chatSocket.emit('presence.subscribe', { userIds: trackedUserIds });
      }
    };

    const handleDisconnect = () => {
      clear();
    };

    chatSocket.on('connect', resubscribeTrackedUsers);
    chatSocket.on('disconnect', handleDisconnect);
    chatSocket.on('presence.snapshot', handleSnapshot);
    chatSocket.on('presence.update', handlePresenceUpdate);

    if (chatSocket.connected) {
      resubscribeTrackedUsers();
    }

    return () => {
      chatSocket.off('connect', resubscribeTrackedUsers);
      chatSocket.off('disconnect', handleDisconnect);
      chatSocket.off('presence.snapshot', handleSnapshot);
      chatSocket.off('presence.update', handlePresenceUpdate);
    };
  }, [chatSocket, clear, remove, upsert]);

  usePresenceChannel(directParticipantIds);

  React.useEffect(() => {
    if (!userId) {
      clear();
    }
  }, [clear, userId]);

  return null;
}

export function NativePresenceProvider({ children }: PresenceProviderProps) {
  const { isSignedIn } = useAuth();

  return (
    <>
      {children}
      {isSignedIn ? <NativePresenceBootstrap /> : null}
    </>
  );
}
