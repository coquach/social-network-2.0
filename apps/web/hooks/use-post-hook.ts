'use client';

import { uploadMultipleToCloudinary } from '@/lib/actions/cloudinary/upload-action';
import { getStandardNextPageParam } from '@repo/shared';
import { handleMutationError } from '@/lib/mutation-utils';
import { selectInfiniteData } from '@/lib/query-selectors';
import {
  approvePostInGroup,
  createPost,
  createPostInGroup,
  GetGroupPostQueryDTO,
  getMyPosts,
  getPost,
  getPostEditHistory,
  GetPostQuery,
  getPostsByGroup,
  getPostsByUser,
  rejectPostInGroup,
  removePost,
  updatePost,
} from '@/lib/actions/social/post/post-action';
import { CursorPageResponse } from '@repo/shared';
import { getQueryClient } from '@/lib/query-client';
import { queryKeys } from '@/lib/query-keys';
import { MediaItem } from '@/lib/types/media';
import { PostGroupStatus } from '@/models/social/enums/social.enum';
import {
  CreatePostForm,
  EditHistoryDTO,
  PostDTO,
  PostSnapshotDTO,
  UpdatePostForm,
} from '@/models/social/post/postDTO';
import { withAbortOnUnload } from '@/utils/with-abort-unload';
import { useAuth } from '@clerk/nextjs';
import {
  InfiniteData,
  QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { toast } from 'sonner';

export const useGetPost = (postId: string) => {
  const { getToken } = useAuth();
  return useQuery<PostDTO>({
    queryKey: queryKeys.posts.detail(postId),
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      return await getPost(token, postId);
    },
    enabled: !!postId,
    staleTime: 10_000,
    gcTime: 60_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
};

export const useProfilePosts = (userId: string, query: GetPostQuery) => {
  const { userId: currentUser, getToken } = useAuth();

  return useInfiniteQuery<
    CursorPageResponse<PostSnapshotDTO>,
    Error,
    PostSnapshotDTO[]
  >({
    queryKey: queryKeys.posts.list(userId === currentUser ? 'me' : userId),
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');

      if (userId === currentUser) {
        return getMyPosts(token, {
          ...query,
          cursor: pageParam,
        } as GetPostQuery);
      } else {
        return getPostsByUser(token, userId, {
          ...query,
          cursor: pageParam,
        } as GetPostQuery);
      }
    },
    getNextPageParam: getStandardNextPageParam,
    initialPageParam: undefined,
    select: selectInfiniteData<PostSnapshotDTO>,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

export const useGetPostEditHistories = (postId: string) => {
  const { getToken } = useAuth();
  return useQuery<EditHistoryDTO[]>({
    queryKey: queryKeys.posts.editHistories(postId),
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      return await getPostEditHistory(token, postId);
    },
    enabled: !!postId,
    staleTime: 60_000,
    gcTime: 300_000,
  });
};

export const useCreatePost = () => {
  const { getToken, userId } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async ({
      form,
      media,
    }: {
      form: CreatePostForm;
      media?: MediaItem[];
    }) => {
      return await withAbortOnUnload(async (signal) => {
        const token = await getToken();
        if (!token) {
          throw new Error('Token is required');
        }
        console.log('media', form.media);
        if (media && media.length > 0) {
          const uploaded = await uploadMultipleToCloudinary(
            media,
            `posts/${userId}`,
            signal
          );
          form.media = uploaded.map((item) => ({
            url: item.url,
            type: item.type,
            publicId: item.publicId,
          }));
        }

        if (form.groupId) {
          const res = await createPostInGroup(token, form);
          // res: { post, status, message }
          return {
            kind: 'group',
            post: res.post,
            status: res.status,
            message: res.message,
            groupId: form.groupId,
          };
        } else {
          const post = await createPost(token, form);
          return {
            kind: 'profile',
            post,
          };
        }
      });
    },
    onSuccess: (result) => {
      if (result.kind === 'profile') {
        addPostToCache(queryClient, result.post);

        toast.success('Đăng bài thành công!');
        queryClient.invalidateQueries({ queryKey: queryKeys.feed.trending() });
      } else {
        if (result.groupId) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.posts.byGroup(result.groupId),
            exact: false,
          });
        }
        // Group post: có thể pending duyệt, hoặc approved
        if (result.status === PostGroupStatus.PUBLISHED) {
          if (result.groupId) {
            addPostToCache(queryClient, result.post, result.groupId);
          }
          toast.success('Đăng bài trong nhóm thành công!');
          // invalidate feed group nếu bạn có key riêng, ví dụ:
          // queryClient.invalidateQueries({ queryKey: ['group-posts', groupId] });
        } else {
          toast.success(
            'Bài đăng đã được gửi và chờ duyệt bởi quản trị viên nhóm.'
          );
        }
      }
    },
    onError: handleMutationError({ 
      userMessage: 'Đăng bài thất bại. Vui lòng thử lại.' 
    }),
  });
};

export const useUpdatePost = (postId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (update: UpdatePostForm) => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      // Assume updatePost is defined elsewhere
      return await updatePost(token, postId, update);
    },
    onSuccess: (updatedPost) => {
      updatePostInCache(queryClient, updatedPost);
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all, exact: false });
      toast.success('Chỉnh sửa bài đăng thành công!');
    },
    onError: handleMutationError({ 
      userMessage: 'Chỉnh sửa bài đăng thất bại. Vui lòng thử lại.' 
    }),
  });
};

