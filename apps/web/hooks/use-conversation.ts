import {
  createConversation,
  deleteConversation,
  getConversationById,
  getConversationList,
  hideConversationForUser,
  leaveConversationForUser,
  markConversationAsRead,
  unhideConversationForUser,
  updateConversation,
} from '@/lib/actions/chat/chat-actions';
import { uploadToCloudinary } from '@/lib/actions/cloudinary/upload-action';
import {
  CursorPageResponse,
  CursorPagination,
  getStandardNextPageParam,
} from '@repo/shared';
import { getQueryClient } from '@/lib/query-client';
import { MediaItem } from '@/lib/types/media';
import {
  ConversationDTO,
  CreateConversationForm,
  UpdateConversationForm,
} from '@/models/conversation/conversationDTO';
import { withAbortOnUnload } from '@/utils/with-abort-unload';
import { useAuth } from '@clerk/nextjs';
import {
  InfiniteData,
  QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { toast } from 'sonner';

export const useConversation = () => {
  const params = useParams();

  const conversationId = useMemo(() => {
    if (!params?.conversationId) {
      return '';
    }

    return params.conversationId as string;
  }, [params?.conversationId]);

  const isOpen = useMemo(() => !!conversationId, [conversationId]);

  return useMemo(
    () => ({
      isOpen,
      conversationId,
    }),
    [isOpen, conversationId]
  );
};

export const useGetConversationList = (query: CursorPagination) => {
  const { getToken } = useAuth();
  return useInfiniteQuery<CursorPageResponse<ConversationDTO>>({
    queryKey: ['conversations'],
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return await getConversationList(token, {
        ...query,
        cursor: pageParam,
      } as CursorPagination);
    },
    getNextPageParam: getStandardNextPageParam,
    initialPageParam: undefined,
    staleTime: 10_000,
    gcTime: 60_000,
  });
};

export const useGetConversationById = (conversationId: string) => {
  const { getToken } = useAuth();
  return useQuery<ConversationDTO>({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return await getConversationById(token, conversationId);
    },
    enabled: !!conversationId,
    staleTime: 20_000,
    gcTime: 60_000,
  });
};

export const useCreateConversation = () => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    // dto: CreateConversationForm
    mutationFn: async ({
      dto,
      media,
    }: {
      dto: CreateConversationForm;
      media?: MediaItem;
    }) => {
      return await withAbortOnUnload(async (signal) => {
        const token = await getToken();
        if (!token) throw new Error('Token is required');

        if (media) {
          const uploadResult = await uploadToCloudinary(
            media.file,
            'image',
            `conversations/group-avatars`,
            signal
          );
          dto.groupAvatar = {
            url: uploadResult.url,
            publicId: uploadResult.publicId,
          };
        }

        return await createConversation(token, dto);
      });
    },
    onSuccess: () => {
      // reload list hội thoại
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Không thể tạo cuộc trò chuyện.');
    },
    retry: false
  });
};

export const useUpdateConversation = (conversationId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    // dto: UpdateConversationForm
    mutationFn: async ({
      dto,
      media,
      publicId,
    }: {
      dto: UpdateConversationForm;
      media?: MediaItem;
      publicId?: string;
    }) => {
      await withAbortOnUnload(async (signal) => {
        const token = await getToken();
        if (!token) throw new Error('Token is required');
        if (media) {
          const uploadResult = await uploadToCloudinary(
            media.file,
            'image',
            `conversations/group-avatars`,
            signal,
            publicId
          );
          dto.groupAvatar = {
            url: uploadResult.url,
            publicId: uploadResult.publicId,
          };
        }

        return await updateConversation(token, conversationId, dto);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['conversation', conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Cập nhật cuộc trò chuyện thành công!');
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Không thể cập nhật cuộc trò chuyện.');
    },
    retry: false
  });
};

export const useDeleteConversation = (conversationId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');

      return await deleteConversation(token, conversationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({
        queryKey: ['conversation', conversationId],
      });
      toast.success('Xóa cuộc trò chuyện thành công!');
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Không thể xóa cuộc trò chuyện.');
    },
  });
};

export const useHideConversation = (conversationId: string) => {
  const { getToken, userId } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return await hideConversationForUser(token, conversationId);
    },

    onError: (error) => {
      toast.error(error?.message ?? 'Không thể ẩn cuộc trò chuyện.');
    },

    onSuccess: () => {
      toast.success('Đã ẩn cuộc trò chuyện.');
      if (userId)
        patchConversationHideFor(queryClient, conversationId, userId, 'hide');
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useUnhideConversation = (conversationId: string) => {
  const { getToken, userId } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return await unhideConversationForUser(token, conversationId);
    },

    onError: (error) => {
      toast.error(error?.message ?? 'Không thể bỏ ẩn cuộc trò chuyện.');
    },

    onSuccess: () => {
      toast.success('Đã bỏ ẩn cuộc trò chuyện.');
      if (userId)
        patchConversationHideFor(queryClient, conversationId, userId, 'unhide');

      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useLeaveConversation = (conversationId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');

      return await leaveConversationForUser(token, conversationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Rời khỏi cuộc trò chuyện thành công.');
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Không thể rời cuộc trò chuyện.');
    },
  });
};

export const useMarkConversationAsRead = () => {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({
      conversationId,
      lastMessageId,
    }: {
      conversationId: string;
      lastMessageId?: string;
    }) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');

      return await markConversationAsRead(token, conversationId, lastMessageId);
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Không thể đánh dấu đã đọc.');
    },
  });
};

function patchConversationHideFor(
  queryClient: QueryClient,
  conversationId: string,
  userId: string,
  mode: 'hide' | 'unhide'
) {
  // 1) patch detail
  queryClient.setQueryData<ConversationDTO>(
    ['conversation', conversationId],
    (old) => {
      if (!old) return old;

      const prev = old.hiddenFor ?? [];
      const next =
        mode === 'hide'
          ? Array.from(new Set([...prev, userId]))
          : prev.filter((x) => x !== userId);

      return { ...old, hiddenFor: next };
    }
  );

  // 2) patch infinite list
  queryClient.setQueriesData<InfiniteData<CursorPageResponse<ConversationDTO>>>(
    { queryKey: ['conversations'] },
    (old) => {
      if (!old) return old;

      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: page.data.map((c) => {
            if (c._id !== conversationId) return c;

            const prev = c.hiddenFor ?? [];
            const next =
              mode === 'hide'
                ? Array.from(new Set([...prev, userId]))
                : prev.filter((x) => x !== userId);

            return { ...c, hiddenFor: next };
          }),
        })),
      };
    }
  );
}

