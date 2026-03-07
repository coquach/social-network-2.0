import {
  searchGroup,
  SearchGroupDto,
  searchPost,
  SearchPostDto,
  searchUser,
  SearchUserDto,
} from '@/lib/actions/search/search-actions';
import { CursorPageResponse, getStandardNextPageParam } from '@repo/shared';
import { queryKeys } from '@/lib/query-keys';
import { GroupSummaryDTO } from '@/models/group/groupDTO';
import { PostSnapshotDTO } from '@/models/social/post/postDTO';
import { UserDTO } from '@/models/user/userDTO';
import { useAuth } from '@clerk/nextjs';
import { useInfiniteQuery } from '@tanstack/react-query';

export const useSearchPosts = (filter: SearchPostDto) => {
  const { getToken } = useAuth();

  return useInfiniteQuery<CursorPageResponse<PostSnapshotDTO>>({
    queryKey: queryKeys.search.posts(filter.query ?? ''),
    enabled: Boolean(filter?.query?.trim()),
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');

      return searchPost(token, {
        ...filter,
        cursor: pageParam,
      } as SearchPostDto);
    },
    getNextPageParam: getStandardNextPageParam,
    initialPageParam: undefined,
    staleTime: 10_000,
    gcTime: 120_000,
  });
};

// --------- GROUPS ----------
export const useSearchGroups = (filter: SearchGroupDto) => {
  const { getToken } = useAuth();

  return useInfiniteQuery<CursorPageResponse<GroupSummaryDTO>>({
    queryKey: queryKeys.search.groups(filter.query ?? ''),
    enabled: Boolean(filter?.query?.trim()),
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');

      return searchGroup(token, {
        ...filter,
        cursor: pageParam,
      } as SearchGroupDto);
    },
    getNextPageParam: getStandardNextPageParam,
    initialPageParam: undefined,
    staleTime: 10_000,
    gcTime: 120_000,
  });
};

// --------- USERS ----------
export const useSearchUsers = (filter: SearchUserDto) => {
  const { getToken } = useAuth();

  return useInfiniteQuery<CursorPageResponse<UserDTO>>({
    queryKey: queryKeys.search.users(filter.query ?? ''),
    enabled: Boolean(filter?.query?.trim()),
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error('Token is required');

      return searchUser(token, {
        ...filter,
        cursor: pageParam,
      } as SearchUserDto);
    },
    getNextPageParam: getStandardNextPageParam,
    initialPageParam: undefined,
    staleTime: 10_000,
    gcTime: 120_000,
  });
};
