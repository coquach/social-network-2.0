import React from 'react';
import { View } from 'react-native';
import { RootType, TargetType } from '@repo/shared';
import { AppCard } from '~/components/ui/app-card';
import { PostAction } from './post-action';
import { PostContent } from './post-content';
import { PostHeader } from './post-header';
import { PostStats } from './post-stats';
import { SharePostReview } from './share-post-review';
import type { SharePostSnapshotDTO, UserSnapshotDTO } from '@repo/shared';

export interface SharePostProps {
  data: SharePostSnapshotDTO;
  author?: UserSnapshotDTO;
  originalAuthor?: UserSnapshotDTO;
  compact?: boolean;
}

function SharePostComponent({
  data,
  author: _author,
  originalAuthor,
  compact = false,
}: SharePostProps) {
  return (
    <AppCard
      className={
        compact ? 'gap-2 rounded-2xl p-3' : 'gap-2.5 rounded-3xl p-3.5'
      }
    >
      <PostHeader
        data={data}
        postId={data.post.postId}
        shareId={data.shareId}
        createdAt={data.createdAt}
        audience={data.audience}
        isShared
      />

      <PostContent text={data.content} isShared collapsedLines={2} />

      <View className="pt-0.5">
        <SharePostReview post={data.post} author={originalAuthor} />
      </View>

      <PostStats
        targetId={data.shareId}
        targetType={TargetType.SHARE}
        stats={data.shareStat}
        data={data}
        isShare
      />

      <PostAction
        reactType={data.reactedType}
        rootId={data.shareId}
        rootType={RootType.SHARE}
        data={data}
        isShare
      />
    </AppCard>
  );
}

export const SharePost = React.memo(SharePostComponent);
