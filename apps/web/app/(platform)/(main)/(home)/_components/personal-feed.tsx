'use client';

import { ErrorFallback } from '@/components/error-fallback';
import { PostCardFull } from '@/components/post/post-card-full';
import { ShareCard } from '@/components/post/share-post';
import { Emotion } from '@/models/social/enums/social.enum';
import { FeedType, PostSnapshotDTO, useMyFeed } from '@repo/shared';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

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
  } = useMyFeed({ limit: 10, mainEmotion: mainEmotion as any });
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, isFetchingNextPage, hasNextPage]);

  return (
    <div className="space-y-4">
      {isLoading &&
        Array.from({ length: 2 }).map((_, index) => (
          <div key={index}>
            <PostCardFull.Skeleton />
          </div>
        ))}
      {isError && <ErrorFallback message={error.message} />}
      {!isLoading && !isError && allFeedItems.length === 0 && (
        <div className="w-full p-8 text-neutral-500 text-center">
          Không có bài viết nào trong bảng tin.
        </div>
      )}

      {/* Danh sách bài viết */}
      {allFeedItems.map((feed) =>
        feed.type === FeedType.POST ? (
          <PostCardFull key={feed.id} data={feed.data as PostSnapshotDTO} />
        ) : (
          <ShareCard key={feed.id} data={feed.data as any} />
        ),
      )}
      {isFetchingNextPage && <PostCardFull.Skeleton />}
      <div ref={ref}></div>
    </div>
  );
};
