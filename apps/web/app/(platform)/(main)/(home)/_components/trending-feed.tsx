'use client';

import { ErrorFallback } from '@/components/error-fallback';
import { PostCardFull } from '@/components/post/post-card-full';
import { SafeSpaceCard } from '@/components/feed/safe-space-card';
import { AsyncList } from '@/components/ui/async-list';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import {
  useTrendingFeed,
  FeedType,
  FeedItem,
  Emotion,
} from '@repo/shared';

export const TrendingFeed = ({
  mainEmotion,
}: {
  mainEmotion?: Emotion;
}) => {
  const {
    data: allFeedItems = [],
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTrendingFeed({ limit: 10, mainEmotion });

  const { sentinelRef } = useInfiniteScroll({ hasNextPage, isFetchingNextPage, fetchNextPage });

  return (
    <AsyncList<FeedItem>
      items={allFeedItems}
      keyExtractor={(feed) => feed.id}
      isLoading={isLoading}
      isError={isError}
      errorState={<ErrorFallback message={error?.message} />}
      skeleton={<PostCardFull.Skeleton />}
      skeletonCount={2}
      emptyState={
        <div className="w-full rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
          Không có bài viết xu hướng nào.
        </div>
      }
      renderItem={(feed) => {
        if (feed.type === FeedType.INTERVENTION) {
          return <SafeSpaceCard data={feed.data} />;
        }
        // Backend trending only returns POST | INTERVENTION
        return feed.type === FeedType.POST ? (
          <PostCardFull data={feed.data} />
        ) : null;
      }}
      sentinelRef={sentinelRef}
      loadingMore={<PostCardFull.Skeleton />}
      stagger
    />
  );
};
