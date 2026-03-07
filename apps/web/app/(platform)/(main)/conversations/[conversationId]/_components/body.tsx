'use client';

import { useAuth } from '@clerk/nextjs';
import { format, isToday, isYesterday } from 'date-fns';
import { vi as viVN } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useScrollListener } from '@/hooks/use-scroll-listener';

import { ErrorFallback } from '@/components/error-fallback';
import { useSocket } from '@/components/providers/socket-provider';
import { useConversation } from '@/hooks/use-conversation';
import { useDeleteMessage, useGetMessages } from '@/hooks/use-message';
import { MessageDTO } from '@/models/message/messageDTO';
import { ConversationDTO } from '@/models/conversation/conversationDTO';
import { MessageBox } from './message-box';
import { useMarkReadBuffer } from '@/contexts/mark-read-context';
import { useQueryClient } from '@tanstack/react-query';

type BodyProps = {
  lastSeenMap: Map<string, string>;
};

export const Body = ({ lastSeenMap }: BodyProps) => {
  const { userId: currentUserId } = useAuth();
  const { conversationId } = useConversation();
  const { chatSocket } = useSocket();
  const queryClient = useQueryClient();

  const { markRead } = useMarkReadBuffer();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [realtimeMessages, setRealtimeMessages] = useState<MessageDTO[]>([]);
  const [isInitialScrollDone, setIsInitialScrollDone] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const showScrollRef = useRef(false);

  const isAtBottomRef = useRef(true);
  useEffect(() => {
    isAtBottomRef.current = isAtBottom;
  }, [isAtBottom]);
  useEffect(() => {
    showScrollRef.current = showScrollToBottom;
  }, [showScrollToBottom]);

  // detect transition: not-bottom -> bottom
  const prevAtBottomRef = useRef(true);

  const pendingScrollRef = useRef(false);
  const pendingMarkReadRef = useRef(false);
  const prevScrollHeightRef = useRef<number | null>(null);

  const { ref: topRef, inView } = useInView();

  useEffect(() => {
    setRealtimeMessages([]);
    setIsInitialScrollDone(false);
    setIsAtBottom(true);
    setShowScrollToBottom(false);
    isAtBottomRef.current = true;
    prevAtBottomRef.current = true;
    pendingScrollRef.current = false;
    prevScrollHeightRef.current = null;
  }, [conversationId]);

  const {
    data,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGetMessages(conversationId, { limit: 20 });

  /** ----------- MERGE DATA ----------- */
  useEffect(() => {
    if (!data) return;

    const fetched = data.pages.flatMap((p) => p.data);

    setRealtimeMessages((prev) => {
      const map = new Map<string, MessageDTO>();
      const fetchedIds = new Set<string>();

      fetched.forEach((m) => {
        fetchedIds.add(m._id);
        map.set(m._id, m);
      });

      prev.forEach((m) => {
        if (fetchedIds.has(m._id)) return;
        if (m.clientStatus === 'sending') return;
        map.set(m._id, m);
      });

      const merged = Array.from(map.values());
      merged.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      return merged;
    });
  }, [data]);

  /** ----------- INFINITE SCROLL ----------- */
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      const el = scrollContainerRef.current;
      if (el) prevScrollHeightRef.current = el.scrollHeight;
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (!isFetchingNextPage && prevScrollHeightRef.current !== null) {
      const el = scrollContainerRef.current;
      if (!el) return;

      const diff = el.scrollHeight - prevScrollHeightRef.current;
      el.scrollTop += diff;
      prevScrollHeightRef.current = null;
    }
  }, [isFetchingNextPage, realtimeMessages.length]);

  /** ----------- HELPERS ----------- */
  const markLatestAsRead = useCallback(() => {
    if (!conversationId) return;
    const lastId =
      realtimeMessages.length > 0
        ? realtimeMessages[realtimeMessages.length - 1]._id
        : null;
    if (!lastId) return;
    if (lastId.startsWith('temp:')) return;

    // ✅ provider sẽ debounce + gate, nên gọi ở đây OK
    markRead({ conversationId, lastMessageId: lastId });
  }, [conversationId, realtimeMessages, markRead]);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      bottomRef.current?.scrollIntoView({ behavior });
      // chỉ mark read khi user thực sự xuống đáy
      markLatestAsRead();
    },
    [markLatestAsRead]
  );

 
  /** ----------- INITIAL SCROLL ----------- */
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    if (!isInitialScrollDone && realtimeMessages.length > 0) {
      scrollToBottom('auto');
      setIsInitialScrollDone(true);
    }
  }, [isInitialScrollDone, realtimeMessages.length, scrollToBottom]);


  /** ----------- TRACK SCROLL (with passive listener) ----------- */
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const distanceToBottom = scrollHeight - (scrollTop + clientHeight);

    const atBottom = distanceToBottom < 80;
    if (atBottom !== isAtBottomRef.current) {
      setIsAtBottom(atBottom);
    }

    // nếu user vừa kéo từ không-ở-đáy xuống đáy => mark read 1 lần
    if (!prevAtBottomRef.current && atBottom) {
      markLatestAsRead();
    }
    prevAtBottomRef.current = atBottom;

    if (atBottom) setShowScrollToBottom(false);
  }, [markLatestAsRead]);

  // Use passive scroll listener for better performance
  useScrollListener(scrollContainerRef, handleScroll);

  /** ----------- SOCKET HANDLERS ----------- */
  useEffect(() => {
    if (!conversationId || !chatSocket) return;

    const patchConversationCaches = (message: MessageDTO) => {
      const updatedAt = message.createdAt ?? new Date().toISOString();

      queryClient.setQueryData<ConversationDTO>(
        ['conversation', conversationId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            lastMessage: message,
            updatedAt,
          };
        }
      );

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

    const handleNew = (message: MessageDTO) => {
      if (message.conversationId !== conversationId) return;

      setRealtimeMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });

      const isOwn = message.senderId === currentUserId;
      const el = scrollContainerRef.current;
      const distanceToBottom = el
        ? el.scrollHeight - (el.scrollTop + el.clientHeight)
        : 0;
      const atBottomNow = distanceToBottom < 20;

      patchConversationCaches(message);

      // nếu mình gửi hoặc đang ở đáy: đặt cờ để scroll
      if (isOwn || atBottomNow) {
        pendingScrollRef.current = true;

        // nếu là msg của người khác và mình đang ở đáy => mark read (provider debounce)
        if (!isOwn) {
          pendingMarkReadRef.current = true;
        }
      } else {
        setShowScrollToBottom(true);
      }
    };

    const handleDeleted = (payload: MessageDTO | { messageId: string }) => {
      const messageId =
        'messageId' in payload ? payload.messageId : payload?._id;
      if (!messageId) return;
      setRealtimeMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? m.isDeleted
              ? m
              : { ...m, isDeleted: true }
            : m
        )
      );

      if (!('messageId' in payload) && payload?.conversationId) {
        patchConversationCaches({ ...payload, isDeleted: true });
      }
    };

    chatSocket.on('message.new', handleNew);
    chatSocket.on('message.deleted', handleDeleted);

    return () => {
      chatSocket.off('message.new', handleNew);
      chatSocket.off('message.deleted', handleDeleted);
    };
  }, [chatSocket, conversationId, currentUserId, markRead, queryClient]);

  // scroll pending after render
  useEffect(() => {
    if (!pendingScrollRef.current) return;
    pendingScrollRef.current = false;
    scrollToBottom('smooth');
  }, [realtimeMessages.length, scrollToBottom]);

  useEffect(() => {
    if (!pendingMarkReadRef.current) return;
    pendingMarkReadRef.current = false;
    if (!isAtBottomRef.current) return;
    markLatestAsRead();
  }, [realtimeMessages.length, markLatestAsRead]);

  /** ----------- GROUP BY DATE ----------- */
  const groupedMessages = useMemo(() => {
    if (!realtimeMessages.length) return [];

    const groups = new Map<string, MessageDTO[]>();

    realtimeMessages.forEach((msg) => {
      const d = new Date(msg.createdAt);
      const key = format(d, 'yyyy-MM-dd');
      const arr = groups.get(key) ?? [];
      arr.push(msg);
      groups.set(key, arr);
    });

    const sortedKeys = Array.from(groups.keys()).sort();

    return sortedKeys.map((key) => {
      const msgs = (groups.get(key) ?? []).sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      const firstDate = new Date(msgs[0].createdAt);
      let label: string;
      if (isToday(firstDate)) label = 'Hôm nay';
      else if (isYesterday(firstDate)) label = 'Hôm qua';
      else
        label = format(firstDate, "EEEE, dd 'tháng' MM, yyyy", {
          locale: viVN,
        });

      return { dateKey: key, dateLabel: label, messages: msgs };
    });
  }, [realtimeMessages]);

  const lastMessage = useMemo(
    () =>
      realtimeMessages.length > 0
        ? realtimeMessages[realtimeMessages.length - 1]
        : null,
    [realtimeMessages]
  );

  const lastMessageId = useMemo(
    () => (lastMessage ? lastMessage._id : null),
    [lastMessage]
  );

  useEffect(() => {
    if (!lastMessage) return;
    if (
      lastMessage.senderId === currentUserId &&
      lastMessage.clientStatus === 'sending'
    ) {
      scrollToBottom('auto');
    }
  }, [lastMessage, currentUserId, scrollToBottom]);

 

  const { mutate: deleteMutation } = useDeleteMessage();

  const handleDelete = useCallback(
    (messageId: string) => {
      if (!conversationId) return;
      deleteMutation(messageId);

      setRealtimeMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, isDeleted: true } : m))
      );
    },
    [conversationId, deleteMutation]
  );

  /** ----------- LOADING / ERROR / EMPTY ----------- */
  if (isLoading && !data) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <ErrorFallback message={error?.message ?? 'Đã xảy ra lỗi'} />
      </div>
    );
  }

  if (!groupedMessages.length) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <p className="text-gray-500">
          Chưa có tin nhắn nào trong cuộc trò chuyện này.
        </p>
      </div>
    );
  }

  /** ----------- UI ----------- */
  return (
    <div
      ref={scrollContainerRef}
      className="relative flex-1 h-full min-h-0 overflow-y-auto p-2 flex flex-col"
    >
      {isFetchingNextPage && (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
        </div>
      )}

      <div ref={topRef} />
      <div className="flex-1" />

      {groupedMessages.map((group) => (
        <div key={group.dateKey}>
          <div className="my-4 flex items-center justify-center">
            <div className="px-3 py-1 rounded-full bg-gray-200 text-[11px] font-medium text-gray-700">
              {group.dateLabel}
            </div>
          </div>

          {group.messages.map((message) => (
            <MessageBox
              key={message._id}
              data={message}
              lastSeenMap={lastSeenMap}
              isLastMessage={message._id === lastMessageId}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ))}

      <div ref={bottomRef} />

      {showScrollToBottom && (
        <div className="sticky bottom-4 z-20 flex justify-center pointer-events-none">
          <button
            type="button"
            onClick={() => {
              scrollToBottom('smooth');
              setShowScrollToBottom(false);
            }}
            className="pointer-events-auto rounded-full bg-sky-500 px-3 py-1 text-xs font-medium text-white shadow-md hover:bg-sky-600 cursor-pointer"
          >
            Tin nhắn mới
          </button>
        </div>
      )}
    </div>
  );
};
