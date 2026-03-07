import { getMyFeed, getTrendingFeed, PersonalFeedQuery, TrendingQuery } from "@/lib/actions/feed/feed-action";
import { CursorPageResponse, getStandardNextPageParam } from '@repo/shared';
import { FeedDTO } from "@/models/feed/feedDTO";
import { PostSnapshotDTO } from "@/models/social/post/postDTO";
import { useAuth } from "@clerk/nextjs";
import { useInfiniteQuery } from "@tanstack/react-query"
import { selectInfiniteData } from "@/lib/query-selectors";

export const useGetMyFeed = (query: PersonalFeedQuery) => {
  const { getToken} = useAuth();
  return useInfiniteQuery<
    CursorPageResponse<FeedDTO>,
    Error,
    FeedDTO[]
  >({
    queryKey: ['my-feed', query.mainEmotion ?? 'ALL'],
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      return await getMyFeed(token, {
        ...query,
        cursor: pageParam,
      } as PersonalFeedQuery);
    },
    getNextPageParam: getStandardNextPageParam,
    initialPageParam: undefined,
    select: selectInfiniteData<FeedDTO>,
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 15 * 1000, // 15 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export const useGetTrendingFeed = (query: TrendingQuery) => {
  const { getToken} = useAuth();
  return useInfiniteQuery<
    CursorPageResponse<PostSnapshotDTO>,
    Error,
    PostSnapshotDTO[]
  >({
    queryKey: ['trending-feed', query.mainEmotion ?? 'ALL'],
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) {
        throw new Error('Token is required');
      }
      return await getTrendingFeed(token, {
        ...query,
        cursor: pageParam,
      } as TrendingQuery);
    },
    getNextPageParam: getStandardNextPageParam,
    initialPageParam: undefined,
    select: selectInfiniteData<PostSnapshotDTO>,
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 15 * 1000, // 15 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
