import { useAuth } from "@clerk/expo";
import {
  type ConversationDTO,
  type ConversationWithParticipantsDTO,
  type CursorPageResponse,
  type MessageDTO,
  normalizeConversation,
  normalizeMessage,
  queryKeys,
} from "@repo/shared";
import { type InfiniteData, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";

import {
  compareMessagesAscending,
  getConversationLastActivity,
  getConversationLastSeenMap,
} from "~/components/chat/chat-helpers";
import { clearChatThreadNotification } from "~/lib/notifications/chat-thread-notifications";
import { useSocket } from "~/providers/socket-provider";

type NativeChatRealtimeProviderProps = {
  children: React.ReactNode;
};

type ConversationPageData = InfiniteData<CursorPageResponse<ConversationDTO>>;
type MessagePages = InfiniteData<CursorPageResponse<MessageDTO>>;

const sortConversations = (conversations: ConversationDTO[]) => {
  return [...conversations].sort(
    (a, b) =>
      getConversationLastActivity(b).getTime() -
      getConversationLastActivity(a).getTime(),
  );
};

const upsertConversationList = (
  oldData: ConversationPageData | undefined,
  conversation: ConversationDTO,
) => {
  if (!oldData?.pages?.length) {
    return oldData;
  }

  const allItems = oldData.pages.flatMap((page) => page.data);
  const nextItems = sortConversations([
    conversation,
    ...allItems.filter((item) => item._id !== conversation._id),
  ]);

  let cursor = 0;

  return {
    ...oldData,
    pages: oldData.pages.map((page) => {
      const nextPageItems = nextItems.slice(cursor, cursor + page.data.length);
      cursor += page.data.length;

      return {
        ...page,
        data: nextPageItems,
      };
    }),
  };
};

const removeConversationFromList = (
  oldData: ConversationPageData | undefined,
  conversationId: string,
) => {
  if (!oldData?.pages?.length) {
    return oldData;
  }

  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      data: page.data.filter(
        (conversation) => conversation._id !== conversationId,
      ),
    })),
  };
};

const updateConversationMessage = (
  oldData: ConversationPageData | undefined,
  message: MessageDTO,
) => {
  if (!oldData?.pages?.length) {
    return oldData;
  }

  const allItems = oldData.pages.flatMap((page) => page.data);
  const hasConversation = allItems.some(
    (conversation) => conversation._id === message.conversationId,
  );

  if (!hasConversation) {
    return oldData;
  }

  const nextItems = sortConversations(
    allItems.map((conversation) =>
      conversation._id === message.conversationId
        ? {
            ...conversation,
            lastMessage: message,
            updatedAt: message.createdAt,
          }
        : conversation,
    ),
  );

  let cursor = 0;

  return {
    ...oldData,
    pages: oldData.pages.map((page) => {
      const nextPageItems = nextItems.slice(cursor, cursor + page.data.length);
      cursor += page.data.length;

      return {
        ...page,
        data: nextPageItems,
      };
    }),
  };
};

const updateConversationReadState = (
  oldData: ConversationPageData | undefined,
  payload: {
    conversationId: string;
    userId: string;
    lastSeenMessageId: string | null;
  },
) => {
  if (!oldData?.pages?.length) {
    return oldData;
  }

  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      data: page.data.map((conversation) => {
        if (conversation._id !== payload.conversationId) {
          return conversation;
        }

        const lastSeenMessageId = getConversationLastSeenMap(
          conversation.lastSeenMessageId as never,
        );

        if (payload.lastSeenMessageId) {
          lastSeenMessageId.set(payload.userId, payload.lastSeenMessageId);
        } else {
          lastSeenMessageId.delete(payload.userId);
        }

        return {
          ...conversation,
          lastSeenMessageId,
        };
      }),
    })),
  };
};

const mergeFetchedAndRealtimeMessages = (
  fetchedMessages: MessageDTO[],
  realtimeMessages: MessageDTO[],
) => {
  const map = new Map<string, MessageDTO>();
  const fetchedIds = new Set<string>();

  fetchedMessages.forEach((message) => {
    fetchedIds.add(message._id);
    map.set(message._id, message);
  });

  realtimeMessages.forEach((message) => {
    if (fetchedIds.has(message._id)) {
      return;
    }

    if (message.clientStatus === "sending") {
      return;
    }

    map.set(message._id, message);
  });

  return Array.from(map.values()).sort(
    compareMessagesAscending,
  );
};

