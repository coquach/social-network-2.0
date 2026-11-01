'use client';

import { ErrorFallback } from '@/components/error-fallback';
import { PostCardFull } from '@/components/post/post-card-full';
import { AsyncList } from '@/components/ui/async-list';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { useUserPosts } from '@repo/shared/hooks';
import type { PostDTO, PostSnapshotDTO } from '@repo/shared';

const toPostSnapshot = (post: PostDTO): PostSnapshotDTO => ({
  postId: post.id,
  userId: post.userId,
  user: post.user,
  group: post.group,
  content: post.content,
  audience: post.audience,
  mediaPreviews: post.media,
  mainEmotion: post.feeling,
  postStat: post.postStat,
  reactedType: post.reactedType,
  createdAt: post.createdAt,
});

export const UserPosts = ({ userId }: { userId: string }) => {
  const { data, isLoading, isError, error, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useUserPosts(userId, {});

  const allPosts = data?.pages.flatMap((page) => page.data) ?? [];

  const { sentinelRef } = useInfiniteScroll({ hasNextPage, isFetchingNextPage, fetchNextPage });

  return (
    <AsyncList<PostDTO>
      items={allPosts}
      keyExtractor={(post) => post.id}
      isLoading={isLoading}
      isError={isError}
      errorState={<ErrorFallback message={error?.message} />}
      skeleton={<PostCardFull.Skeleton />}
      skeletonCount={2}
      emptyState={
        <div className="w-full rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
          Hiện chưa có bài đăng nào.
        </div>
      }
      renderItem={(post) => <PostCardFull data={toPostSnapshot(post)} />}
      sentinelRef={sentinelRef}
      loadingMore={<PostCardFull.Skeleton />}
      stagger
    />
  );
};
