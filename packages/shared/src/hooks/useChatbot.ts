"use client";

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

const LOCAL_CACHE_SOURCE = 'local-cache';
const LOCAL_PENDING_SOURCE = 'local-pending';
const LOCAL_RECONCILE_WINDOW_MS = 2 * 60 * 1000;
const LOCAL_RECONCILE_CLOCK_SKEW_MS = 5 * 1000;
const HISTORY_PERSISTENCE_CHECK_MAX_ATTEMPTS = 5;
const HISTORY_PERSISTENCE_CHECK_DELAY_MS = 350;

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

const normalizeMessageContent = (content: string): string => {
  return content.trim().replace(/\s+/g, ' ');
};

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const getMessageSource = (
  message: ChatbotHistoryMessageDTO,
): string | undefined => {
  const source = message.metadata?.source;
  return typeof source === 'string' ? source : undefined;
};

const isLocalMessage = (message: ChatbotHistoryMessageDTO): boolean => {
  return message.id.startsWith('local:');
};

const hasMatchingServerMessage = (
  localMessage: ChatbotHistoryMessageDTO,
  serverMessages: ChatbotHistoryMessageDTO[],
): boolean => {
  const localTimestamp = toMessageTimestamp(localMessage.createdAt);
  const localContent = normalizeMessageContent(localMessage.content);

  return serverMessages.some((serverMessage) => {
    if (serverMessage.role !== localMessage.role) {
      return false;
    }

    if (normalizeMessageContent(serverMessage.content) !== localContent) {
      return false;
    }

    const serverTimestamp = toMessageTimestamp(serverMessage.createdAt);
    if (!Number.isFinite(localTimestamp) || !Number.isFinite(serverTimestamp)) {
      return true;
    }

    // Do not match with an older server row when user sends the same text again.
    if (serverTimestamp + LOCAL_RECONCILE_CLOCK_SKEW_MS < localTimestamp) {
      return false;
    }

    return Math.abs(serverTimestamp - localTimestamp) <= LOCAL_RECONCILE_WINDOW_MS;
  });
};

const reconcileHistoryMessages = (
  rawMessages: ChatbotHistoryMessageDTO[],
): ChatbotHistoryMessageDTO[] => {
  // Backend pages are newest -> oldest. Keep that invariant for cache operations,
  // then reverse once for UI (oldest -> newest).
  const uniqueNewestFirst: ChatbotHistoryMessageDTO[] = [];
  const seenIds = new Set<string>();

  for (const message of rawMessages) {
    if (seenIds.has(message.id)) {
      continue;
    }

    seenIds.add(message.id);
    uniqueNewestFirst.push(message);
  }

  const serverMessages = uniqueNewestFirst.filter(
    (message) => !isLocalMessage(message),
  );
  const reconciledNewestFirst = uniqueNewestFirst.filter((message) => {
    if (!isLocalMessage(message)) {
      return true;
    }

    const source = getMessageSource(message);
    if (source !== LOCAL_CACHE_SOURCE && source !== LOCAL_PENDING_SOURCE) {
      return true;
    }

    if (source === LOCAL_PENDING_SOURCE) {
      return true;
    }

    return !hasMatchingServerMessage(message, serverMessages);
  });

  return [...reconciledNewestFirst].reverse();
};

const hasPersistedAssistantReply = (
  serverMessages: ChatbotHistoryMessageDTO[],
  reply: string,
): boolean => {
  const normalizedReply = normalizeMessageContent(reply);
  return serverMessages.some((message) => {
    return (
      message.role === 'assistant' &&
      normalizeMessageContent(message.content) === normalizedReply
    );
  });
};

