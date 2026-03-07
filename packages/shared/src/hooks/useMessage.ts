/**
 * Message and Conversation-related React Query hooks
 * 
 * Platform-agnostic hooks for real-time messaging.
 * Note: Real-time message delivery via WebSocket should be implemented at the platform level.
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { messageService } from '../api/services/message.service';
import { conversationService } from '../api/services/conversation.service';
import { queryKeys } from './query-keys';
import type { MessageDTO, CreateMessageInput } from '../types/message.types';
import type {
  ConversationDTO,
  ConversationWithParticipantsDTO,
  CreateConversationInput,
  UpdateConversationInput,
} from '../types/conversation.types';
import type { CursorPaginatedResponse, QueryParams } from '../types/common.types';
import { ReactionType } from '../types/enums';

// ==================== Conversation Hooks ====================

/**
 * Get conversations list with infinite scroll
 */
export const useConversations = (params?: QueryParams) => {
  return useInfiniteQuery<CursorPaginatedResponse<ConversationDTO>>({
    queryKey: queryKeys.conversations.list(),
    queryFn: ({ pageParam }) =>
      conversationService.getConversations({
        ...params,
        cursor: pageParam as string | undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Get conversation details
 */
export const useConversation = (conversationId: string, options?: { enabled?: boolean }) => {
  return useQuery<ConversationWithParticipantsDTO>({
    queryKey: queryKeys.conversations.detail(conversationId),
    queryFn: () => conversationService.getConversation(conversationId),
    enabled: options?.enabled !== false && !!conversationId,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Get messages for a conversation with infinite scroll
 * Messages are typically sorted in reverse chronological order (newest first)
 */
export const useMessages = (conversationId: string, params?: QueryParams) => {
  return useInfiniteQuery<CursorPaginatedResponse<MessageDTO>>({
    queryKey: queryKeys.messages.list(conversationId),
    queryFn: ({ pageParam }) =>
      messageService.getMessages(conversationId, {
        ...params,
        cursor: pageParam as string | undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    enabled: !!conversationId,
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 5 * 60 * 1000,
  });
};

// ==================== Conversation Mutations ====================

/**
 * Create a new conversation
 */
export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation<ConversationDTO, Error, CreateConversationInput>({
    mutationFn: (input) => conversationService.createConversation(input),
    onSuccess: (newConversation) => {
      // Invalidate conversations list to refetch with new conversation
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.conversations.list() 
      });
      
      // Invalidate detail to fetch full data with participants
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.conversations.detail(newConversation._id) 
      });
    },
  });
};

/**
 * Get or create direct conversation with another user
 */
export const useGetOrCreateDirectConversation = () => {
  const queryClient = useQueryClient();

  return useMutation<ConversationDTO, Error, string>({
    mutationFn: (userId) => conversationService.getOrCreateDirect(userId),
    onSuccess: (conversation) => {
      // Invalidate conversations list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.conversations.list() 
      });
      
      // Invalidate detail to fetch full data
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.conversations.detail(conversation._id) 
      });
    },
  });
};

/**
 * Update conversation (rename, change avatar, etc.)
 */
export const useUpdateConversation = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation<ConversationDTO, Error, UpdateConversationInput>({
    mutationFn: (input) => conversationService.updateConversation(conversationId, input),
    onSuccess: () => {
      // Invalidate conversation detail to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.detail(conversationId),
      });
      
      // Invalidate conversations list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.conversations.list() 
      });
    },
  });
};

/**
 * Leave a conversation
 */
export const useLeaveConversation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (conversationId) => conversationService.leaveConversation(conversationId),
    onSuccess: (_, conversationId) => {
      // Remove conversation from cache
      queryClient.removeQueries({ 
        queryKey: queryKeys.conversations.detail(conversationId) 
      });
      
      // Invalidate conversations list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.conversations.list() 
      });
    },
  });
};

/**
 * Add participants to a conversation
 */
