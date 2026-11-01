'use client';

import { ErrorFallback } from '@/components/error-fallback';
import { PostCardFull } from '@/components/post/post-card-full';
import { AsyncList } from '@/components/ui/async-list';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { useTrendingFeed, Emotion, PostSnapshotDTO } from '@repo/shared';

export const TrendingFeed = ({
  mainEmotion,
}: {
  mainEmotion?: Emotion;
}) => {
  const {
    data: allPosts = [],
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTrendingFeed({ limit: 10, mainEmotion });

  const { sentinelRef } = useInfiniteScroll({ hasNextPage, isFetchingNextPage, fetchNextPage });

  return (
    <AsyncList<PostSnapshotDTO>
      items={allPosts}
      keyExtractor={(post) => post.postId}
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
      renderItem={(post) => <PostCardFull data={post} />}
      sentinelRef={sentinelRef}
      loadingMore={<PostCardFull.Skeleton />}
      stagger
    />
  );
};
