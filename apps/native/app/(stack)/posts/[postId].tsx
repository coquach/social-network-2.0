import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RootType, TargetType, toPostSnapshot, usePost } from '@repo/shared';

import { CommentList } from '~/components/comment/comment-list';
import {
  CommentInput,
  CommentInputRef,
} from '~/components/comment/comment-input';
import { PostAction } from '~/components/post/post-action';
import { PostContent } from '~/components/post/post-content';
import { PostHeader } from '~/components/post/post-header';
import { PostStats } from '~/components/post/post-stats';
import { appThemeColors } from '~/constants/theme';
import { useAppTheme } from '~/providers/theme-provider';
import { MediaCarousel } from '~/components/posts/media-carousel';

/** ================= KEYBOARD HANDLER ================= */
function useKeyboardHeight() {
  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      setHeight(e.endCoordinates.height);
    });

    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setHeight(0);
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return height;
}

/** ================= MAIN ================= */
function PostDetailScreenContent() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { resolvedTheme } = useAppTheme();
  const colors = appThemeColors[resolvedTheme];

  const { postId, isCommentPressed } = useLocalSearchParams<{
    postId: string;
    isCommentPressed?: string;
  }>();

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

  /** ================= KEYBOARD ================= */
  const keyboardHeight = useKeyboardHeight();

  const closeKeyboardThen = React.useCallback((next: () => void) => {
    Keyboard.dismiss();
    inputRef.current?.blur();

    setTimeout(() => {
      next();
    }, 120);
  }, []);

  /** ================= REFS ================= */
  const listRef = React.useRef<any>(null);
  const inputRef = React.useRef<CommentInputRef>(null);
  const commentOffsetY = React.useRef(0);

  /** ================= AUTO SCROLL ================= */
  React.useEffect(() => {
    if (!post || isCommentPressed !== 'true') return;

    setTimeout(() => {
      listRef.current?.scrollToOffset({
        offset: commentOffsetY.current - insets.top,
        animated: true,
      });

      inputRef.current?.focus();
    }, 100);
  }, [post, isCommentPressed, insets.top]);

  /** ================= HEADER ================= */
  const header = React.useMemo(() => {
    if (!post || !postSnapshot) return null;

    return (
      <View
        onLayout={(e) => {
          commentOffsetY.current = e.nativeEvent.layout.height;
        }}
        className="border border-app-border bg-app-surface dark:border-app-border-dark dark:bg-app-surface-dark"
      >
        <View className="mt-4 px-3">
          <PostContent
            text={post.content}
            collapsedLines={hasMedia ? 4 : 8}
            defaultExpanded={!hasMedia}
          />
        </View>

        {hasMedia && (
          <View className="mt-3">
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
            inputRef.current?.focus();
            listRef.current?.scrollToOffset({
              offset: commentOffsetY.current - insets.top,
              animated: true,
            });
          }}
        />
      </View>
    );
  }, [post, postSnapshot, hasMedia, insets.top]);

  /** ================= STATES ================= */
  if (!postId) return <PostNotFound />;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (isError || !post || !postSnapshot) {
    return <PostNotFound />;
  }

  /** ================= UI ================= */
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={{ flex: 1 }}>
        {/* HEADER NAV */}
        <View
          style={{ paddingTop: insets.top + 10 }}
          className="px-4 pb-3 bg-app-bg dark:bg-app-bg-dark"
        >
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => {
                closeKeyboardThen(() => {
                  router.back();
                });
              }}
            >
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

        {/* LIST */}
        <CommentList
          ref={listRef}
          rootId={post.id}
          rootType={RootType.POST}
          listHeaderComponent={header}
          contentContainerStyle={{
            paddingBottom: keyboardHeight + 80,
          }}
          style={{ flex: 1 }}
        />

        {/* INPUT (FIX CHUáº¨N) */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: keyboardHeight === 0 ? 0 : keyboardHeight + 20,
          }}
        >
          <CommentInput
            ref={inputRef}
            rootId={post.id}
            rootType={RootType.POST}
          />
        </View>
      </View>
    </>
  );
}

/** ================= FALLBACK ================= */
function PostNotFound() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text>KhÃ´ng tÃ¬m tháº¥y bÃ i viáº¿t</Text>
    </View>
  );
}

/** ================= EXPORT ================= */
export default function PostDetailScreen() {
  return <PostDetailScreenContent />;
}




