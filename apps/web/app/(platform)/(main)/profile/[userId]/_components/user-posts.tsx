'use client';
import { ErrorFallback } from '@/components/error-fallback';
import { PostCardFull } from '@/components/post/post-card-full';
import { useProfilePosts } from '@/hooks/use-post-hook';

import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

export const UserPosts = ({ userId }: { userId: string }) => {
  const { data: allPosts = [], isLoading, isError, error, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useProfilePosts(userId, { limit: 10 });

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
        <PostCardFull key={post.postId} data={post} />
      ))}
      {isFetchingNextPage && <PostCardFull.Skeleton />}
      <div ref={ref}></div>
    </div>
  );
};
