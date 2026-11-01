'use client';

import { RootType, TargetType } from '@repo/shared';
import { PostSnapshotDTO } from '@repo/shared';
import { useRouter } from 'next/navigation';
import React, { useCallback } from 'react';
import { TextCollapse } from '../text-collapse';
import { Skeleton } from '../ui/skeleton';
import PostActions from './post-action';
import PostHeader from './post-header';
import PostMedia from './post-media';
import PostStats from './post-stats';

interface PostCardFullProps {
  data: PostSnapshotDTO;
}

/**
 * Full-featured post card with stats and actions.
 * Use for main feed displays where users can interact with posts.
 */
const PostCardFullComponent = ({ data }: PostCardFullProps) => {
  const router = useRouter();
  const goToPost = useCallback(() => {
    if (!data?.postId) return;
    router.push(`/posts/${data.postId}`);
  }, [router, data?.postId]);

  return (
    <article className="w-full rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-4 transition-shadow duration-200 hover:shadow-md">
      <PostHeader
        data={data}
        postId={data.postId}
        userId={data.userId}
        audience={data.audience}
        createdAt={data.createdAt}
      />
      <TextCollapse
        text={data.content}
        maxLength={100}
        className="min-w-0 text-[15px] leading-6 text-card-foreground"
        textClassName="wrap-break-word"
        buttonClassName="mt-1 text-sm"
      />
      <PostMedia media={data.mediaPreviews} onClick={goToPost} />
      <PostStats
        targetId={data.postId}
        targetType={TargetType.POST}
        stats={data.postStat}
        data={data}
        isShare
      />
      <PostActions
        reactType={data.reactedType}
        rootId={data.postId}
        rootType={RootType.POST}
        data={data}
        isShare
      />
    </article>
  );
};

function PostCardFullSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border p-4 sm:p-8 space-y-4 w-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="skeleton-shimmer h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton-shimmer h-4 w-1/3" />
          <div className="skeleton-shimmer h-3 w-1/4" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="skeleton-shimmer h-3 w-full" />
        <div className="skeleton-shimmer h-3 w-5/6" />
        <div className="skeleton-shimmer h-3 w-4/6" />
      </div>

      {/* Media preview */}
      <div className="grid grid-cols-2 gap-1">
        <div className="skeleton-shimmer w-full h-48 rounded-lg" />
        <div className="skeleton-shimmer w-full h-48 rounded-lg" />
      </div>

      {/* Stat */}
      <div className="flex items-center justify-between">
        <div className="skeleton-shimmer w-16 h-4 rounded" />
        <div className="flex items-center gap-4">
          <div className="skeleton-shimmer w-12 h-4 rounded" />
          <div className="skeleton-shimmer w-12 h-4 rounded" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-2 border-t border-border">
        <div className="skeleton-shimmer h-4 w-16" />
        <div className="skeleton-shimmer h-4 w-16" />
        <div className="skeleton-shimmer h-4 w-16" />
      </div>
    </div>
  );
}

export const PostCardFull = Object.assign(
  React.memo(PostCardFullComponent, (prev, next) => {
    return (
      prev.data.postId === next.data.postId &&
      prev.data.content === next.data.content &&
      prev.data.audience === next.data.audience &&
      prev.data.reactedType === next.data.reactedType &&
      prev.data.mediaRemaining === next.data.mediaRemaining &&
      prev.data.mediaPreviews?.length === next.data.mediaPreviews?.length &&
      prev.data.postStat?.reactions === next.data.postStat?.reactions &&
      prev.data.postStat?.comments === next.data.postStat?.comments &&
      prev.data.postStat?.shares === next.data.postStat?.shares
    );
  }),
  {
    Skeleton: PostCardFullSkeleton,
  }
);