const waitForAssistantReplyPersistence = async (
  userId: string,
  reply: string,
  pageSize: number,
): Promise<boolean> => {
  for (let attempt = 0; attempt < HISTORY_PERSISTENCE_CHECK_MAX_ATTEMPTS; attempt += 1) {
    try {
      const page = await chatbotService.getHistory(userId, { limit: pageSize });
      if (hasPersistedAssistantReply(page.data, reply)) {
        return true;
      }
    } catch {
      // Ignore transient check errors and continue retrying.
    }

    if (attempt < HISTORY_PERSISTENCE_CHECK_MAX_ATTEMPTS - 1) {
      await sleep(HISTORY_PERSISTENCE_CHECK_DELAY_MS);
    }
  }

  return false;
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
  const [isSyncingHistory, setIsSyncingHistory] = useState(false);
  const isSendingMessageRef = useRef(false);
  const historyQueryKey = queryKeys.chatbot.history(userId, historyLimit);

  const historyQuery = useAssistantHistory(userId, historyLimit, historyEnabled);
  const respondMutation = useAssistantRespond();
  const clearMutation = useClearAssistantHistory();

  const historyMessages = useMemo(() => {
    const raw = historyQuery.data?.pages.flatMap((page) => page.data) ?? [];
    return reconcileHistoryMessages(raw);
  }, [historyQuery.data?.pages]);

  const sendMessage = useCallback(
    async (message: string) => {
      const normalizedMessage = message.trim();
      if (
        !normalizedMessage ||
        !userId ||
        respondMutation.isPending ||
        clearMutation.isPending ||
        isSendingMessageRef.current ||
        isSyncingHistory
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
          source: LOCAL_PENDING_SOURCE,
          isPending: true,
        },
      });

      // Keep cache order as newest -> oldest (same as backend).
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
                data: [optimisticUserMessage, ...firstPage.data],
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

        const confirmedUserMessage: ChatbotHistoryMessageDTO = {
          ...optimisticUserMessage,
          metadata: {
            ...optimisticUserMessage.metadata,
            source: LOCAL_CACHE_SOURCE,
            isPending: false,
          },
        };
        const assistantHistoryMessage = createLocalHistoryMessage(
          {
            userId,
            role: 'assistant',
            content: result.reply,
            sources: result.sources ?? [],
            metadata: {
              source: LOCAL_CACHE_SOURCE,
              model: result.model,
              provider: result.provider,
            },
          },
          1,
        );

        // Remove pending local then prepend latest assistant/user into newest-first cache.
        queryClient.setQueryData<InfiniteData<ChatbotHistoryPageDTO>>(
          historyQueryKey,
          (old) => {
            if (!old) {
              return {
                pages: [
                  {
                    data: [assistantHistoryMessage, confirmedUserMessage],
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
                  data: (() => {
                    const withoutPending = firstPage.data.filter(
                      (item) => item.id !== optimisticUserMessage.id,
                    );
                    const hadPending = firstPage.data.some(
                      (item) => item.id === optimisticUserMessage.id,
                    );
                    return hadPending
                      ? [
                          assistantHistoryMessage,
                          confirmedUserMessage,
                          ...withoutPending,
                        ]
                      : [assistantHistoryMessage, confirmedUserMessage, ...withoutPending];
                  })(),
                },
                ...old.pages.slice(1),
              ],
            };
          },
        );

        setIsSyncingHistory(true);
        void (async () => {
          try {
            const hasPersistedReply = await waitForAssistantReplyPersistence(
              userId,
              result.reply,
              historyLimit,
            );
            if (!hasPersistedReply) {
              return;
            }

            await queryClient.invalidateQueries({
              queryKey: historyQueryKey,
            });
          } finally {
            setIsSyncingHistory(false);
          }
        })();
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
    [
      clearMutation.isPending,
      historyLimit,
      historyQueryKey,
      isSyncingHistory,
      queryClient,
      respondMutation,
      userId,
    ],
  );

  const clearHistory = useCallback(async () => {
    if (
      !userId ||
      clearMutation.isPending ||
      respondMutation.isPending ||
      isSyncingHistory
    ) {
      return;
    }

    setLastError(null);

    try {
      await clearMutation.mutateAsync({ userId });
    } catch (error) {
      setLastError(error as Error);
    }
  }, [clearMutation, isSyncingHistory, respondMutation.isPending, userId]);

  const resetError = useCallback(() => {
    setLastError(null);
    respondMutation.reset();
    clearMutation.reset();
  }, [clearMutation, respondMutation]);

  const retryHistory = useCallback(async () => {
    await historyQuery.refetch();
  }, [historyQuery]);
  const refreshHistory = useCallback(async () => {
    setLastError(null);
    await historyQuery.refetch();
  }, [historyQuery]);
  const isRefreshingHistory =
    historyQuery.isRefetching &&
    !historyQuery.isFetchingNextPage &&
    !historyQuery.isLoading;

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
    refreshHistory,
    isRefreshingHistory,
    isSyncingHistory,
    isResponding: respondMutation.isPending,
    isClearing: clearMutation.isPending,
    error,
    isHistoryError: historyQuery.isError,
    resetError,
  };
};

