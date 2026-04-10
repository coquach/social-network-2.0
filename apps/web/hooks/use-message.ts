import {
  deleteMessage,
  getMessagesByConversationId,
  sendMessage,
} from '@/lib/actions/chat/chat-actions';
import { uploadMultipleToCloudinary } from '@/lib/actions/cloudinary/upload-action';
import {
  CursorPageResponse,
  CursorPagination,
  MessageStatus,
  getStandardNextPageParam,
} from '@repo/shared';
import { getQueryClient } from '@/lib/query-client';
import { queryKeys } from '@/lib/query-keys';
import { MediaItem } from '@/lib/types/media';
import {
  CreateMessageForm,
  MessageDTO
} from '@/models/message/messageDTO';
import { ConversationDTO } from '@/models/conversation/conversationDTO';
import { MediaType } from '@/models/social/enums/social.enum';
import { withAbortOnUnload } from '@/utils/with-abort-unload';
import { useAuth } from '@clerk/nextjs';
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
} from '@tanstack/react-query';
import { get } from 'lodash';

import { toast } from 'sonner';

export const useGetMessages = (
  conversationId: string,
  query: CursorPagination
) => {
  const { getToken } = useAuth();
  return useInfiniteQuery<CursorPageResponse<MessageDTO>>({
    queryKey: queryKeys.messages.list(conversationId),
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return await getMessagesByConversationId(token, conversationId, {
        ...query,
        cursor: pageParam,
      } as CursorPagination);
    },
    getNextPageParam: getStandardNextPageParam,
    initialPageParam: undefined,
    enabled: !!conversationId,
    staleTime: 3_000,
    gcTime: 60_000,
  });
};
export const useSendMessage = () => {
  const { getToken, userId } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    onMutate: async ({
      form,
      media,
    }: {
      form: CreateMessageForm;
      media?: MediaItem[];
    }) => {
      const tempId = `temp:${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      const now = new Date();
      const hasMedia = !!media?.length;

      const optimistic: MessageDTO & { clientStatus: 'sending' } = {
        _id: tempId,
        senderId: userId ?? 'me',
        conversationId: form.conversationId,
        content: form.content?.trim() || (hasMedia ? 'Đang gửi tệp...' : ''),
        status: MessageStatus.SENT,
        seenBy: userId ? [userId] : [],
        reactionStats: {},
        attachments: [],
        replyTo: undefined,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
        clientStatus: 'sending',
      };

      queryClient.setQueryData<InfiniteData<CursorPageResponse<MessageDTO>>>(
        queryKeys.messages.list(form.conversationId),
        (old) => {
          if (!old) return old;
          const firstPage = old.pages[0];
          const updatedFirstPage: CursorPageResponse<MessageDTO> = {
            ...firstPage,
            data: [...firstPage.data, optimistic],
          };

          return {
            ...old,
            pages: [updatedFirstPage, ...old.pages.slice(1)],
          };
        }
      );

      return { tempId, conversationId: form.conversationId };
    },
    mutationFn: async ({
      form,
      media,
    }: {
      form: CreateMessageForm;
      media?: MediaItem[];
    }) => {
      return await withAbortOnUnload(async (signal) => {
        const token = await getToken();
        if (!token) throw new Error('Token is required');

        if (media && media.length > 0) {
          const uploadResults = await uploadMultipleToCloudinary(
            media,
            `conversations/${form.conversationId}/messages`,
            signal
          );

          form.attachments = uploadResults.map((item) => ({
            url: item.url,
            mimeType: item.type === MediaType.IMAGE ? 'image' : 'video',
            publicId: item.publicId,
          }));
        }

        return await sendMessage(token, form);
      });
    },

    onSuccess: (newMessage, _vars, ctx) => {
      queryClient.setQueryData<InfiniteData<CursorPageResponse<MessageDTO>>>(
        queryKeys.messages.list(newMessage.conversationId),
        (old) => {
          if (!old) return old;

          const firstPage = old.pages[0];
          if (firstPage.data.some((m) => m._id === newMessage._id)) {
            return old;
          }

          const updatedFirstPage: CursorPageResponse<MessageDTO> = {
            ...firstPage,
            data: [...firstPage.data.filter((m) => m._id !== ctx?.tempId), newMessage], // append vào page đầu
          };

          return {
            ...old,
            pages: [updatedFirstPage, ...old.pages.slice(1)],
          };
        }
      );

      const updatedAt = newMessage.createdAt ?? new Date().toISOString();

      queryClient.setQueryData<ConversationDTO>(
        queryKeys.conversations.detail(newMessage.conversationId),
        (old) => {
          if (!old) return old;
          return { ...old, lastMessage: newMessage, updatedAt };
        }
      );

      queryClient.setQueriesData(
        { queryKey: queryKeys.conversations.all },
        (old: any) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: (page.data ?? []).map((conv: ConversationDTO) =>
                conv._id === newMessage.conversationId
                  ? { ...conv, lastMessage: newMessage, updatedAt }
                  : conv
              ),
            })),
          };
        }
      );

      // optional: cập nhật list conversations (lastMessage)
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all,
      });
    },

    onError: (error, _vars, ctx) => {
      if (ctx?.conversationId && ctx?.tempId) {
        queryClient.setQueryData<InfiniteData<CursorPageResponse<MessageDTO>>>(
          queryKeys.messages.list(ctx.conversationId),
          (old) => {
            if (!old) return old;
            const updatedPages = old.pages.map((page) => ({
              ...page,
              data: page.data.filter((m) => m._id !== ctx.tempId),
            }));
            return { ...old, pages: updatedPages };
          }
        );
      }

      toast.error(get(error, 'message', 'Không thể gửi tin nhắn.'));
    },
    retry: false
  });
};

export const useDeleteMessage = () => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (messageId: string) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return await deleteMessage(token, messageId);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
    },
    onError: (error) => {
      toast.error(get(error, 'message', 'Không thể xóa tin nhắn.'));
    },
  });
};

