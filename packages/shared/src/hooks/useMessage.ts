/**
 * Message-related React Query hooks
 * 
 * Platform-agnostic hooks for real-time messaging.
 * Note: Real-time message delivery via WebSocket should be implemented at the platform level.
 * 
 * For conversation management, see useConversation.ts
 */

import { useMutation, useQueryClient, useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import { messageService } from '../api/services/message.service';
import { queryKeys } from './query-keys';
import type { MessageDTO, CreateMessageInput, AttachmentDTO } from '../types/message.types';
import type { ConversationDTO } from '../types/conversation.types';
import type { CursorPageResponse, QueryParams } from '../types/common.types';
import { ReactionType, MessageStatus, MediaType } from '../types/enums';
import { useAuth } from '../contexts/auth-context';
import { useUploadOptional } from '../contexts/upload-context';
import type { UploadableFile } from '../types/upload.types';
import {
  invalidateQueries,
  cancelQueries,
} from '../utils/cache-utils';
import { queryConfigs } from '../utils/query-configs';

const toAttachmentMimeType = (type: MediaType, mimeType?: string) => {
  if (mimeType?.trim()) {
    return mimeType;
  }

  switch (type) {
    case MediaType.IMAGE:
      return 'image/*';
    case MediaType.VIDEO:
      return 'video/*';
    case MediaType.AUDIO:
      return 'audio/*';
    case MediaType.FILE:
    default:
      return 'application/octet-stream';
  }
};

// ==================== Query Hooks ====================

/**
 * Get messages for a conversation with infinite scroll
 * Messages are typically sorted in reverse chronological order (newest first)
 */
export const useMessages = (conversationId: string, params?: QueryParams) => {
  return useInfiniteQuery<CursorPageResponse<MessageDTO>>({
    queryKey: [...queryKeys.messages.list(conversationId), params ?? {}] as const,
    queryFn: async ({ pageParam }) => {
      // Token injection handled by API client interceptor
      return messageService.getMessages(conversationId, {
        ...params,
        cursor: pageParam as string | undefined,
      });
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    enabled: !!conversationId,
    ...queryConfigs.realtime,
  });
};

// ==================== Message Mutations ====================

/**
 * Send a message with optimistic UI updates and optional file attachments
 * 
 * @param conversationId - The conversation ID
 * 
 * @example
 * const sendMessage = useSendMessage(conversationId);
 * // Send text message
 * sendMessage.mutate({ conversationId, content: 'Hello!' });
 * // Send with files
 * sendMessage.mutate({
 *   conversationId,
 *   content: 'Check this out!',
 *   uploadFiles: [{ file: fileObject, type: MediaType.IMAGE }]
 * });
 */
export const useSendMessage = (conversationId: string) => {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const uploadService = useUploadOptional();

  return useMutation<
    MessageDTO,
    Error,
    CreateMessageInput & { uploadFiles?: UploadableFile[] },
    { tempId: string; conversationId: string }
  >({
    onMutate: async ({ content, uploadFiles }) => {
      // Generate temporary ID for optimistic message
      const tempId = `temp:${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const now = new Date();
      const hasMedia = !!uploadFiles?.length;

      // Create optimistic message
      const optimisticMessage: MessageDTO = {
        _id: tempId,
        senderId: userId ?? 'me',
        conversationId,
        content: content?.trim() || (hasMedia ? 'Đang gửi tệp...' : ''),
        status: MessageStatus.SENT,
        seenBy: userId ? [userId] : [],
        reactionStats: {},
        attachments: [],
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
        clientStatus: 'sending',
      };

      // Add optimistic message to cache      
      queryClient.setQueriesData<InfiniteData<CursorPageResponse<MessageDTO>>>(
        { queryKey: queryKeys.messages.list(conversationId) },
        (old) => {
          if (!old || old.pages.length === 0) {
            return {
              pages: [{
                data: [optimisticMessage],
                nextCursor: undefined,
                hasNextPage: false,
              }],
              pageParams: [undefined],
            };
          }

          // Add to end of first page (newest messages)
          const firstPage = old.pages[0];
          return {
            ...old,
            pages: [
              {
                ...firstPage,
                data: [...firstPage.data, optimisticMessage],
              },
              ...old.pages.slice(1),
            ],
          };
        }
      );

      return { tempId, conversationId };
    },
    mutationFn: async ({ uploadFiles, ...input }) => {
      // Token injection handled by API client interceptor
      let attachments: AttachmentDTO[] = [];

      // Upload files if provided and upload service available
      if (uploadFiles && uploadFiles.length > 0 && uploadService) {
        try {
          const uploadResults = await uploadService.uploadMultiple(uploadFiles, {
            folder: `conversations/${conversationId}/messages`,
            concurrency: 3,
          });

          attachments = uploadResults.map((result) => ({
            url: result.url,
            publicId: result.publicId,
            mimeType: toAttachmentMimeType(result.type, result.mimeType),
            fileName: result.fileName,
            thumbnailUrl: result.thumbnailUrl,
            size: result.size,
          }));
        } catch (uploadError) {
          console.error('File upload failed:', uploadError);
          throw new Error('Failed to upload files. Please try again.');
        }
      }

      // Send message with attachments
      return messageService.sendMessage({
        ...input,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
    },
    onSuccess: (newMessage, _variables, context) => {
      // Replace optimistic message with real message
      queryClient.setQueriesData<InfiniteData<CursorPageResponse<MessageDTO>>>(
        { queryKey: queryKeys.messages.list(newMessage.conversationId) },
        (old) => {
          if (!old) return old;

          const firstPage = old.pages[0];
          
          // Check if real message already exists (avoid duplicates)
          const realMessageExists = firstPage.data.some(
            (message) => message._id === newMessage._id
          );
          if (realMessageExists) {
            return {
              ...old,
              pages: [
                {
                  ...firstPage,
                  data: firstPage.data.filter(
                    (message) => message._id !== context?.tempId
                  ),
                },
                ...old.pages.slice(1),
              ],
            };
          }

          // Replace temp message with real message
          return {
            ...old,
            pages: [
              {
                ...firstPage,
                data: firstPage.data.map((msg) =>
                  msg._id === context?.tempId ? newMessage : msg
                ),
              },
              ...old.pages.slice(1),
            ],
          };
        }
      );

      // Update conversation's last message
      const updatedAt = newMessage.createdAt ?? new Date();
      
      queryClient.setQueryData<ConversationDTO>(
        queryKeys.conversations.detail(newMessage.conversationId),
        (old) => {
          if (!old) return old;
          return { ...old, lastMessage: newMessage as any, updatedAt };
        }
      );

      // Update in conversations list
      queryClient.setQueriesData<InfiniteData<CursorPageResponse<ConversationDTO>>>(
        { queryKey: queryKeys.conversations.all },
        (old) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((conv) =>
                conv._id === newMessage.conversationId
                  ? { ...conv, lastMessage: newMessage as any, updatedAt }
                  : conv
              ),
            })),
          };
        }
      );

      // Invalidate conversations to ensure sync
      invalidateQueries(queryClient, [
        [...queryKeys.conversations.all],
      ]);
    },
    onError: (_error, _variables, context) => {
      // Remove optimistic message on error
      if (context?.conversationId && context?.tempId) {
      queryClient.setQueriesData<InfiniteData<CursorPageResponse<MessageDTO>>>(
        { queryKey: queryKeys.messages.list(context.conversationId) },
        (old) => {
          if (!old) return old;
          return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.filter((m) => m._id !== context.tempId),
              })),
            };
          }
        );
      }
    },
    retry: false, // Don't retry failed message sends automatically
  });
};

/**
 * Update a message (edit content)
 */
export const useUpdateMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation<MessageDTO, Error, { messageId: string; content: string }>({
    mutationFn: async ({ messageId, content }) => {
      // Token injection handled by API client interceptor
      return messageService.updateMessage(messageId, { content });
    },
    onSuccess: (updatedMessage) => {
      // Update message in cache
      queryClient.setQueriesData<InfiniteData<CursorPageResponse<MessageDTO>>>(
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
    mutationFn: async (messageId) => {
      // Token injection handled by API client interceptor
      return messageService.deleteMessage(messageId);
    },
    onMutate: async (messageId) => {
      await cancelQueries(queryClient, [
        [...queryKeys.messages.list(conversationId)],
      ]);
      
      // Optimistically remove message
      queryClient.setQueriesData<InfiniteData<CursorPageResponse<MessageDTO>>>(
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
    },
    onSuccess: () => {
      // Invalidate conversation to update last message
      invalidateQueries(queryClient, [
        [...queryKeys.conversations.detail(conversationId)],
      ]);
    },
    onError: () => {
      // Restore messages on error
      invalidateQueries(queryClient, [
        [...queryKeys.messages.list(conversationId)],
      ]);
    },
  });
};

/**
 * Mark a message as read
 */
export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  return useMutation<void, Error, { conversationId: string; messageId: string }>({
    mutationFn: async ({ conversationId, messageId }) => {
      // Token injection handled by API client interceptor
      return messageService.markAsRead({ conversationId, messageId });
    },
    onSuccess: (_, { conversationId, messageId }) => {
      // Update message in cache
      queryClient.setQueriesData<InfiniteData<CursorPageResponse<MessageDTO>>>(
        { queryKey: queryKeys.messages.list(conversationId) },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((msg) => {
                if (msg._id === messageId && userId && !msg.seenBy.includes(userId)) {
                  return { ...msg, seenBy: [...msg.seenBy, userId] };
                }
                return msg;
              }),
            })),
          };
        }
      );

      // Invalidate conversation to update unread count
      invalidateQueries(queryClient, [
        [...queryKeys.conversations.detail(conversationId)],
      ]);
    },
  });
};

/**
 * React to a message
 */
export const useReactToMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { messageId: string; reactionType: ReactionType }>({
    mutationFn: async ({ messageId, reactionType }) => {
      // Token injection handled by API client interceptor
      return messageService.reactToMessage(messageId, reactionType);
    },
    onSuccess: () => {
      // Invalidate messages to refresh reactions
      invalidateQueries(queryClient, [
        [...queryKeys.messages.list(conversationId)],
      ]);
    },
  });
};

/**
 * Send typing indicator
 * Note: This should be throttled at the UI level (e.g., max once per 3 seconds)
 */
export const useSendTypingIndicator = () => {
  return useMutation<void, Error, { conversationId: string; isTyping: boolean }>({
    mutationFn: async ({ conversationId, isTyping }) => {
      // Token injection handled by API client interceptor
      return messageService.sendTypingIndicator(conversationId, isTyping);
    },
    // No cache updates needed - this is typically handled via WebSocket on platform level
  });
};
