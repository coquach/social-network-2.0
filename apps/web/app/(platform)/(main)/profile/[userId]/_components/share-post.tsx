'use client';
import { ErrorFallback } from '@/components/error-fallback';
import { PostCardFull } from '@/components/post/post-card-full';
import { ShareCard } from '@/components/post/share-post';
import { useUserShares } from '@repo/shared';

import { useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

export const UserSharePosts = ({ userId }: { userId: string }) => {
  const { data, isLoading, isError, error, fetchNextPage, isFetchingNextPage } =
    useUserShares(userId, { limit: 10 });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, isFetchingNextPage, data]);

  const allPosts = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

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
        <div className="w-full py-10 text-center text-slate-500">
          Hiện không có bài viết nào.
        </div>
      )}

      {allPosts.map((post) => (
        <ShareCard key={post.shareId
          
        } data={post} />
      ))}
      {isFetchingNextPage && <PostCardFull.Skeleton />}
      <div ref={ref}></div>
    </div>
  );
};