export const useDeletePost = (postId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      // Assume deletePost is defined elsewhere
      return await removePost(token, postId);
    },
    onSuccess: () => {
      removePostFromCache(queryClient, postId);
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all, exact: false });
      toast.success('Xóa bài đăng thành công!');
    },
    onError: handleMutationError({ 
      userMessage: 'Xóa bài đăng thất bại. Vui lòng thử lại.' 
    }),
  });
};

const addPostToCache = (
  queryClient: QueryClient,
  newPost: PostSnapshotDTO,
  groupId?: string
) => {
  if (groupId) {
    // Post tren trang ca nhan (me)
    queryClient.setQueriesData(
      { queryKey: queryKeys.posts.byGroup(groupId) },
      (old) => {
        if (!old) return old;

        if (
          'pages' in (old as InfiniteData<CursorPageResponse<PostSnapshotDTO>>)
        ) {
          const infinite = old as InfiniteData<
            CursorPageResponse<PostSnapshotDTO>
          >;
          return {
            ...infinite,
            pages: infinite.pages.map((page, index) =>
              index === 0 ? { ...page, data: [newPost, ...page.data] } : page
            ),
          };
        }

        if ('data' in (old as CursorPageResponse<PostSnapshotDTO>)) {
          const page = old as CursorPageResponse<PostSnapshotDTO>;
          return {
            ...page,
            data: [newPost, ...page.data],
          };
        }

        return old;
      }
    );
    return;
  }
  // Post tren trang ca nhan (me)
  queryClient.setQueriesData<InfiniteData<CursorPageResponse<PostSnapshotDTO>>>(
    { queryKey: queryKeys.posts.myPosts() },
    (old) => {
      if (!old) return old;

      return {
        ...old,
        pages: old.pages.map((page, index) =>
          index === 0 ? { ...page, data: [newPost, ...page.data] } : page
        ),
      };
    }
  );
};

// ⚙️ Update 1 post trong mọi page
const updatePostInCache = (
  queryClient: QueryClient,
  updated: PostSnapshotDTO
) => {
  queryClient.setQueriesData<InfiniteData<CursorPageResponse<PostSnapshotDTO>>>(
    { queryKey: queryKeys.posts.all },
    (old) => {
      if (!old) return old;

      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: page.data.map((post) =>
            post.postId === updated.postId ? updated : post
          ),
        })),
      };
    }
  );

  queryClient.setQueriesData<InfiniteData<CursorPageResponse<PostSnapshotDTO>>>(
    { queryKey: [...queryKeys.posts.all, 'group'], exact: false },
    (old) => {
      if (!old) return old;

      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: page.data.map((post) =>
            post.postId === updated.postId ? updated : post
          ),
        })),
      };
    }
  );
};

// ⚙️ Xoá post khỏi mọi page
const removePostFromCache = (queryClient: QueryClient, postId: string) => {
  queryClient.setQueriesData<InfiniteData<CursorPageResponse<PostSnapshotDTO>>>(
    { queryKey: queryKeys.posts.all },
    (old) => {
      if (!old) return old;

      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: page.data.filter((post) => post.postId !== postId),
        })),
      };
    }
  );

  queryClient.setQueriesData<InfiniteData<CursorPageResponse<PostSnapshotDTO>>>(
    { queryKey: [...queryKeys.posts.all, 'group'], exact: false },
    (old) => {
      if (!old) return old;

      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: page.data.filter((post) => post.postId !== postId),
        })),
      };
    }
  );
};

export const useGetPostByGroup = (
  groupId: string,
  query: GetGroupPostQueryDTO,
  options?: { enabled?: boolean }
) => {
  const { getToken } = useAuth();
  return useInfiniteQuery<CursorPageResponse<PostSnapshotDTO>>({
    queryKey: [...queryKeys.posts.byGroup(groupId), query.status],
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');
      return getPostsByGroup(token, groupId, {
        ...query,
        cursor: pageParam,
      } as GetPostQuery);
    },
    getNextPageParam: getStandardNextPageParam,
    initialPageParam: undefined,
    enabled: (options?.enabled ?? true) && !!groupId,
    staleTime: 10_000,
    gcTime: 120_000,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });
};

export const useApprovePostInGroup = (postId: string, groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      // Assume approvePostInGroup is defined elsewhere
      return await approvePostInGroup(token, postId);
    },
    onSuccess: () => {
      removePostFromGroupCache(
        queryClient,
        groupId,
        postId,
        PostGroupStatus.PENDING
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all, exact: false });
      toast.success('Duyệt bài đăng trong nhóm thành công!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useRejectPostInGroup = (postId: string, groupId: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      // Assume rejectPostInGroup is defined elsewhere
      return await rejectPostInGroup(token, postId);
    },
    onSuccess: () => {
      removePostFromGroupCache(
        queryClient,
        groupId,
        postId,
        PostGroupStatus.PENDING
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all, exact: false });
      toast.success('Từ chối bài đăng trong nhóm thành công!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
export const removePostFromGroupCache = (
  queryClient: QueryClient,
  groupId: string,
  postId: string,
  filterStatus?: PostGroupStatus
) => {
  const queries = queryClient.getQueriesData<
    InfiniteData<CursorPageResponse<PostSnapshotDTO>>
  >({
    queryKey: [...queryKeys.posts.byGroup(groupId), filterStatus],
    exact: false,
  });

  for (const [key, oldData] of queries) {
    if (!oldData) continue;

    const newData = {
      ...oldData,
      pages: oldData.pages.map((page) => ({
        ...page,
        data: page.data.filter((post) => post.postId !== postId),
      })),
    };

    queryClient.setQueryData(key, newData);
  }
};
