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
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { chatbotService } from '../api/services/chatbot.service';
import { getAssistantMessageActions } from '../navigation/actions';
import { queryKeys } from './query-keys';
import type {
  AssistantProposeAction,
  AssistantRespondDataDTO,
  ChatbotClearHistoryResultDTO,
  ChatbotHistoryPageDTO,
  ChatbotHistoryMessageDTO,
  SurfaceContextDTO,
  AiAssistantPolicy,
} from '../types';

/**
 * Get assistant chat history with cursor pagination.
 */
export const useAssistantHistory = (
  userId: string,
  pageSize?: number,
  conversationId?: string,
  enabled = true,
) => {
  return useInfiniteQuery<ChatbotHistoryPageDTO, Error>({
    queryKey: queryKeys.chatbot.history(userId, pageSize, conversationId),
    queryFn: ({ pageParam }) =>
      chatbotService.getHistory(userId, {
        limit: pageSize,
        cursor: pageParam as string | undefined,
        conversationId,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor ?? undefined : undefined,
    initialPageParam: undefined as string | undefined,
    enabled: enabled && !!userId,
  });
};

/**
 * Manage assistant conversations (multi-session).
 */
export const useAssistantConversations = (
  userId: string,
  limit = 20,
  enabled = true,
) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.chatbot.conversations(userId),
    queryFn: () => chatbotService.getConversations({ limit }),
    enabled: enabled && !!userId,
  });

  const createMutation = useMutation({
    mutationFn: (title?: string) => chatbotService.createConversation(title),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chatbot.conversations(userId),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (conversationId: string) =>
      chatbotService.deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chatbot.conversations(userId),
      });
    },
  });

  return {
    ...query,
    conversations: query.data?.items ?? [],
    totalCount: query.data?.total ?? 0,
    createConversation: createMutation.mutateAsync,
    deleteConversation: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
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
      queryClient.invalidateQueries({
        queryKey: queryKeys.chatbot.conversations(userId),
      });
    },
  });
};