const upsertMessageInPages = (
  oldData: MessagePages | undefined,
  message: MessageDTO,
) => {
  if (!oldData?.pages?.length) {
    return oldData;
  }

  const firstPage = oldData.pages[0];
  const existingIndex = firstPage.data.findIndex((item) => item._id === message._id);

  const nextFirstPage =
    existingIndex >= 0
      ? {
          ...firstPage,
          data: firstPage.data
            .map((item) => (item._id === message._id ? message : item))
            .sort((a, b) => compareMessagesAscending(b, a)),
        }
      : {
          ...firstPage,
          data: [...firstPage.data, message].sort((a, b) => compareMessagesAscending(b, a)),
        };

  return {
    ...oldData,
    pages: [nextFirstPage, ...oldData.pages.slice(1)],
  };
};

const markDeletedMessageInPages = (
  oldData: MessagePages | undefined,
  messageId: string,
) => {
  if (!oldData?.pages?.length) {
    return oldData;
  }

  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      data: page.data.map((message) =>
        message._id === messageId
          ? { ...message, isDeleted: true }
          : message,
      ),
    })),
  };
};

const syncConversationDetailReadState = (
  queryClient: ReturnType<typeof useQueryClient>,
  payload: {
    conversationId: string;
    userId: string;
    lastSeenMessageId: string | null;
  },
) => {
  queryClient.setQueryData<ConversationWithParticipantsDTO>(
    queryKeys.conversations.detail(payload.conversationId),
    (oldConversation) => {
      if (!oldConversation) {
        return oldConversation;
      }

      const lastSeenMessageId = getConversationLastSeenMap(
        oldConversation.lastSeenMessageId as never,
      );

      if (payload.lastSeenMessageId) {
        lastSeenMessageId.set(payload.userId, payload.lastSeenMessageId);
      } else {
        lastSeenMessageId.delete(payload.userId);
      }

      return {
        ...oldConversation,
        lastSeenMessageId,
      };
    },
  );
};

const syncConversationDetailLastMessage = (
  queryClient: ReturnType<typeof useQueryClient>,
  message: MessageDTO,
) => {
  queryClient.setQueryData<ConversationWithParticipantsDTO>(
    queryKeys.conversations.detail(message.conversationId),
    (oldConversation) =>
      oldConversation
        ? {
            ...oldConversation,
            lastMessage: message,
            updatedAt: message.createdAt,
          }
        : oldConversation,
  );
};

type UseNativeConversationRealtimeParams = {
  conversationId?: string | null;
  isHiddenForMe?: boolean;
  fetchedMessages: MessageDTO[];
  markConversationAsRead: (conversationId: string) => void;
};

