'use client';

import { ErrorFallback } from '@/components/error-fallback';
import { PostCardFull } from '@/components/post/post-card-full';
import { useTrendingFeed } from '@repo/shared';
import { Emotion } from '@/models/social/enums/social.enum';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

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
  } = useTrendingFeed({ limit: 10, mainEmotion: mainEmotion as any });

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
      {!isLoading && !isError && allPosts.length === 0 && (
        <div className="w-full p-8 text-neutral-500 text-center">
          Không có bài viết xu hướng nào.
        </div>
      )}

      {/* Danh sách bài viết */}
      {allPosts.map((post) => (
        <PostCardFull key={post.postId} data={post} />
      ))}
      {isFetchingNextPage && <PostCardFull.Skeleton />}
      <div ref={ref}></div>
    </div>
  );
};
