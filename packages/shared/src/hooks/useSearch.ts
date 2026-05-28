/**
 * Search Hooks
 * React Query hooks for search operations
 * 
 * Includes:
 * - Post search
 * - Group search
 * 
 * Note: User search hook is in useUser.ts as useSearchUsers
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { searchService, type SearchPostFilter, type SearchGroupFilter, SearchUserFilter } from '../api/services';
import type { PostSnapshotDTO, GroupSummaryDTO, UserDTO } from '../types';
import type { CursorPageResponse } from '../types';
import { queryKeys } from './query-keys';

/**
 * Hook to search posts (infinite scroll)
 */
export const useSearchPosts = (filter: SearchPostFilter) => {
  const { query, ...otherFilters } = filter;
  
  return useInfiniteQuery<CursorPageResponse<PostSnapshotDTO>>({
    queryKey: [...queryKeys.search.posts(query || ''), otherFilters] as const,
    queryFn: ({ pageParam }) =>
      searchService.searchPosts({
        ...filter,
        cursor: pageParam as string | undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    enabled: !!query,
  });
};

/**
 * Hook to search groups (infinite scroll)
 */
export const useSearchGroups = (filter: SearchGroupFilter) => {
  const { query, ...otherFilters } = filter;
  
  return useInfiniteQuery<CursorPageResponse<GroupSummaryDTO>>({
    queryKey: [...queryKeys.search.groups(query || ''), otherFilters] as const,
    queryFn: ({ pageParam }) =>
      searchService.searchGroups({
        ...filter,
        cursor: pageParam as string | undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    enabled: !!query,
  });
};

/**
 * Hook to search users (infinite scroll)
 */
export const useSearchUsers = (filter: SearchUserFilter) => {
  const { query, ...otherFilters } = filter;
  
  return useInfiniteQuery<CursorPageResponse<UserDTO>>({
    queryKey: [...queryKeys.search.users(query || ''), otherFilters] as const,
    queryFn: ({ pageParam }) =>
      searchService.searchUsers({
        ...filter,
        cursor: pageParam as string | undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    enabled: !!query,
  });
};