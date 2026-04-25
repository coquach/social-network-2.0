/**
 * Chatbot-related React Query hooks
 *
 * Platform-agnostic hooks for assistant/chatbot endpoints.
 */

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatbotService } from '../api/services/chatbot.service';
import { queryKeys } from './query-keys';
import type {
  AssistantMessageInput,
  AssistantRespondDataDTO,
  ChatbotClearHistoryResultDTO,
  ChatbotHistoryPageDTO,
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
