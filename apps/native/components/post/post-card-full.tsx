import React from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { RootType, TargetType } from '@repo/shared';

import { AppCard } from '~/components/ui/app-card';
import { PostAction } from './post-action';
import { PostContent } from './post-content';
import { PostHeader } from './post-header';
import { PostMedia } from './post-media';
import { PostStats } from './post-stats';

import type { PostSnapshotDTO, UserSnapshotDTO } from '@repo/shared';

export interface PostCardFullProps {
  data: PostSnapshotDTO;
  author?: UserSnapshotDTO;
}

export function PostCardFull({ data, author }: PostCardFullProps) {
  const router = useRouter();

  const authorData: UserSnapshotDTO = author ?? {
    id: data.userId,
    firstName: '',
    lastName: '',
  };

  // Navigate to post detail
  const goToPost = React.useCallback(() => {
    if (!data?.postId) return;
    router.push(`/post/${data.postId}` as never);
  }, [router, data?.postId]);

  // Media click → navigate
  const handlePressMedia = React.useCallback(
    (
      index: number,
      mediaItem: NonNullable<PostSnapshotDTO['mediaPreviews']>[number],
    ) => {
      goToPost();
    },
    [goToPost],
  );

  return (
    <AppCard className="rounded-[28px] border-transparent bg-app-surface/95 px-3 py-3 shadow-none dark:bg-app-surface-dark/95 sm:px-4 sm:py-4">
      {/* HEADER */}
      <PostHeader
        data={data}
        postId={data.postId}
        author={authorData}
        createdAt={data.createdAt}
        audience={data.audience}
      />

      {/* CONTENT */}
      <View className="mt-1.5">
        <PostContent text={data.content} />
      </View>

      {/* MEDIA */}
      <View className="mt-2">
        <PostMedia
          media={data.mediaPreviews}
          mediaRemaining={data.mediaRemaining}
          onPressMedia={handlePressMedia}
        />
      </View>

      {/* STATS */}
      <View className="mt-1.5">
        <PostStats
          targetId={data.postId}
          targetType={TargetType.POST}
          stats={data.postStat}
          data={data}
          isShare
        />
      </View>

      {/* ACTIONS */}
      <View className="mt-1.5">
        <PostAction
          reactType={data.reactedType}
          rootId={data.postId}
          rootType={RootType.POST}
          data={data}
          isShare
        />
      </View>
    </AppCard>
  );
}

export function PostCardFullSkeleton() {
  return (
    <AppCard className="gap-4 p-4">
      {/* Header */}
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 rounded-full bg-app-border dark:bg-app-border-dark" />
        <View className="flex-1 gap-2">
          <View className="h-4 w-1/3 rounded bg-app-border dark:bg-app-border-dark" />
          <View className="h-3 w-1/4 rounded bg-app-border dark:bg-app-border-dark" />
        </View>
      </View>

      {/* Content */}
      <View className="gap-2">
        <View className="h-3 w-full rounded bg-app-border dark:bg-app-border-dark" />
        <View className="h-3 w-5/6 rounded bg-app-border dark:bg-app-border-dark" />
        <View className="h-3 w-4/6 rounded bg-app-border dark:bg-app-border-dark" />
      </View>

      {/* Media */}
      <View className="flex-row gap-1">
        <View className="flex-1 h-48 rounded-xl bg-app-border dark:bg-app-border-dark" />
        <View className="flex-1 h-48 rounded-xl bg-app-border dark:bg-app-border-dark" />
      </View>

      {/* Stats */}
      <View className="flex-row items-center justify-between">
        <View className="h-4 w-16 rounded bg-app-border dark:bg-app-border-dark" />
        <View className="flex-row gap-4">
          <View className="h-4 w-12 rounded bg-app-border dark:bg-app-border-dark" />
          <View className="h-4 w-12 rounded bg-app-border dark:bg-app-border-dark" />
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row justify-between border-t border-app-border pt-2 dark:border-app-border-dark">
        <View className="h-4 w-16 rounded bg-app-border dark:bg-app-border-dark" />
        <View className="h-4 w-16 rounded bg-app-border dark:bg-app-border-dark" />
        <View className="h-4 w-16 rounded bg-app-border dark:bg-app-border-dark" />
      </View>
    </AppCard>
  );
}
