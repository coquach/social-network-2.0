import React from 'react';
import { useRouter } from 'expo-router';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { PostCardPreview } from './post-card-preview';
import type { PostSnapshotDTO, UserSnapshotDTO } from '@repo/shared';

export interface SharePostReviewProps {
  post: PostSnapshotDTO;
  author?: UserSnapshotDTO;
}

export function SharePostReview({ post, author }: SharePostReviewProps) {
  const router = useRouter();
  const { height } = useWindowDimensions();

  const authorData: UserSnapshotDTO = author ?? {
    id: post.userId,
    firstName: '',
    lastName: '',
  };

  // navigation centralized (giống web)
  const goToPost = React.useCallback(() => {
    if (!post?.postId) return;
    router.push(`/post/${post.postId}` as never);
  }, [post?.postId, router]);

  // giới hạn chiều cao preview
  const maxPreviewHeight = React.useMemo(
    () => Math.max(Math.floor(height * 0.6), 220),
    [height],
  );

  // detect nested share (share của share)
  const nestedPost = React.useMemo(() => {
    const candidate = (post as PostSnapshotDTO & { post?: unknown }).post;

    if (!candidate || typeof candidate !== 'object') return null;

    const maybePost = candidate as Partial<PostSnapshotDTO>;

    return typeof maybePost.postId === 'string' ? maybePost : null;
  }, [post]);

  return (
    <View className="gap-2.5">
      {/* Preview card */}
      <PostCardPreview
        data={post}
        author={authorData}
        embedded
        showSettings={false}
        collapsedLines={2}
        mediaSize="compact"
        maxHeight={maxPreviewHeight}
      />

      {/* Nested share hint */}
      {nestedPost ? (
        <Pressable
          accessibilityRole="link"
          onPress={goToPost}
          android_ripple={{ color: 'rgba(15, 23, 42, 0.06)' }}
          className="rounded-xl bg-app-surface/55 px-3 py-2 active:opacity-80 dark:bg-app-surface-dark/55"
        >
          <Text className="text-xs leading-5 text-app-muted-fg dark:text-app-muted-fg-dark">
            Bài viết gốc chứa bài chia sẻ khác. Nhấn để xem chi tiết.
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