export const useAddParticipants = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string[]>({
    mutationFn: (userIds) => conversationService.addParticipants(conversationId, userIds),
    onSuccess: () => {
      // Invalidate conversation detail to refetch with new participants
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.detail(conversationId),
      });
    },
  });
};

// ==================== Message Mutations ====================

/**
 * Send a message
 */
export const useSendMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation<MessageDTO, Error, CreateMessageInput>({
    mutationFn: (input) => messageService.sendMessage(input),
    onSuccess: (newMessage) => {
      // Add message to cache (prepend to start for reverse chronological order)
      queryClient.setQueriesData<{ pages: CursorPaginatedResponse<MessageDTO>[] }>(
        { queryKey: queryKeys.messages.list(conversationId) },
        (old) => {
          if (!old || old.pages.length === 0) {
            return {
              pages: [{ data: [newMessage], nextCursor: undefined, hasMore: false }],
              pageParams: [undefined],
            };
          }
          
          // Add to first page
          return {
            ...old,
            pages: [
              {
                ...old.pages[0],
                data: [newMessage, ...old.pages[0].data],
              },
              ...old.pages.slice(1),
            ],
          };
        }
      );
      
      // Update conversation's last message
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.conversations.list() 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.conversations.detail(conversationId) 
      });
    },
  });
};

/**
 * Update a message (edit)
 */
export const useUpdateMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation<MessageDTO, Error, { messageId: string; content: string }>({
    mutationFn: ({ messageId, content }) => 
      messageService.updateMessage(messageId, { content }),
    onSuccess: (updatedMessage) => {
      // Update message in cache
      queryClient.setQueriesData<{ pages: CursorPaginatedResponse<MessageDTO>[] }>(
        { queryKey: queryKeys.messages.list(conversationId) },
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((msg) =>
                msg._id === updatedMessage._id ? updatedMessage : msg
              ),
            })),
          };
        }
      );
    },
  });
};

/**
 * Delete a message
 */
export const useDeleteMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (messageId) => messageService.deleteMessage(messageId),
    onSuccess: (_, messageId) => {
      // Remove message from cache
      queryClient.setQueriesData<{ pages: CursorPaginatedResponse<MessageDTO>[] }>(
        { queryKey: queryKeys.messages.list(conversationId) },
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((msg) => msg._id !== messageId),
            })),
          };
        }
      );
      
      // Invalidate conversation to update last message
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.conversations.detail(conversationId) 
      });
    },
  });
};

/**
 * Mark a message as read
 */
export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { conversationId: string; messageId: string }>({
    mutationFn: ({ conversationId, messageId }) => 
      messageService.markAsRead({ conversationId, messageId }),
    onSuccess: (_, { conversationId, messageId }) => {
      // Update message in cache
      queryClient.setQueriesData<{ pages: CursorPaginatedResponse<MessageDTO>[] }>({
        queryKey: queryKeys.messages.list(conversationId) },
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((msg) =>
                msg._id === messageId
                  ? { ...msg, seenBy: [...(msg.seenBy || []), 'current-user'] }
                  : msg
              ),
            })),
          };
        }
      );
      
      // Invalidate conversation to update unread count
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.conversations.detail(conversationId) 
      });
    },
  });
};

/**
 * React to a message
 */
export const useReactToMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { messageId: string; reactionType: ReactionType }>({
    mutationFn: ({ messageId, reactionType }) =>
      messageService.reactToMessage(messageId, reactionType),
    onSuccess: () => {
      // Invalidate messages to refresh reaction
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.messages.list(conversationId) 
      });
    },
  });
};

/**
 * Send typing indicator
 * Note: This should be throttled at the UI level
 */
export const useSendTypingIndicator = () => {
  return useMutation<void, Error, { conversationId: string; isTyping: boolean }>({
    mutationFn: ({ conversationId, isTyping }) =>
      messageService.sendTypingIndicator(conversationId, isTyping),
    // No cache updates needed - this is typically handled via WebSocket
  });
};
