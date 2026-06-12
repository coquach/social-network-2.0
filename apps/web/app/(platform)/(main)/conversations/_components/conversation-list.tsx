'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import clsx from 'clsx';
import { MessageCirclePlus, Settings } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

import { ErrorFallback } from '@/components/error-fallback';
import { useSocket } from '@/components/providers/socket-provider';
import { SearchInputBasic } from '@/components/search/search-input-basic';
import { SearchInputWithBack } from '@/components/search/search-input-with-back';
import {
  useConversationNav,
} from '@/hooks/use-conversation-nav';
import { useStartConversation } from '@/hooks/use-start-conversation';
import { UserDTO } from '@/models/user/userDTO';
import {
  ConversationDTO,
  MessageDTO,
  useConversations,
  queryKeys,
} from '@repo/shared';
import { useQueryClient } from '@tanstack/react-query';

import { ConversationBox } from './conversation-box';
import { ConversationSearchOverlay } from './conversation-search-overlay';
import { CreateGroupConversationDialog } from './create-group-chat';
import { ChatSettingsDialog } from './chat-settings-dialog';

export const ConversationList = () => {
  const { chatSocket } = useSocket();
  const { conversationId, isOpen } = useConversationNav();
  const queryClient = useQueryClient();
  const [createGroupChatOpen, setCreateGroupChatOpen] = useState(false);
  const [chatSettingsOpen, setChatSettingsOpen] = useState(false);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useConversations({ limit: 20 });

  const { ref, inView } = useInView();

  const [liveConversations, setLiveConversations] = useState<
    Record<string, ConversationDTO>
  >({});

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

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

      queryClient.setQueriesData(
        { queryKey: queryKeys.conversations.list() },
        (old: any) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: (page.data ?? []).filter(
                (conv: ConversationDTO) => conv._id !== id
              ),
            })),
          };
        }
      );

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
        { queryKey: queryKeys.conversations.list() },
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
    merged.sort((a, b) => {
      const taMsg = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const taUpd = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const ta = Math.max(taMsg, taUpd);

      const tbMsg = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
      const tbUpd = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      const tb = Math.max(tbMsg, tbUpd);

      return tb - ta;
    });

    return merged;
  }, [data, liveConversations]);

  const {
    startConversation,
    isPending: startConversationPending,
  } = useStartConversation();
  const [searchText, setSearchText] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const debounced = useDebouncedCallback((v: string) => {
    setDebouncedQuery(v.trim());
  }, 350);

  const showOverlay = searchText.trim().length > 0;

  const onChangeSearch = (v: string) => {
    setSearchText(v);
    debounced(v);
  };

  const clearSearch = useCallback(() => {
    setSearchText('');
    setDebouncedQuery('');
  }, []);

  const onPickUser = useCallback(
    (user: UserDTO) => {
      startConversation(user.id, {
        onSuccess: () => {
          clearSearch();
        },
      });
    },
    [startConversation, clearSearch]
  );

  return (
    <>
      <CreateGroupConversationDialog
        open={createGroupChatOpen}
        onOpenChange={setCreateGroupChatOpen}
      />
      <ChatSettingsDialog
        open={chatSettingsOpen}
        onOpenChange={setChatSettingsOpen}
      />

      <aside
        className={clsx(
          'fixed top-16 bottom-0 lg:w-100 lg:block overflow-y-auto border-r border-gray-200 bg-white',
          isOpen ? 'hidden' : 'block w-full left-0'
        )}
      >
        <div className="px-5">
          <div className="flex items-center justify-between mb-4 pt-4">
            <p className="text-2xl font-bold text-sky-500">Trò chuyện</p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setChatSettingsOpen(true)}
                className="rounded-full p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                aria-label="Cài đặt thông báo"
              >
                <Settings size={20} />
              </button>
              <button
                type="button"
                onClick={() => setCreateGroupChatOpen(true)}
                className="rounded-full p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                aria-label="Tạo trò chuyện nhóm"
              >
                <MessageCirclePlus size={20} />
              </button>
            </div>
          </div>

          {showOverlay ? (
            <SearchInputWithBack
              className="my-4"
              placeholder="Tìm người nhắn tin..."
              value={searchText}
              onChange={onChangeSearch}
              onBack={clearSearch}
              onClear={clearSearch}
            />
          ) : (
            <SearchInputBasic
              className="my-4"
              placeholder="Tìm người nhắn tin..."
              value={searchText}
              onChange={onChangeSearch}
              onClear={clearSearch}
            />
          )}

          {showOverlay ? (
            <ConversationSearchOverlay
              query={debouncedQuery}
              onPickUser={onPickUser}
              disabled={startConversationPending}
            />
          ) : (
            <div className="space-y-4 pb-6">
              {isLoading &&
                Array.from({ length: 5 }).map((_, index) => (
                  <ConversationBox.Skeleton key={index} />
                ))}

              {isError && (
                <ErrorFallback
                  message={
                    error?.message ?? 'Không tìm thấy danh sách trò chuyện.'
                  }
                />
              )}

              {!isLoading && !isError && allConversations.length === 0 && (
                <div className="w-full h-full flex items-center justify-center p-8 text-neutral-500 text-center">
                  Không có cuộc trò chuyện nào.
                </div>
              )}

              {allConversations.map((conv) => (
                <div
                  key={conv._id}
                  className="transition-all duration-300 ease-in-out transform"
                >
                  <ConversationBox
                    data={conv}
                    selected={conversationId === conv._id}
                  />
                </div>
              ))}

              {isFetchingNextPage && (
                <p className="py-2 text-center text-xs text-muted-foreground">
                  Đang tải thêm...
                </p>
              )}

              <div ref={ref} />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
