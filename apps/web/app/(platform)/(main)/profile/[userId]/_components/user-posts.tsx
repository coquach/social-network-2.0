'use client';
import { ErrorFallback } from '@/components/error-fallback';
import { PostCardFull } from '@/components/post/post-card-full';
import { useUserPosts } from '@repo/shared/hooks';

import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

export const UserPosts = ({ userId }: { userId: string }) => {
  const { data, isLoading, isError, error, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useUserPosts(userId, {});

  const allPosts = data?.pages.flatMap((page) => page.data) ?? [];

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
        <div className="w-full py-10 text-center text-slate-500">
          Hiện chưa có bài đăng nào.
        </div>
      )}

      {allPosts.map((post) => (
        <PostCardFull key={(post as any).postId || (post as any)._id} data={post as any} />
      ))}
      {isFetchingNextPage && <PostCardFull.Skeleton />}
      <div ref={ref}></div>
    </div>
  );
};