export function useNativeConversationRealtime({
  conversationId,
  isHiddenForMe = false,
  fetchedMessages,
  markConversationAsRead,
}: UseNativeConversationRealtimeParams) {
  const queryClient = useQueryClient();
  const { chatSocket } = useSocket();
  const [realtimeMessages, setRealtimeMessages] = React.useState<MessageDTO[]>(
    [],
  );

  const messages = React.useMemo(
    () => mergeFetchedAndRealtimeMessages(fetchedMessages, realtimeMessages),
    [fetchedMessages, realtimeMessages],
  );

  React.useEffect(() => {
    setRealtimeMessages([]);
  }, [conversationId]);

  React.useEffect(() => {
    if (!conversationId || !chatSocket || isHiddenForMe) {
      return undefined;
    }

    void clearChatThreadNotification(conversationId).catch((error) => {
      console.warn(
        "[notifications] Failed to clear chat thread notification on focus:",
        error,
      );
    });

    chatSocket.emit("conversation.join", { conversationId });

    return () => {
      chatSocket.emit("conversation.leave", { conversationId });
    };
  }, [chatSocket, conversationId, isHiddenForMe]);

  React.useEffect(() => {
    if (!chatSocket || !conversationId || isHiddenForMe) {
      return;
    }

    const handleUpdated = (payload: ConversationDTO) => {
      if (payload._id !== conversationId) {
        return;
      }

      const normalized = normalizeConversation(payload as never);

      queryClient.setQueryData<ConversationWithParticipantsDTO>(
        queryKeys.conversations.detail(conversationId),
        (oldConversation) =>
          oldConversation
            ? {
                ...oldConversation,
                ...normalized,
                participantDetails: Array.isArray(
                  oldConversation.participantDetails,
                )
                  ? oldConversation.participantDetails
                  : [],
              }
            : oldConversation,
      );
    };

    const handleDeleted = (payload: { id: string }) => {
      if (payload.id !== conversationId) {
        return;
      }

      queryClient.removeQueries({
        queryKey: queryKeys.conversations.detail(conversationId),
      });
      router.replace("/chat");
    };

    const handleLeft = (payload: { conversationId: string }) => {
      if (payload.conversationId !== conversationId) {
        return;
      }

      queryClient.removeQueries({
        queryKey: queryKeys.conversations.detail(conversationId),
      });
      router.replace("/chat");
    };

    const handleRead = (payload: {
      conversationId: string;
      userId: string;
      lastSeenMessageId: string | null;
    }) => {
      if (payload.conversationId !== conversationId) {
        return;
      }

      syncConversationDetailReadState(queryClient, payload);

      queryClient.setQueriesData<ConversationPageData>(
        { queryKey: queryKeys.conversations.all },
        (oldData) => updateConversationReadState(oldData, payload),
      );
    };

    chatSocket.on("conversation.updated", handleUpdated);
    chatSocket.on("conversation.deleted", handleDeleted);
    chatSocket.on("conversation.read", handleRead);
    chatSocket.on("conversation.memberLeft", handleLeft);

    return () => {
      chatSocket.off("conversation.updated", handleUpdated);
      chatSocket.off("conversation.deleted", handleDeleted);
      chatSocket.off("conversation.read", handleRead);
      chatSocket.off("conversation.memberLeft", handleLeft);
    };
  }, [chatSocket, conversationId, isHiddenForMe, queryClient]);

  React.useEffect(() => {
    if (!chatSocket || !conversationId || isHiddenForMe) {
      return;
    }

    const handleNew = (payload: MessageDTO) => {
      const message = normalizeMessage(payload as never);

      if (message.conversationId !== conversationId) {
        return;
      }

      setRealtimeMessages((current) => {
        if (current.some((item) => item._id === message._id)) {
          return current;
        }

        return [...current, message].sort(compareMessagesAscending);
      });

      queryClient.setQueriesData<MessagePages>(
        { queryKey: queryKeys.messages.list(conversationId) },
        (oldData) => upsertMessageInPages(oldData, message),
      );

      syncConversationDetailLastMessage(queryClient, message);
    };

    const handleDeleted = (payload: MessageDTO | { messageId: string }) => {
      const messageId =
        "messageId" in payload ? payload.messageId : payload?._id;

      if (!messageId) {
        return;
      }

      setRealtimeMessages((current) =>
        current.map((message) =>
          message._id === messageId
            ? message.isDeleted
              ? message
              : { ...message, isDeleted: true }
            : message,
        ),
      );

      queryClient.setQueriesData<MessagePages>(
        { queryKey: queryKeys.messages.list(conversationId) },
        (oldData) => markDeletedMessageInPages(oldData, messageId),
      );
    };

    chatSocket.on("message.new", handleNew);
    chatSocket.on("message.deleted", handleDeleted);

    return () => {
      chatSocket.off("message.new", handleNew);
      chatSocket.off("message.deleted", handleDeleted);
    };
  }, [chatSocket, conversationId, isHiddenForMe, queryClient]);

  const handleReachedBottom = React.useCallback(() => {
    if (!conversationId) {
      return;
    }

    const lastMessageId = messages.at(-1)?._id;

    if (!lastMessageId || lastMessageId.startsWith("temp:")) {
      return;
    }

    void clearChatThreadNotification(conversationId).catch((error) => {
      console.warn(
        "[notifications] Failed to clear chat thread notification on read:",
        error,
      );
    });
    markConversationAsRead(conversationId);
  }, [conversationId, markConversationAsRead, messages]);

  return {
    messages,
    handleReachedBottom,
  };
}

