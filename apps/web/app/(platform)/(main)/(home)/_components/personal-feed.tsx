'use client';

import { ErrorFallback } from '@/components/error-fallback';
import { PostCardFull } from '@/components/post/post-card-full';
import { ShareCard } from '@/components/post/share-post';
import { AsyncList } from '@/components/ui/async-list';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import {
  useMyFeed,
  FeedType,
  PostSnapshotDTO,
  ShareSnapshotDTO as SharePostSnapshotDTO,
  PersonalFeedItem,
  Emotion,
} from '@repo/shared';

export const PersonalFeed = ({
  mainEmotion,
}: {
  mainEmotion?: Emotion;
}) => {
  const {
    data: allFeedItems = [],
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useMyFeed({ limit: 10, mainEmotion });

  const { sentinelRef } = useInfiniteScroll({ hasNextPage, isFetchingNextPage, fetchNextPage });

  return (
    <AsyncList<PersonalFeedItem>
      items={allFeedItems}
      keyExtractor={(feed) => feed.id}
      isLoading={isLoading}
      isError={isError}
      errorState={<ErrorFallback message={error?.message} />}
      skeleton={<PostCardFull.Skeleton />}
      skeletonCount={2}
      emptyState={
        <div className="w-full rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
          Không có bài viết nào trong bảng tin.
        </div>
      }
      renderItem={(feed) =>
        feed.type === FeedType.POST ? (
          <PostCardFull data={feed.data as PostSnapshotDTO} />
        ) : (
          <ShareCard data={feed.data as SharePostSnapshotDTO} />
        )
      }
      sentinelRef={sentinelRef}
      loadingMore={<PostCardFull.Skeleton />}
      stagger
    />
  );
};
