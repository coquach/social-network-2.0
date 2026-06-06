'use client';
import { ErrorFallback } from '@/components/error-fallback';
import { PostCardFull } from '@/components/post/post-card-full';
import { useMyPosts, useUserPosts } from '@repo/shared';
import { mapPostToSnapshot } from '@/utils/map-post-to-snapshot';
import type { PostSnapshotDTO } from '@/models/social/post/postDTO';
import { useAuth } from '@clerk/nextjs';

import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

export const UserPosts = ({ userId }: { userId: string }) => {
  const { userId: currentUserId } = useAuth();
  const isOwnProfile = userId === currentUserId;

  const myPostsQuery = useMyPosts(undefined, { enabled: isOwnProfile });
  const userPostsQuery = useUserPosts(userId, undefined, { enabled: !isOwnProfile });

  // Derive allPosts per-branch so TS knows the exact DTO shape in each path.
  // myPostsQuery already returns PostSnapshotDTO; userPostsQuery returns PostDTO and needs mapping.
  const allPosts: PostSnapshotDTO[] = isOwnProfile
    ? (myPostsQuery.data?.pages ?? []).flatMap((p) => p.data ?? [])
    : (userPostsQuery.data?.pages ?? []).flatMap((p) => p.data ?? []).map((post) => mapPostToSnapshot(post));

  // Use the active query only for loading/error/pagination state
  const query = isOwnProfile ? myPostsQuery : userPostsQuery;
  const { isLoading, isError, error, fetchNextPage, isFetchingNextPage, hasNextPage } = query;

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
      {isError && <ErrorFallback message={error instanceof Error ? error.message : 'Lỗi không xác định'} />}
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