export function NativeChatRealtimeProvider({
  children,
}: NativeChatRealtimeProviderProps) {
  const queryClient = useQueryClient();
  const { isSignedIn } = useAuth();
  const { chatSocket } = useSocket();

  React.useEffect(() => {
    if (!chatSocket || !isSignedIn) {
      return;
    }

    const syncConversation = (payload: ConversationDTO) => {
      const conversation = normalizeConversation(payload as never);

      queryClient.setQueryData<ConversationWithParticipantsDTO | ConversationDTO>(
        queryKeys.conversations.detail(conversation._id),
        (oldConversation) => {
          if (
            oldConversation &&
            "participantDetails" in oldConversation &&
            Array.isArray(oldConversation.participantDetails)
          ) {
            return {
              ...oldConversation,
              ...conversation,
              participantDetails: oldConversation.participantDetails,
            };
          }

          return conversation;
        },
      );

      queryClient.setQueriesData<ConversationPageData>(
        { queryKey: queryKeys.conversations.all },
        (oldData) => upsertConversationList(oldData, conversation),
      );
    };

    const syncConversationMessage = (payload: MessageDTO) => {
      const message = normalizeMessage(payload as never);

      queryClient.setQueryData<ConversationDTO>(
        queryKeys.conversations.detail(message.conversationId),
        (oldConversation) =>
          oldConversation
            ? {
                ...oldConversation,
                lastMessage: message,
                updatedAt: message.createdAt,
              }
            : oldConversation,
      );

      queryClient.setQueriesData<ConversationPageData>(
        { queryKey: queryKeys.conversations.all },
        (oldData) => updateConversationMessage(oldData, message),
      );
    };

    const syncConversationReadState = (payload: {
      conversationId: string;
      userId: string;
      lastSeenMessageId: string | null;
    }) => {
      if (!payload?.conversationId || !payload.userId) {
        return;
      }

      queryClient.setQueryData<ConversationDTO>(
        queryKeys.conversations.detail(payload.conversationId),
        (oldConversation) => {
          if (!oldConversation) {
            return oldConversation;
          }

          const lastSeenMessageId = getConversationLastSeenMap(
            oldConversation.lastSeenMessageId as never,
          );

          if (payload.lastSeenMessageId) {
            lastSeenMessageId.set(payload.userId, payload.lastSeenMessageId);
          } else {
            lastSeenMessageId.delete(payload.userId);
          }

          return {
            ...oldConversation,
            lastSeenMessageId,
          };
        },
      );

      queryClient.setQueriesData<ConversationPageData>(
        { queryKey: queryKeys.conversations.all },
        (oldData) => updateConversationReadState(oldData, payload),
      );
    };

    const removeConversation = (conversationId: string) => {
      queryClient.removeQueries({
        queryKey: queryKeys.conversations.detail(conversationId),
      });

      queryClient.setQueriesData<ConversationPageData>(
        { queryKey: queryKeys.conversations.all },
        (oldData) => removeConversationFromList(oldData, conversationId),
      );
    };

    const handleConnect = () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all,
      });
    };

    const handleConversationCreated = (payload: ConversationDTO) => {
      syncConversation(payload);
      handleConnect();
    };

    const handleConversationUpdated = (payload: ConversationDTO) => {
      syncConversation(payload);
    };

    const handleConversationDeleted = (payload: string | { id: string }) => {
      const conversationId =
        typeof payload === "string" ? payload : payload?.id;

      if (!conversationId) {
        return;
      }

      removeConversation(conversationId);
    };

    const handleConversationHidden = (payload: { id: string }) => {
      if (!payload?.id) {
        return;
      }

      removeConversation(payload.id);
    };

    const handleConversationUnhidden = (payload: ConversationDTO) => {
      syncConversation(payload);
      handleConnect();
    };

    const handleConversationMemberLeft = (payload: {
      conversationId: string;
    }) => {
      if (!payload?.conversationId) {
        return;
      }

      removeConversation(payload.conversationId);
    };

    const handleMessageNew = (payload: MessageDTO) => {
      syncConversationMessage(payload);
    };

    const handleConversationRead = (payload: {
      conversationId: string;
      userId: string;
      lastSeenMessageId: string | null;
    }) => {
      syncConversationReadState(payload);
    };

    chatSocket.on("connect", handleConnect);
    chatSocket.on("conversation.created", handleConversationCreated);
    chatSocket.on("conversation.updated", handleConversationUpdated);
    chatSocket.on("conversation.memberJoined", handleConversationUpdated);
    chatSocket.on("conversation.deleted", handleConversationDeleted);
    chatSocket.on("conversation.hidden", handleConversationHidden);
    chatSocket.on("conversation.unhidden", handleConversationUnhidden);
    chatSocket.on("conversation.memberLeft", handleConversationMemberLeft);
    chatSocket.on("message.new", handleMessageNew);
    chatSocket.on("conversation.read", handleConversationRead);

    if (chatSocket.connected) {
      handleConnect();
    }

    return () => {
      chatSocket.off("connect", handleConnect);
      chatSocket.off("conversation.created", handleConversationCreated);
      chatSocket.off("conversation.updated", handleConversationUpdated);
      chatSocket.off("conversation.memberJoined", handleConversationUpdated);
      chatSocket.off("conversation.deleted", handleConversationDeleted);
      chatSocket.off("conversation.hidden", handleConversationHidden);
      chatSocket.off("conversation.unhidden", handleConversationUnhidden);
      chatSocket.off("conversation.memberLeft", handleConversationMemberLeft);
      chatSocket.off("message.new", handleMessageNew);
      chatSocket.off("conversation.read", handleConversationRead);
    };
  }, [chatSocket, isSignedIn, queryClient]);

  return <>{children}</>;
}
