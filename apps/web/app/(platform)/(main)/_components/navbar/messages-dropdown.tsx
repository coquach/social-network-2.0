'use client';

import { useEffect, useMemo, useState } from 'react';
import { useGetConversationList } from '@/hooks/use-conversation';
import { useSocket } from '@/components/providers/socket-provider';
import { ConversationDTO } from '@/models/conversation/conversationDTO';
import { ensureLastSeenMap } from '@/utils/ensure-last-seen-map';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { MessageDTO } from '@/models/message/messageDTO';
import { ConversationBox } from '../../conversations/_components/conversation-box';
import { useAuth } from '@clerk/nextjs';

const getUpdatedAt = (value?: Date | string) =>
  value ? new Date(value).getTime() : 0;

export const MessageDropdown = () => {
  const { userId } = useAuth();
  const { chatSocket } = useSocket();
  const queryClient = useQueryClient();
  const { data, isLoading } = useGetConversationList({ limit: 10 });
  const [liveConversations, setLiveConversations] = useState<
    Record<string, ConversationDTO>
  >({});

  useEffect(() => {
    if (!chatSocket) return;

    const handleConversationCreated = (conversation: ConversationDTO) => {
      setLiveConversations((prev) => ({
        ...prev,
        [conversation._id]: conversation,
      }));
    };

    const handleConversationUpdated = (conversation: ConversationDTO) => {
      setLiveConversations((prev) => ({
        ...prev,
        [conversation._id]: conversation,
      }));
    };

    const handleConversationDeleted = (payload: string | { id: string }) => {
      const conversationId =
        typeof payload === 'string' ? payload : payload?.id;
      if (!conversationId) return;
      setLiveConversations((prev) => {
        const next = { ...prev };
        delete next[conversationId];
        return next;
      });
    };

    const handleMemberLeft = (payload: { conversationId: string }) => {
      const id = payload?.conversationId;
      if (!id) return;

      setLiveConversations((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    };

    const handleMessageNew = (message: MessageDTO) => {
      if (!message?.conversationId) return;
      const updatedAt = message.createdAt ?? new Date().toISOString();

      queryClient.setQueriesData(
        { queryKey: ['conversations'] },
        (old: any) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: (page.data ?? []).map((conv: ConversationDTO) =>
                conv._id === message.conversationId
                  ? { ...conv, lastMessage: message, updatedAt }
                  : conv
              ),
            })),
          };
        }
      );
    };

    chatSocket.on('conversation.created', handleConversationCreated);
    chatSocket.on('conversation.updated', handleConversationUpdated);
    chatSocket.on('conversation.deleted', handleConversationDeleted);
    chatSocket.on('conversation.memberJoined', handleConversationCreated);
    chatSocket.on('conversation.memberLeft', handleMemberLeft);
    chatSocket.on('message.new', handleMessageNew);

    return () => {
      chatSocket.off('conversation.created', handleConversationCreated);
      chatSocket.off('conversation.updated', handleConversationUpdated);
      chatSocket.off('conversation.deleted', handleConversationDeleted);
      chatSocket.off('conversation.memberJoined', handleConversationCreated);
      chatSocket.off('conversation.memberLeft', handleMemberLeft);
      chatSocket.off('message.new', handleMessageNew);
    };
  }, [chatSocket, queryClient]);

  const allConversations = useMemo(() => {
    const map = new Map<string, ConversationDTO>();

    if (data) {
      for (const page of data.pages) {
        for (const conv of page.data) {
          map.set(conv._id, conv);
        }
      }
    }

    Object.values(liveConversations).forEach((conv) => {
      map.set(conv._id, conv);
    });

    const merged = Array.from(map.values());
    merged.sort(
      (a, b) => getUpdatedAt(b.updatedAt) - getUpdatedAt(a.updatedAt)
    );

    return merged;
  }, [data, liveConversations]);

  const conversations = useMemo(() => {
    const list = allConversations;
    const filtered = userId
      ? list.filter((conv) => !conv.hiddenFor?.includes(userId))
      : list;

    return filtered.slice(0, 10);
  }, [allConversations, userId]);

  const unreadConversationsCount = useMemo(() => {
    if (!userId) return 0;

    return conversations.reduce((count, conv) => {
      const lastMsg = conv.lastMessage;
      if (!lastMsg) return count;
      if (lastMsg.senderId === userId) return count;
      const lastSeenMap = ensureLastSeenMap(conv.lastSeenMessageId);
      const lastSeenId = lastSeenMap.get(userId);
      if (lastSeenId !== lastMsg._id) return count + 1;
      return count;
    }, 0);
  }, [conversations, userId]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative flex items-center justify-center rounded-md p-2 hover:bg-sky-500/10 cursor-pointer">
          <MessageCircle size={22} className="text-sky-400" />
          {unreadConversationsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadConversationsCount}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-96  rounded-xl border border-gray-200 bg-white shadow-xl"
        align="end"
        sideOffset={8}
      >
        <div className="flex flex-col gap-2 p-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <ConversationBox.Skeleton key={i} />
            ))
          ) : conversations.length === 0 ? (
            <div className="p-3 text-center text-sm text-gray-500">
              Không có cuộc trò chuyện nào
            </div>
          ) : (
            conversations.map((conv) => (
              <DropdownMenuItem
                key={conv._id}
                asChild
                className="p-0 focus:bg-transparent"
              >
                <Link href={`/conversations/${conv._id}`}>
                  <ConversationBox data={conv} selected={false} />
                </Link>
              </DropdownMenuItem>
            ))
          )}
        </div>

        <DropdownMenuItem asChild>
          <Link
            href="/conversations"
            className="flex w-full items-center justify-center py-2 text-sm text-sky-500 hover:bg-sky-500/10 hover:text-white cursor-pointer"
          >
            {conversations.length > 0
              ? 'Xem tất cả tin nhắn'
              : 'Bắt đầu cuộc trò chuyện mới'}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
