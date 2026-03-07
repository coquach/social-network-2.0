import { uploadToCloudinary } from '@/lib/actions/cloudinary/upload-action';
import {
  createComment,
  deleteComment,
  getComments,
  GetCommentsQuery,
  updateComment,
} from '@/lib/actions/social/comment/comment-action';
import { PageResponse } from '@/lib/pagination.dto';
import { getQueryClient } from '@/lib/query-client';
import { MediaItem } from '@/lib/types/media';
import {
  CommentDTO,
  CreateCommentForm,
  UpdateCommentForm,
} from '@/models/social/comment/commentDTO';
import { MediaType } from '@/models/social/enums/social.enum';
import { withAbortOnUnload } from '@/utils/with-abort-unload';
import { useAuth } from '@clerk/nextjs';
import {
  InfiniteData,
  QueryClient,
  useInfiniteQuery,
  useMutation,
} from '@tanstack/react-query';
import { toast } from 'sonner';

export const useGetComments = (query: GetCommentsQuery) => {
  const { getToken } = useAuth();
  return useInfiniteQuery<PageResponse<CommentDTO>>({
    queryKey: ['comments', query.rootId, query.rootType, query.parentId],

    queryFn: async ({ pageParam = 1 }) => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      return await getComments(token, {
        ...query,
        page: pageParam,
      } as GetCommentsQuery);
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 10_000,
    gcTime: 120_000,
    refetchOnWindowFocus: true,
  });
};

export const useCreateComment = (rootId: string) => {
  const { getToken, userId } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async ({
      data,
      media,
    }: {
      data: CreateCommentForm;
      media?: MediaItem;
    }) => {
      return await withAbortOnUnload(async (signal) => {
        const token = await getToken();
        if (!token) {
          throw new Error('Token is required');
        }
        if (media) {
          const mediaUpload = await uploadToCloudinary(
            media.file,
            media.type === MediaType.IMAGE ? 'image' : 'video',
            `${rootId}/comments/${userId}`,
            signal
          );
          data.media = {
            url: mediaUpload.url,
            type: mediaUpload.type,
            publicId: mediaUpload.publicId,
          };
        }
        return await createComment(token, data);
      });
    },
    onSuccess: (newComment) => {
      addCommentToCache(queryClient, newComment);
      queryClient.invalidateQueries({ queryKey: ['comments', rootId] });
      toast.success('Bình luận đã được tạo thành công!');
    },
    onError: () => {
      toast.error('Tạo bình luận thất bại. Vui lòng thử lại.');
    },
  });
};

export const useUpdateComment = (rootId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async ({
      commentId,
      data,
    }: {
      commentId: string;
      data: UpdateCommentForm;
    }) => {
      console.log('Invalidate key:', ['comments', rootId]);
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      return await updateComment(token, commentId, data);
    },
    onSuccess: (updatedComment) => {
      updateCommentInCache(queryClient, updatedComment, rootId);
      queryClient.invalidateQueries({ queryKey: ['comments', rootId] });
      toast.success('Cập nhật bình luận thành công!');
    },
    onError: () => {
      toast.error('Cập nhật bình luận thất bại!');
    },
  });
};

export const useDeleteComment = (rootId: string, commentId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      return await deleteComment(token, commentId);
    },
    onSuccess: () => {
      removeCommentFromCache(queryClient, commentId, rootId);
      queryClient.invalidateQueries({ queryKey: ['comments', rootId] });
      toast.success('Comment deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete comment');
    },
  });
};

const addCommentToCache = (queryClient: QueryClient, comment: CommentDTO) => {
  queryClient.setQueriesData<InfiniteData<PageResponse<CommentDTO>>>(
    {
      queryKey: [
        'comments',
        comment.rootId,
        comment.rootType,
        comment.parentId,
      ],
      exact: true,
    },
    (old) => {
      if (!old) return old;

      return {
        ...old,
        pages: old.pages.map((page, index) =>
          index === 0
            ? { ...page, data: [comment, ...page.data] } // thêm vào đầu page 1
            : page
        ),
      };
    }
  );
};

const updateCommentInCache = (
  queryClient: QueryClient,
  updatedComment: CommentDTO,
  rootId: string
) => {
  queryClient.setQueriesData<InfiniteData<PageResponse<CommentDTO>>>(
    { queryKey: ['comments', rootId] },
    (old) => {
      if (!old) return old;

      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: page.data.map((comment) =>
            comment.id === updatedComment.id ? updatedComment : comment
          ),
        })),
      };
    }
  );
};

const removeCommentFromCache = (
  queryClient: QueryClient,
  commentId: string,
  rootId: string
) => {
  queryClient.setQueriesData<InfiniteData<PageResponse<CommentDTO>>>(
    { queryKey: ['comments', rootId] },
    (old) => {
      if (!old) return old;

      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: page.data.filter((comment) => comment.id !== commentId),
        })),
      };
    }
  );
};
