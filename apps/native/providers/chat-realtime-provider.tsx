import { useAuth } from "@clerk/expo";
import {
  type ConversationDTO,
  type CursorPageResponse,
  type MessageDTO,
  normalizeConversation,
  normalizeMessage,
  queryKeys,
} from "@repo/shared";
import { type InfiniteData, useQueryClient } from "@tanstack/react-query";
import React from "react";

import { getConversationLastActivity } from "~/components/chat/chat-helpers";
import { useSocket } from "~/providers/socket-provider";

type NativeChatRealtimeProviderProps = {
  children: React.ReactNode;
};

type ConversationPageData = InfiniteData<CursorPageResponse<ConversationDTO>>;

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

        const lastSeenMessageId = new Map(conversation.lastSeenMessageId);

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

      queryClient.setQueryData(
        queryKeys.conversations.detail(conversation._id),
        conversation,
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

          const lastSeenMessageId = new Map(oldConversation.lastSeenMessageId);

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
