'use client';

import React, { createContext, useContext, useMemo, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';

import { ConversationDTO } from '@/models/conversation/conversationDTO';
import { ensureLastSeenMap } from '@/utils/ensure-last-seen-map';
import { useMarkConversationAsRead } from '@/hooks/use-conversation';

type MarkReadFn = (p: {
  conversationId: string;
  lastMessageId?: string | null;
}) => void;

const Ctx = createContext<{ markRead: MarkReadFn } | null>(null);

export function useMarkReadBuffer() {
  const v = useContext(Ctx);
  if (!v)
    throw new Error('useMarkReadBuffer must be used inside MarkReadProvider');
  return v;
}

export function MarkReadProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const { mutate } = useMarkConversationAsRead();

  // gom theo conversationId => luôn giữ messageId mới nhất
  const latestRef = useRef(new Map<string, string>());
  // chặn gửi trùng targetId (per conversation)
  const lastSentRef = useRef(new Map<string, string>());

  const flush = useDebouncedCallback(() => {
    if (!userId) return;

    const entries = Array.from(latestRef.current.entries());
    latestRef.current.clear();

    for (const [conversationId, lastMessageId] of entries) {
      const prevSent = lastSentRef.current.get(conversationId);
      if (prevSent === lastMessageId) continue; // đã gửi rồi

      lastSentRef.current.set(conversationId, lastMessageId);

      // optimistic update cache detail (nếu có)
      queryClient.setQueryData<ConversationDTO>(
        ['conversation', conversationId],
        (old) => {
          if (!old) return old;
          const map = ensureLastSeenMap(old.lastSeenMessageId);
          map.set(userId, lastMessageId);
          return { ...old, lastSeenMessageId: map };
        }
      );

      mutate({ conversationId, lastMessageId });
    }
  }, 250);

  const markRead: MarkReadFn = useMemo(() => {
    return ({ conversationId, lastMessageId }) => {
      if (!userId) return;
      if (!conversationId) return;
      if (!lastMessageId) return;
      if (lastMessageId.startsWith('temp:')) return;

      // Gate: nếu cache đã seen tới target => khỏi push
      const conv = queryClient.getQueryData<ConversationDTO>([
        'conversation',
        conversationId,
      ]);
      const map = ensureLastSeenMap(conv?.lastSeenMessageId);
      const myLastSeen = map.get(userId);
      if (myLastSeen === lastMessageId) return;

      latestRef.current.set(conversationId, lastMessageId);
      flush(); // debounce flush
    };
  }, [flush, queryClient, userId]);

  return <Ctx.Provider value={{ markRead }}>{children}</Ctx.Provider>;
}
