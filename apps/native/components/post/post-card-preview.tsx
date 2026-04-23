import React from 'react';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { AppCard } from '~/components/ui/app-card';
import { cn } from '~/lib/cn';
import { PostContent } from './post-content';
import { PostHeader } from './post-header';
import { PostMedia } from './post-media';
import type { PostSnapshotDTO, UserSnapshotDTO } from '@repo/shared';

export interface PostCardPreviewProps {
  data: PostSnapshotDTO;
  author?: UserSnapshotDTO;
  embedded?: boolean;
  showSettings?: boolean;
  collapsedLines?: number;
  mediaSize?: 'default' | 'compact';
  maxHeight?: number;
  disableCardPress?: boolean;
  className?: string;
}

export function PostCardPreview({
  data,
  author: _author,
  embedded = false,
  showSettings = true,
  collapsedLines,
  mediaSize = 'default',
  maxHeight,
  disableCardPress = false,
  className,
}: PostCardPreviewProps) {
  const router = useRouter();

  const goToPost = React.useCallback(() => {
    if (!data?.postId) return;
    router.push(`/posts/${data.postId}` as never);
  }, [data?.postId, router]);

  const handlePressMedia = React.useCallback(() => {
    goToPost();
  }, [goToPost]);

  const cardClassName = cn(
    embedded
      ? 'gap-2 rounded-[22px] border-transparent bg-app-surface/70 px-2.5 py-2.5 shadow-none dark:bg-app-surface-dark/70'
      : 'gap-2.5 rounded-[28px] border-transparent bg-app-surface/95 px-3 py-3 shadow-none dark:bg-app-surface-dark/95',
    className,
  );

  const contentLines =
    typeof collapsedLines === 'number' ? collapsedLines : embedded ? 2 : undefined;

  const card = (
    <AppCard className={cardClassName}>
      <PostHeader
        data={data}
        postId={data.postId}
        createdAt={data.createdAt}
        audience={data.audience}
        compact={embedded}
        showSettings={showSettings}
      />

      <PostContent text={data.content} collapsedLines={contentLines} />

      <PostMedia
        media={data.mediaPreviews}
        mediaRemaining={data.mediaRemaining}
        size={mediaSize}
        onPressMedia={handlePressMedia}
      />
    </AppCard>
  );

  if (disableCardPress) {
    return (
      <View
        style={maxHeight ? { maxHeight } : undefined}
        className="overflow-hidden"
      >
        {card}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={goToPost}
      android_ripple={{ color: 'rgba(15, 23, 42, 0.06)' }}
      className="overflow-hidden rounded-2xl active:opacity-90"
      style={maxHeight ? { maxHeight } : undefined}
    >
      {card}
    </Pressable>
  );
}

export function PostCardPreviewSkeleton() {
  return (
    <AppCard className="gap-3">
      <View className="h-4 w-1/3 rounded bg-app-border dark:bg-app-border-dark" />
      <View className="h-3 w-2/3 rounded bg-app-border dark:bg-app-border-dark" />
      <View className="h-32 rounded-xl bg-app-border dark:bg-app-border-dark" />
    </AppCard>
  );
}
