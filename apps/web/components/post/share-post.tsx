'use client';

import {
  Audience,
  RootType,
  TargetType,
} from '@/models/social/enums/social.enum';
import PostActions from './post-action';
import PostHeader from './post-header';
import { SharePostSnapshotDTO } from '@/models/social/post/sharePostDTO';
import { Skeleton } from '../ui/skeleton';
import PostStats from './post-stats';
import SharedPostPreview from './share-post-review';
import { cn } from '@/lib/utils';
import { TextCollapse } from '../text-collapse';

export const ShareCard = ({
  data,
  compact = false,
}: {
  data: SharePostSnapshotDTO;
  compact?: boolean;
}) => {
  return (
    <article
      className={cn(
        'w-full rounded-2xl border border-gray-100 bg-white',
        compact ? 'p-4 space-y-3' : 'p-4 sm:p-6 space-y-4'
      )}
    >
      {/* Header của người share */}
      <PostHeader
        data={data}
        postId={data.post.postId}
        shareId={data.shareId}
        userId={data.userId}
        audience={Audience.PUBLIC}
        createdAt={data.createdAt}
        isShared
      />
      <TextCollapse
        text={data.content}
        maxLength={100}
        className="min-w-0 text-[15px] leading-6 text-neutral-800"
        buttonClassName="mt-1 text-sm"
      />

      {/* Bài post được chia sẻ */}
      {data.post && <SharedPostPreview post={data.post} />}

      {/* Stats */}

      <PostStats
        stats={data.shareStat}
        data={data}
        targetId={data.shareId}
        targetType={TargetType.SHARE}
      />
      {/* Thanh action của share (react, cmt, share lại) */}
      <PostActions
        reactType={data.reactedType}
        rootId={data.shareId}
        rootType={RootType.SHARE}
        data={data}
      />
    </article>
  );
};

ShareCard.Skeleton = function ShareCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow p-4 sm:p-6 space-y-4 w-full animate-pulse">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>

      {/* Shared Post Preview */}
      <div className="border rounded-lg bg-neutral-50 p-4 space-y-3">
        {/* 🖼Media trước */}
        <Skeleton className="w-full h-48 rounded-md" />

        {/*  Header người đăng bài gốc */}
        <div className="flex items-center gap-3 pt-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>

        {/*  Content bài post gốc */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/6" />
        </div>
      </div>
      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        {/* Reactions */}
        <div className="flex items-center gap-2">
          <Skeleton className="w-16 h-4 rounded" />
        </div>

        {/* Comments + Shares */}
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-4 rounded" />
          <Skeleton className="w-12 h-4 rounded" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-2 border-t border-gray-100">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
};
