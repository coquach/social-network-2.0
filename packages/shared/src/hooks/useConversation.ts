/**
 * Conversation-related React Query hooks
 *
 * Platform-agnostic hooks for conversations/chat.
 * These hooks use the conversationService and provide type-safe queries and mutations.
 */

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { conversationService } from '../api/services';
import type {
  CursorPaginatedResponse,
  QueryParams,
} from '../types/common.types';
import type {
  ConversationDTO,
  CreateConversationInput,
  UpdateConversationInput,
} from '../types/conversation.types';
import type { AttachmentDTO } from '../types/message.types';
import { useUploadOptional } from '../contexts/upload-context';
import type { UploadableFile } from '../types/upload.types';
import { queryKeys } from './query-keys';

// ==================== Query Hooks ====================

/**
 * Get conversation list with infinite scroll
 */
export const useConversations = (params?: QueryParams) => {
  return useInfiniteQuery<CursorPaginatedResponse<ConversationDTO>>({
    queryKey: queryKeys.conversations.list(),
    queryFn: async ({ pageParam }) => {
      return conversationService.getConversations({
        ...params,
        cursor: pageParam as string | undefined,
      });
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    staleTime: 10_000, // 10 seconds
    gcTime: 60_000, // 1 minute
  });
};

/**
 * Get a single conversation by ID
 */
export const useConversation = (
  conversationId: string,
  options?: { enabled?: boolean },
) => {
  return useQuery<ConversationDTO>({
    queryKey: queryKeys.conversations.detail(conversationId),
    queryFn: async () => {
      return conversationService.getConversation(conversationId);
    },
    enabled: options?.enabled !== false && !!conversationId,
    staleTime: 20_000, // 20 seconds
    gcTime: 60_000, // 1 minute
  });
};

// ==================== Mutation Hooks ====================

/**
 * Create a new conversation
 * 
 * @example
 * const createConversation = useCreateConversation();
 * // Group conversation with avatar
 * createConversation.mutate({
 *   isGroup: true,
 *   participants: ['user1', 'user2'],
 *   groupName: 'Team Chat',
 *   uploadGroupAvatar: { file: avatarFile, type: MediaType.IMAGE }
 * });
 */
export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  const uploadService = useUploadOptional();

  return useMutation<
    ConversationDTO,
    Error,
    CreateConversationInput & { uploadGroupAvatar?: UploadableFile }
  >({
    mutationFn: async ({ uploadGroupAvatar, ...input }) => {
      // Upload group avatar if provided (for group conversations)
      if (uploadGroupAvatar && uploadService && input.isGroup) {
        try {
          const avatarResult = await uploadService.uploadFile(
            uploadGroupAvatar,
            {
              folder: 'conversations/group-avatars',
            },
          );

          const groupAvatar: AttachmentDTO = {
            url: avatarResult.url,
            publicId: avatarResult.publicId,
            mimeType: 'image',
          };

          input.groupAvatar = groupAvatar;
        } catch (uploadError) {
          console.error('Group avatar upload failed:', uploadError);
          throw new Error('Failed to upload group avatar. Please try again.');
        }
      }

      return conversationService.createConversation(input);
    },
    onSuccess: (newConversation) => {
      // Add to cache
      if (newConversation._id) {
        queryClient.setQueryData<ConversationDTO>(
          queryKeys.conversations.detail(newConversation._id),
          newConversation,
        );
      }

      // Invalidate list
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.list(),
      });
    },
  });
};

/**
 * Update a conversation
 * 
 * @example
 * const updateConversation = useUpdateConversation('conv-123');
 * updateConversation.mutate({
 *   groupName: 'Updated Name',
 *   uploadGroupAvatar: { file: newAvatar, type: MediaType.IMAGE }
 * });
 */
export const useUpdateConversation = (conversationId: string) => {
  const queryClient = useQueryClient();
  const uploadService = useUploadOptional();

  return useMutation<
    ConversationDTO,
    Error,
    UpdateConversationInput & { uploadGroupAvatar?: UploadableFile }
  >({
    mutationFn: async ({ uploadGroupAvatar, ...input }) => {
      // Upload new group avatar if provided
      if (uploadGroupAvatar && uploadService) {
        try {
          const avatarResult = await uploadService.uploadFile(
            uploadGroupAvatar,
            {
              folder: `conversations/${conversationId}/avatars`,
            },
          );

          const groupAvatar: AttachmentDTO = {
            url: avatarResult.url,
            publicId: avatarResult.publicId,
            mimeType: 'image',
          };

          input.groupAvatar = groupAvatar;
        } catch (uploadError) {
          console.error('Group avatar upload failed:', uploadError);
          throw new Error('Failed to upload group avatar. Please try again.');
        }
      }

      return conversationService.updateConversation(conversationId, input);
    },
    onSuccess: (updatedConversation) => {
      // Update cache
      queryClient.setQueryData<ConversationDTO>(
        queryKeys.conversations.detail(conversationId),
        updatedConversation,
      );

      // Invalidate list
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.list(),
      });
    },
  });
};

/**
 * Delete a conversation
 */
export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (conversationId) => {
      return conversationService.deleteConversation(conversationId);
    },
    onSuccess: (_, conversationId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: queryKeys.conversations.detail(conversationId),
      });

      // Invalidate list
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.list(),
      });
    },
  });
};

/**
 * Mark conversation as read
 */
export const useMarkConversationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (conversationId) => {
      // Note: markAsRead method needs to be implemented in conversationService
      return conversationService.markConversationAsRead(conversationId);
    },
    onSuccess: (_, conversationId) => {
      // Invalidate conversation to update unread count
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.detail(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.list(),
      });
    },
  });
};

/**
 * Hide conversation
 */
export const useHideConversation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (conversationId) => {
      return conversationService.hideConversation(conversationId);
    },
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.detail(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.list(),
      });
    },
  });
};

/**
 * Unhide conversation
 */
export const useUnhideConversation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (conversationId) => {
      return conversationService.unhideConversation(conversationId);
    },
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.detail(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.list(),
      });
    },
  });
};

/**
 * Leave conversation
 */
export const useLeaveConversation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (conversationId) => {
      return conversationService.leaveConversation(conversationId);
    },
    onSuccess: (_, conversationId) => {
      queryClient.removeQueries({
        queryKey: queryKeys.conversations.detail(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.list(),
      });
    },
  });
};