type UseAssistantChatSessionOptions = {
  limit?: number;
  enabled?: boolean;
  surface?: SurfaceContextDTO;
  conversationId?: string;
  aiPolicy?: AiAssistantPolicy | string;
  onConversationCreated?: (newConversationId: string) => void;
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
  conversationId?: string,
): Promise<boolean> => {
  for (let attempt = 0; attempt < HISTORY_PERSISTENCE_CHECK_MAX_ATTEMPTS; attempt += 1) {
    try {
      const page = await chatbotService.getHistory(userId, {
        limit: pageSize,
        conversationId,
      });
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
    conversationId?: string;
    sources?: ChatbotHistoryMessageDTO['sources'];
    metadata?: Record<string, unknown>;
  },
  offsetMs = 0,
): ChatbotHistoryMessageDTO => {
  const timestamp = Date.now() + offsetMs;
  return {
    id: `local:${params.role}:${timestamp}`,
    conversationId: params.conversationId ?? '',
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
 * Supports real-time streaming responses.
 */
export const useAssistantChatSession = (
  userId: string,
  options?: UseAssistantChatSessionOptions,
) => {
  const queryClient = useQueryClient();
  const isNewDraft = options?.conversationId === 'new';
  const historyLimit = options?.limit ?? 20;
  const historyEnabled = (options?.enabled ?? true) && !isNewDraft;
  const [lastError, setLastError] = useState<Error | null>(null);
  const [isSyncingHistory, setIsSyncingHistory] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const isSendingMessageRef = useRef(false);
  const resolvedConversationId = isNewDraft ? undefined : options?.conversationId;

  const historyQueryKey = useMemo(
    () => queryKeys.chatbot.history(userId, historyLimit, isNewDraft ? 'new' : options?.conversationId),
    [userId, historyLimit, options?.conversationId, isNewDraft],
  );

  const historyQuery = useAssistantHistory(
    userId,
    historyLimit,
    resolvedConversationId,
    historyEnabled,
  );
  const clearMutation = useClearAssistantHistory();

  const historyMessages = useMemo(() => {
    if (isNewDraft) return [];
    const raw = historyQuery.data?.pages.flatMap((page) => page.data) ?? [];
    return reconcileHistoryMessages(raw);
  }, [historyQuery.data?.pages, isNewDraft]);

  const sendMessage = useCallback(
    async (message: string, overrideSurface?: SurfaceContextDTO) => {
      const normalizedMessage = message.trim();
      if (
        !normalizedMessage ||
        !userId ||
        isResponding ||
        clearMutation.isPending ||
        isSendingMessageRef.current ||
        isSyncingHistory
      ) {
        return;
      }

      isSendingMessageRef.current = true;
      setIsResponding(true);
      setLastError(null);

      const targetConversationId = isNewDraft ? undefined : options?.conversationId;

      const optimisticUserMessage = createLocalHistoryMessage({
        userId,
        role: 'user',
        content: normalizedMessage,
        conversationId: targetConversationId,
        metadata: {
          source: LOCAL_PENDING_SOURCE,
          isPending: true,
        },
      });

      const assistantMessageId = `local:assistant:${Date.now()}`;
      const optimisticAssistantMessage = createLocalHistoryMessage({
        userId,
        role: 'assistant',
        content: '',
        conversationId: targetConversationId,
        metadata: {
          source: LOCAL_PENDING_SOURCE,
          isPending: true,
        },
      }, 1);
      optimisticAssistantMessage.id = assistantMessageId;

      // Prepend optimistic messages to cache
      queryClient.setQueryData<InfiniteData<ChatbotHistoryPageDTO>>(
        historyQueryKey,
        (old) => {
          if (!old) {
            return {
              pages: [{ data: [optimisticAssistantMessage, optimisticUserMessage], nextCursor: null, hasNextPage: false }],
              pageParams: [undefined],
            };
          }
          const firstPage = old.pages[0];
          return {
            ...old,
            pages: [
              { ...firstPage, data: [optimisticAssistantMessage, optimisticUserMessage, ...firstPage.data] },
              ...old.pages.slice(1),
            ],
          };
        },
      );

      let fullReply = '';
      let lastResult: AssistantRespondDataDTO | null = null;

      try {
        const surface = overrideSurface ?? options?.surface;
        const stream = chatbotService.streamRespond({
          message: normalizedMessage,
          surface,
          conversationId: targetConversationId,
          aiPolicy: options?.aiPolicy,
        });

        for await (const chunk of stream) {
          fullReply += chunk.reply;
          lastResult = chunk;

          // Update assistant message in cache with partial reply
          queryClient.setQueryData<InfiniteData<ChatbotHistoryPageDTO>>(
            historyQueryKey,
            (old) => {
              if (!old) return old;
              return {
                ...old,
                pages: old.pages.map((page, idx) => 
                  idx === 0 
                    ? {
                        ...page,
                        data: page.data.map(msg => 
                          msg.id === assistantMessageId 
                            ? { 
                                ...msg, 
                                content: fullReply, 
                                sources: chunk.sources && chunk.sources.length > 0 ? chunk.sources : msg.sources,
                                metadata: {
                                  ...msg.metadata,
                                  actions: chunk.suggestedActions && chunk.suggestedActions.length > 0 
                                    ? chunk.suggestedActions 
                                    : getAssistantMessageActions(msg.metadata),
                                  cards: chunk.cards && chunk.cards.length > 0
                                    ? chunk.cards
                                    : (msg.metadata as { cards?: unknown })?.cards,
                                  proposals: chunk.proposals && chunk.proposals.length > 0
                                    ? chunk.proposals
                                    : (msg.metadata as { proposals?: unknown })?.proposals,
                                  policyBlocked: chunk.policyBlocked ?? (msg.metadata as { policyBlocked?: boolean })?.policyBlocked,
                                },
                              } 
                            : msg
                        )
                      }
                    : page
                ),
              };
            },
          );
        }

        if (!lastResult) throw new Error('No response from assistant');

        // Mark as finished (isPending: false)
        queryClient.setQueryData<InfiniteData<ChatbotHistoryPageDTO>>(
          historyQueryKey,
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page, idx) => 
                idx === 0 
                  ? {
                      ...page,
                      data: page.data.map(msg => 
                        msg.id === assistantMessageId 
                          ? { 
                              ...msg, 
                              metadata: { 
                                ...msg.metadata, 
                                isPending: false, 
                                source: LOCAL_CACHE_SOURCE,
                                model: lastResult?.model,
                                provider: lastResult?.provider,
                                actions: lastResult?.suggestedActions && lastResult.suggestedActions.length > 0
                                  ? lastResult.suggestedActions
                                  : getAssistantMessageActions(msg.metadata),
                                cards: lastResult?.cards && lastResult.cards.length > 0
                                  ? lastResult.cards
                                  : (msg.metadata as { cards?: unknown })?.cards,
                                proposals: lastResult?.proposals && lastResult.proposals.length > 0
                                  ? lastResult.proposals
                                  : (msg.metadata as { proposals?: unknown })?.proposals,
                                policyBlocked: lastResult?.policyBlocked ?? (msg.metadata as { policyBlocked?: boolean })?.policyBlocked,
                              } 
                            } 
                          : msg.id === optimisticUserMessage.id
                            ? { ...msg, metadata: { ...msg.metadata, isPending: false, source: LOCAL_CACHE_SOURCE } }
                            : msg
                      )
                    }
                  : page
              ),
            };
          },
        );

        if (isNewDraft && lastResult.conversationId && options?.onConversationCreated) {
          options.onConversationCreated(lastResult.conversationId);
        }

        setIsSyncingHistory(true);
        void (async () => {
          try {
            const hasPersistedReply = await waitForAssistantReplyPersistence(
              userId,
              fullReply,
              historyLimit,
              options?.conversationId,
            );
            if (hasPersistedReply) {
              await queryClient.invalidateQueries({ queryKey: historyQueryKey });
            }
            await queryClient.invalidateQueries({
              queryKey: queryKeys.chatbot.conversations(userId),
            });
          } finally {
            setIsSyncingHistory(false);
          }
        })();
      } catch (error) {
        // Rollback on error
        queryClient.setQueryData<InfiniteData<ChatbotHistoryPageDTO>>(
          historyQueryKey,
          (old) => {
            if (!old) return old;
            const firstPage = old.pages[0];
            return {
              ...old,
              pages: [
                {
                  ...firstPage,
                  data: firstPage.data.filter(
                    (item) => item.id !== optimisticUserMessage.id && item.id !== assistantMessageId,
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
        setIsResponding(false);
      }
    },
    [historyLimit, historyQueryKey, isResponding, isSyncingHistory, queryClient, userId, clearMutation.isPending, options?.conversationId, options?.aiPolicy, options?.surface, isNewDraft, options?.onConversationCreated],
  );

  const clearHistory = useCallback(async () => {
    if (
      !userId ||
      clearMutation.isPending ||
      isResponding ||
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
  }, [clearMutation, isResponding, isSyncingHistory, userId]);

  const resetError = useCallback(() => {
    setLastError(null);
    clearMutation.reset();
  }, [clearMutation]);

  const updateProposalStatus = useCallback(
    (
      key: string,
      status: 'idle' | 'executing' | 'success' | 'cancelled' | 'error',
      message?: string,
    ) => {
      queryClient.setQueryData<InfiniteData<ChatbotHistoryPageDTO>>(
        historyQueryKey,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((msg) => {
                const proposals = msg.metadata?.proposals as AssistantProposeAction[] | undefined;
                if (!Array.isArray(proposals)) return msg;

                const hasMatch = proposals.some(
                  (p) => (p.payload.idempotencyKey || p.id) === key,
                );
                if (!hasMatch) return msg;

                const updatedProposals = proposals.map((p) => {
                  if ((p.payload.idempotencyKey || p.id) === key) {
                    return {
                      ...p,
                      payload: {
                        ...p.payload,
                        status,
                        executionResult: {
                          success: status === 'success',
                          message,
                        },
                      },
                    };
                  }
                  return p;
                });

                return {
                  ...msg,
                  metadata: {
                    ...msg.metadata,
                    proposals: updatedProposals,
                  },
                };
              }),
            })),
          };
        },
      );
    },
    [historyQueryKey, queryClient],
  );

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
    isResponding,
    isClearing: clearMutation.isPending,
    error,
    isHistoryError: historyQuery.isError,
    resetError,
    updateProposalStatus,
  };
};

