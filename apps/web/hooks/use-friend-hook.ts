import {
  acceptFriendRequest,
  blockUser,
  cancelFriendRequest,
  declineFriendRequest,
  getBlockedUsers,
  getFriendRequests,
  getFriends,
  getFriendSuggestions,
  getUserFriends,
  removeFriend,
  sendFriendRequest,
  unblockUser,
} from '@/lib/actions/friend/friend-action';
import {
  CursorPageResponse,
  CursorPagination,
  getStandardNextPageParam,
} from '@repo/shared';
import { getQueryClient } from '@/lib/query-client';
import { queryKeys } from '@/lib/query-keys';
import { UserDTO } from '@/models/user/userDTO';
import { useAuth } from '@clerk/nextjs';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

type RelationStatus =
  | 'FRIEND'
  | 'BLOCKED'
  | 'REQUESTED_OUT'
  | 'REQUESTED_IN'
  | 'NONE';

type UserSnapshot = UserDTO | undefined;
type FriendSuggestionUserSnapshot = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
};

type OptimisticContext = {
  previousUser?: UserSnapshot;
};

const updateUserRelation = (
  userId: string | undefined,
  status: RelationStatus
) => {
  if (!userId) return undefined;
  const queryClient = getQueryClient();
  queryClient.setQueryData<UserDTO>(queryKeys.user.detail(userId), (prev) => {
    if (!prev) return prev;
    return {
      ...prev,
      relation: {
        ...prev.relation,
        status,
      },
    };
  });
  return queryClient;
};

const snapshotUser = (userId?: string) => {
  if (!userId) return undefined;
  return getQueryClient().getQueryData<UserDTO>(queryKeys.user.detail(userId));
};

const restoreUser = (userId?: string, snapshot?: UserSnapshot) => {
  if (!userId || !snapshot) return;
  getQueryClient().setQueryData(queryKeys.user.detail(userId), snapshot);
};

export const useGetFriends = (query: CursorPagination, userId?: string) => {
  const { getToken } = useAuth();
  return useInfiniteQuery<CursorPageResponse<string>>({
    queryKey: queryKeys.friends.list(userId),
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await getFriends(
        token,
        {
          ...query,
          cursor: pageParam,
        } as CursorPagination,
        userId
      );
    },
    getNextPageParam: getStandardNextPageParam,
    initialPageParam: undefined,

  });
};

export const useGetUserFriends = (query: CursorPagination, userId: string) => {
  const { getToken } = useAuth();
  return useInfiniteQuery<CursorPageResponse<string>>({
    queryKey: queryKeys.friends.userFriends(userId),
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await getUserFriends(
        token,
        userId,
        {
          ...query,
          cursor: pageParam,
        } as CursorPagination
      );
    },
    getNextPageParam: getStandardNextPageParam,
    initialPageParam: undefined,
  });
};

export const useGetFriendRequests = (query: CursorPagination) => {
  const { getToken } = useAuth();
  return useInfiniteQuery<CursorPageResponse<string>>({
    queryKey: queryKeys.friends.requests(),
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await getFriendRequests(token, {
        ...query,
        cursor: pageParam,
      } as CursorPagination);
    },
    getNextPageParam: getStandardNextPageParam,
    initialPageParam: undefined,
  });
};
export const useGetFriendSuggestions = (query: CursorPagination) => {
  const { getToken } = useAuth();
  return useInfiniteQuery<
    CursorPageResponse<{
      id: string;
      mutualFriends: number;
      mutualFriendIds: string[];
      user?: FriendSuggestionUserSnapshot | null;
      mutualFriendPreview?: FriendSuggestionUserSnapshot[];
      commonGroups?: number;
      commonGroupIds?: string[];
      score?: number;
      reasons?: string[];
      recommendationId?: string;
      recommendationRequestId?: string;
    }>
  >({
    queryKey: queryKeys.friends.suggestions(query),
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await getFriendSuggestions(token, {
        ...query,
        cursor: pageParam,
      } as CursorPagination);
    },
    getNextPageParam: getStandardNextPageParam,
    initialPageParam: undefined,

  });
};

