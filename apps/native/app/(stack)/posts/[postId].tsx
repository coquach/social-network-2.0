import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  InteractionManager,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RootType, TargetType, toPostSnapshot, usePost } from '@repo/shared';

import { CommentList } from '~/components/comment/comment-list';
import { PostAction } from '~/components/post/post-action';
import { PostContent } from '~/components/post/post-content';
import { PostHeader } from '~/components/post/post-header';
import { PostStats } from '~/components/post/post-stats';
import { AppSubtitle } from '~/components/ui/app-text';
import { appThemeColors } from '~/constants/theme';
import { useAppTheme } from '~/providers/theme-provider';

import { MediaCarousel } from './_components/media-carousel';
import {
  CommentInput,
  CommentInputRef,
} from '~/components/comment/comment-input';

type PostDetailParams = {
  postId: string;
  isCommentPressed?: string;
};

function PostNotFound({ onBack }: { onBack: () => void }) {
  return (
    <View className="flex-1 items-center justify-center bg-app-bg px-6 dark:bg-app-bg-dark">
      <View className="w-full max-w-md gap-4 rounded-3xl border border-app-border bg-app-surface px-5 py-6 dark:border-app-border-dark dark:bg-app-surface-dark">
        <Text className="text-lg font-semibold text-app-fg dark:text-app-fg-dark">
          Không tìm thấy bài viết
        </Text>
        <AppSubtitle>Bài viết không tồn tại hoặc đã bị xóa.</AppSubtitle>
        <Pressable
          onPress={onBack}
          className="min-h-11 flex-row items-center justify-center rounded-full bg-app-primary px-4"
        >
          <Text className="text-sm font-semibold text-app-primary-fg">
            Quay lại
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function PostDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<PostDetailParams>();

  const { resolvedTheme } = useAppTheme();
  const colors = appThemeColors[resolvedTheme];

  /** ================= PARAM ================= */
  const postId = params.postId;
  const isCommentPressed = params.isCommentPressed === 'true';

  /** ================= DATA ================= */
  const {
    data: post,
    isLoading,
    isError,
  } = usePost(postId ?? '', {
    enabled: Boolean(postId),
  });

  const postSnapshot = React.useMemo(
    () => (post ? toPostSnapshot(post) : null),
    [post],
  );

  const hasMedia = (post?.media?.length ?? 0) > 0;

  /** ================= COMMENT INPUT REF ================= */
  const commentInputRef = React.useRef<CommentInputRef>(null);

  /** ================= COMMENT DEFER ================= */
  const [shouldMountComments, setShouldMountComments] = React.useState(false);

  React.useEffect(() => {
    if (!post?.id) {
      setShouldMountComments(false);
      return;
    }

    setShouldMountComments(false);

    const task = InteractionManager.runAfterInteractions(() => {
      setShouldMountComments(true);
    });

    return () => task.cancel();
  }, [post?.id]);

  /** ================= SCROLL CONTROL ================= */
  const listRef = React.useRef<any>(null);
  const commentOffsetY = React.useRef(0);

  React.useEffect(() => {
    if (shouldMountComments && isCommentPressed && listRef.current) {
      const task = InteractionManager.runAfterInteractions(() => {
        listRef.current?.scrollToOffset({
          offset: commentOffsetY.current - insets.top,
          animated: true,
        });

        commentInputRef.current?.focus();
      });

      return () => task.cancel();
    }
  }, [shouldMountComments, isCommentPressed, insets.top]);

  /** ================= NAV ================= */
  const onBack = React.useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(main)/newfeeds');
  }, [router]);

  /** ================= HEADER CONTENT ================= */
  const headerContent = React.useMemo(() => {
    if (!post || !postSnapshot) return <View />;

    return (
      <View
        onLayout={(e) => {
          commentOffsetY.current = e.nativeEvent.layout.height;
        }}
        className="overflow-hidden border border-app-border bg-app-surface dark:border-app-border-dark dark:bg-app-surface-dark"
      >
        <View className="mt-3 px-3">
          <PostContent
            text={post.content}
            collapsedLines={hasMedia ? 4 : 8}
            defaultExpanded={!hasMedia}
          />
        </View>

        {hasMedia && (
          <View className="mt-3 overflow-hidden">
            <MediaCarousel media={post.media} />
          </View>
        )}

        <View className="mt-1 px-3 pb-1">
          <PostStats
            targetId={post.id}
            targetType={TargetType.POST}
            stats={post.postStat}
            data={postSnapshot}
            isShare
          />
        </View>

        <PostAction
          reactType={post.reactedType}
          rootId={post.id}
          rootType={RootType.POST}
          data={postSnapshot}
          isShare
          onPressComment={() => {
            commentInputRef.current?.focus();

            listRef.current?.scrollToOffset({
              offset: commentOffsetY.current - insets.top,
              animated: true,
            });
          }}
        />
      </View>
    );
  }, [hasMedia, post, postSnapshot, insets.top]);

  /** ================= STATES ================= */
  if (!postId) {
    return <PostNotFound onBack={onBack} />;
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bg dark:bg-app-bg-dark">
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (isError || !post || !postSnapshot) {
    return <PostNotFound onBack={onBack} />;
  }

  /** ================= UI ================= */
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View
        style={{ paddingTop: insets.top + 10 }}
        className="px-4 pb-3 bg-app-bg dark:bg-app-bg-dark z-10"
      >
        <View className="flex-row items-center gap-3">
          <Pressable onPress={onBack}>
            <Ionicons name="chevron-back" size={21} />
          </Pressable>

          <View className="flex-1 overflow-hidden">
            <PostHeader
              data={postSnapshot}
              postId={post.id}
              createdAt={post.createdAt}
              audience={post.audience}
            />
          </View>
        </View>
      </View>

      {/* CONTENT */}
      {shouldMountComments ? (
        <CommentList
          ref={listRef}
          rootId={post.id}
          rootType={RootType.POST}
          listHeaderComponent={headerContent}
        />
      ) : (
        <View className="flex-1 items-center justify-center bg-app-bg dark:bg-app-bg-dark">
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}

      {/* COMMENT INPUT */}
      <CommentInput
        ref={commentInputRef}
        rootId={post.id}
        rootType={RootType.POST}
      />
    </>
  );
}
