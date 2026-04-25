/**
 * Chatbot-related React Query hooks
 *
 * Platform-agnostic hooks for assistant/chatbot endpoints.
 */

import { useCallback, useMemo, useState } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { chatbotService } from '../api/services/chatbot.service';
import { queryKeys } from './query-keys';
import type {
  AssistantMessageInput,
  AssistantRespondDataDTO,
  ChatbotClearHistoryResultDTO,
  ChatbotHistoryPageDTO,
  ChatbotHistoryMessageDTO,
} from '../types';

/**
 * Get assistant chat history with cursor pagination.
 */
export const useAssistantHistory = (userId: string, pageSize?: number) => {
  return useInfiniteQuery<ChatbotHistoryPageDTO, Error>({
    queryKey: queryKeys.chatbot.history(userId, pageSize),
    queryFn: ({ pageParam }) =>
      chatbotService.getHistory(userId, {
        limit: pageSize,
        cursor: pageParam as string | undefined,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor ?? undefined : undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!userId,
  });
};

/**
 * Send a message to assistant/chatbot.
 */
export const useAssistantRespond = () => {
  return useMutation<AssistantRespondDataDTO, Error, AssistantMessageInput>({
    mutationFn: (input) => chatbotService.respond(input),
  });
};

/**
 * Clear assistant chat history and invalidate cached history query.
 */
export const useClearAssistantHistory = () => {
  const queryClient = useQueryClient();

  return useMutation<ChatbotClearHistoryResultDTO, Error, { userId: string }>({
    mutationFn: ({ userId }) => chatbotService.clearHistory(userId),
    onSuccess: (_result, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chatbot.history(userId),
      });
    },
  });
};

type UseAssistantChatSessionOptions = {
  limit?: number;
};

const createLocalHistoryMessage = (
  params: {
    userId: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: ChatbotHistoryMessageDTO['sources'];
    metadata?: Record<string, unknown>;
  },
  offsetMs = 0,
): ChatbotHistoryMessageDTO => {
  const timestamp = Date.now() + offsetMs;
  return {
    id: `local:${params.role}:${timestamp}`,
    conversationId: '',
    userId: params.userId,
    role: params.role,
    content: params.content,
    intent: null,
    sources: params.sources ?? [],
    metadata: params.metadata ?? {},
    createdAt: new Date(timestamp).toISOString(),
  };
};

/**
 * High-level assistant chat session hook.
 * Encapsulates history query, send/clear mutations, and optimistic cache update.
 */
export const useAssistantChatSession = (
  userId: string,
  options?: UseAssistantChatSessionOptions,
) => {
  const queryClient = useQueryClient();
  const historyLimit = options?.limit ?? 20;
  const [pendingMessage, setPendingMessage] =
    useState<ChatbotHistoryMessageDTO | null>(null);

  const historyQuery = useAssistantHistory(userId, historyLimit);
  const respondMutation = useAssistantRespond();
  const clearMutation = useClearAssistantHistory();

  const historyMessages = useMemo(() => {
    const raw = historyQuery.data?.pages.flatMap((page) => page.data) ?? [];
    return [...raw].sort(
      (a, b) =>
        (Date.parse(a.createdAt) || 0) - (Date.parse(b.createdAt) || 0),
    );
  }, [historyQuery.data?.pages]);

  const messages = useMemo(() => {
    if (!pendingMessage) {
      return historyMessages;
    }
    return [...historyMessages, pendingMessage];
  }, [historyMessages, pendingMessage]);

  const sendMessage = useCallback(
    async (message: string) => {
      const normalizedMessage = message.trim();
      if (!normalizedMessage || !userId || respondMutation.isPending) {
        return;
      }

      setPendingMessage(
        createLocalHistoryMessage({
          userId,
          role: 'user',
          content: normalizedMessage,
          metadata: {
            source: 'local-pending',
            isPending: true,
          },
        }),
      );

      try {
        const result = await respondMutation.mutateAsync({
          message: normalizedMessage,
        });
        setPendingMessage(null);

        const userHistoryMessage = createLocalHistoryMessage(
          {
            userId,
            role: 'user',
            content: normalizedMessage,
            metadata: { source: 'local-cache' },
          },
          0,
        );
        const assistantHistoryMessage = createLocalHistoryMessage(
          {
            userId,
            role: 'assistant',
            content: result.reply,
            sources: result.sources ?? [],
            metadata: {
              source: 'local-cache',
              model: result.model,
              provider: result.provider,
            },
          },
          1,
        );

        queryClient.setQueryData<InfiniteData<ChatbotHistoryPageDTO>>(
          queryKeys.chatbot.history(userId, historyLimit),
          (old) => {
            if (!old) {
              return {
                pages: [
                  {
                    data: [userHistoryMessage, assistantHistoryMessage],
                    nextCursor: null,
                    hasNextPage: false,
                  },
                ],
                pageParams: [undefined],
              };
            }

            const firstPage = old.pages[0] ?? {
              data: [],
              nextCursor: null,
              hasNextPage: false,
            };

            return {
              ...old,
              pages: [
                {
                  ...firstPage,
                  data: [
                    ...firstPage.data,
                    userHistoryMessage,
                    assistantHistoryMessage,
                  ],
                },
                ...old.pages.slice(1),
              ],
            };
          },
        );

        void queryClient.invalidateQueries({
          queryKey: queryKeys.chatbot.history(userId, historyLimit),
        });
      } catch (error) {
        setPendingMessage(null);
        throw error;
      }
    },
    [historyLimit, queryClient, respondMutation, userId],
  );

  const clearHistory = useCallback(async () => {
    if (!userId || clearMutation.isPending) {
      return;
    }

    await clearMutation.mutateAsync({ userId });
    setPendingMessage(null);
  }, [clearMutation, userId]);

  return {
    messages,
    sendMessage,
    clearHistory,
    isLoading: historyQuery.isLoading,
    hasNextPage: historyQuery.hasNextPage,
    isFetchingNextPage: historyQuery.isFetchingNextPage,
    fetchNextPage: historyQuery.fetchNextPage,
    isResponding: respondMutation.isPending,
    isClearing: clearMutation.isPending,
  };
};