export const useGetBlockedUsers = (query: CursorPagination) => {
  const { getToken } = useAuth();
  return useInfiniteQuery<CursorPageResponse<string>>({
    queryKey: queryKeys.friends.blocked(),
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await getBlockedUsers(token, {
        ...query,
        cursor: pageParam,
      } as CursorPagination);
    },
    getNextPageParam: getStandardNextPageParam,
    initialPageParam: undefined,
  });
};

export const useRequestFriend = (userId?: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (targetId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await sendFriendRequest(token, targetId);
    },
    onMutate: async () => {
      const previousUser = snapshotUser(userId);
      updateUserRelation(userId, 'REQUESTED_OUT');
      return { previousUser } as OptimisticContext;
    },
    onError: (error, _vars, context) => {
      restoreUser(userId, context?.previousUser);
      toast.error(error.message);
    },
    onSuccess: () => {
      if (userId)
        queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(userId) });
      toast.success('Gửi lời mời kết bạn thành công!');
    },
  });
};
export const useCancelFriendRequest = (userId?: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (targetId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await cancelFriendRequest(token, targetId);
    },
    onMutate: async () => {
      const previousUser = snapshotUser(userId);
      updateUserRelation(userId, 'NONE');
      return { previousUser } as OptimisticContext;
    },
    onError: (error, _vars, context) => {
      restoreUser(userId, context?.previousUser);
      toast.error(error.message);
    },
    onSuccess: () => {
      if (userId)
        queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(userId) });
      toast.success('Đã hủy lời mời kết bạn!');
    },
  });
};

export const useAcceptFriendRequest = (userId?: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (targetId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await acceptFriendRequest(token, targetId);
    },
    onMutate: async () => {
      const previousUser = snapshotUser(userId);
      updateUserRelation(userId, 'FRIEND');
      return { previousUser } as OptimisticContext;
    },
    onError: (error, _vars, context) => {
      restoreUser(userId, context?.previousUser);
      toast.error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.requests() });
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.all });
      if (userId)
        queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(userId) });
      toast.success('Chấp nhận lời mời kết bạn thành công!');
    },
  });
};

export const useRejectFriendRequest = (userId?: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (targetId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await declineFriendRequest(token, targetId);
    },
    onMutate: async () => {
      const previousUser = snapshotUser(userId);
      updateUserRelation(userId, 'NONE');
      return { previousUser } as OptimisticContext;
    },
    onError: (error, _vars, context) => {
      restoreUser(userId, context?.previousUser);
      toast.error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.requests() });
      if (userId)
        queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(userId) });
      toast.success('Từ chối lời mời kết bạn thành công!');
    },
  });
};

export const useRemoveFriend = (userId?: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (targetId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await removeFriend(token, targetId);
    },
    onMutate: async () => {
      const previousUser = snapshotUser(userId);
      updateUserRelation(userId, 'NONE');
      return { previousUser } as OptimisticContext;
    },
    onError: (error, _vars, context) => {
      restoreUser(userId, context?.previousUser);
      toast.error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.all });
      if (userId)
        queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(userId) });
      toast.success('Hủy kết bạn thành công!');
    },
  });
};

export const useBlockUser = (userId?: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (targetId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await blockUser(token, targetId);
    },
    onMutate: async () => {
      const previousUser = snapshotUser(userId);
      updateUserRelation(userId, 'BLOCKED');
      return { previousUser } as OptimisticContext;
    },
    onError: (error, _vars, context) => {
      restoreUser(userId, context?.previousUser);
      toast.error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.all });
      if (userId)
        queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(userId) });
      toast.success('Chặn người dùng thành công!');
    },
  });
};

export const useUnblock = (userId?: string) => {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (targetId: string) => {
      const token = await getToken();
      if (!token) throw new Error('No auth token found');
      return await unblockUser(token, targetId);
    },
    onMutate: async () => {
      const previousUser = snapshotUser(userId);
      updateUserRelation(userId, 'NONE');
      return { previousUser } as OptimisticContext;
    },
    onError: (error, _vars, context) => {
      restoreUser(userId, context?.previousUser);
      toast.error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.blocked() });
      if (userId)
        queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(userId) });
      toast.success('Đã bỏ chặn người dùng.');
    },
  });
};
