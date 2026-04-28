/**
 * Chatbot-related React Query hooks
 *
 * Platform-agnostic hooks for assistant/chatbot endpoints.
 */

import { useCallback, useMemo, useRef, useState } from 'react';
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
export const useAssistantHistory = (
  userId: string,
  pageSize?: number,
  enabled = true,
) => {
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
    enabled: enabled && !!userId,
  });
};

/**
 * Send a message to assistant/chatbot.
 */
export const useAssistantRespond = () => {
  return useMutation<AssistantRespondDataDTO, Error, AssistantMessageInput>({
    mutationFn: (input) => chatbotService.respond(input),
    retry: false,
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
  enabled?: boolean;
};

const toMessageTimestamp = (createdAt: string): number => {
  const parsed = Date.parse(createdAt);
  if (Number.isFinite(parsed)) {
    return parsed;
  }

  const numeric = Number(createdAt);
  if (Number.isFinite(numeric)) {
    return numeric < 1e12 ? numeric * 1000 : numeric;
  }

  return Number.NaN;
};

const compareHistoryMessages = (
  a: ChatbotHistoryMessageDTO,
  b: ChatbotHistoryMessageDTO,
) => {
  const aTimestamp = toMessageTimestamp(a.createdAt);
  const bTimestamp = toMessageTimestamp(b.createdAt);
  const aValid = Number.isFinite(aTimestamp);
  const bValid = Number.isFinite(bTimestamp);

  if (aValid && bValid) {
    const timestampDiff = aTimestamp - bTimestamp;
    if (timestampDiff !== 0) {
      return timestampDiff;
    }
  } else if (aValid !== bValid) {
    return aValid ? -1 : 1;
  }

  return a.id.localeCompare(b.id);
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
  const historyEnabled = options?.enabled ?? true;
  const [lastError, setLastError] = useState<Error | null>(null);
  const isSendingMessageRef = useRef(false);
  const historyQueryKey = queryKeys.chatbot.history(userId, historyLimit);

  const historyQuery = useAssistantHistory(userId, historyLimit, historyEnabled);
  const respondMutation = useAssistantRespond();
  const clearMutation = useClearAssistantHistory();

  const historyMessages = useMemo(() => {
    const raw = historyQuery.data?.pages.flatMap((page) => page.data) ?? [];
    return [...raw].sort(compareHistoryMessages);
  }, [historyQuery.data?.pages]);

  const sendMessage = useCallback(
    async (message: string) => {
      const normalizedMessage = message.trim();
      if (
        !normalizedMessage ||
        !userId ||
        respondMutation.isPending ||
        isSendingMessageRef.current
      ) {
        return;
      }

      isSendingMessageRef.current = true;
      setLastError(null);

      const optimisticUserMessage = createLocalHistoryMessage({
        userId,
        role: 'user',
        content: normalizedMessage,
        metadata: {
          source: 'local-pending',
          isPending: true,
        },
      });

      // Always insert local pending at the end (newest message position).
      queryClient.setQueryData<InfiniteData<ChatbotHistoryPageDTO>>(
        historyQueryKey,
        (old) => {
          if (!old) {
            return {
              pages: [
                {
                  data: [optimisticUserMessage],
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
                data: [...firstPage.data, optimisticUserMessage],
              },
              ...old.pages.slice(1),
            ],
          };
        },
      );

      try {
        const result = await respondMutation.mutateAsync({
          message: normalizedMessage,
        });

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

        // Remove pending local then append real messages at the end.
        queryClient.setQueryData<InfiniteData<ChatbotHistoryPageDTO>>(
          historyQueryKey,
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
                    ...firstPage.data.filter(
                      (item) => item.id !== optimisticUserMessage.id,
                    ),
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
          queryKey: historyQueryKey,
        });
      } catch (error) {
        queryClient.setQueryData<InfiniteData<ChatbotHistoryPageDTO>>(
          historyQueryKey,
          (old) => {
            if (!old) {
              return old;
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
                  data: firstPage.data.filter(
                    (item) => item.id !== optimisticUserMessage.id,
                  ),
                },
                ...old.pages.slice(1),
              ],
            };
          },
        );
        setLastError(error as Error);
      } finally {
        isSendingMessageRef.current = false;
      }
    },
    [historyQueryKey, queryClient, respondMutation, userId],
  );

  const clearHistory = useCallback(async () => {
    if (!userId || clearMutation.isPending) {
      return;
    }

    setLastError(null);

    try {
      await clearMutation.mutateAsync({ userId });
    } catch (error) {
      setLastError(error as Error);
    }
  }, [clearMutation, userId]);

  const resetError = useCallback(() => {
    setLastError(null);
    respondMutation.reset();
    clearMutation.reset();
  }, [clearMutation, respondMutation]);

  const retryHistory = useCallback(async () => {
    await historyQuery.refetch();
  }, [historyQuery]);

  const error =
    lastError ??
    historyQuery.error ??
    respondMutation.error ??
    clearMutation.error ??
    null;

  return {
    messages: historyMessages,
    sendMessage,
    clearHistory,
    isLoading: historyQuery.isLoading,
    hasNextPage: historyQuery.hasNextPage,
    isFetchingNextPage: historyQuery.isFetchingNextPage,
    fetchNextPage: historyQuery.fetchNextPage,
    retryHistory,
    isResponding: respondMutation.isPending,
    isClearing: clearMutation.isPending,
    error,
    isHistoryError: historyQuery.isError,
    resetError,
  };
};
