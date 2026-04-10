import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import { RootType, useComments, type CommentDTO } from '@repo/shared';

import { CommentInput } from './comment-input';
import { formatRelativeTime } from '~/utils/format-relative-time';

type CommentItemProps = {
  comment: CommentDTO;
  rootId: string;
  rootType: RootType;
};

function buildAvatarUrl(userId: string) {
  return `https://api.dicebear.com/9.x/thumbs/png?seed=${encodeURIComponent(userId)}`;
}

function CommentReplies({
  rootId,
  rootType,
  commentId,
}: {
  rootId: string;
  rootType: RootType;
  commentId: string;
}) {
  const { data, isLoading, fetchNextPage, isFetchingNextPage } = useComments({
    rootId,
    rootType,
    parentId: commentId,
  });

  const replies = React.useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );
  const pages = data?.pages ?? [];
  const lastPage = pages[pages.length - 1];
  const hasNextPage = Boolean(lastPage && lastPage.page < lastPage.totalPages);

  if (isLoading && replies.length === 0) {
    return (
      <View className="ml-12 gap-2 border-l border-app-border/70 pl-3 dark:border-app-border-dark/70">
        <View className="h-8 rounded-2xl bg-app-surface-elevated dark:bg-app-surface-elevated-dark" />
      </View>
    );
  }

  if (replies.length === 0) {
    return (
      <View className="ml-12 border-l border-app-border/70 pl-3 dark:border-app-border-dark/70">
        <Text className="text-xs text-app-muted-fg dark:text-app-muted-fg-dark">
          Chưa có phản hồi.
        </Text>
      </View>
    );
  }

  return (
    <View className="ml-12 gap-2 border-l border-app-border/70 pl-3 dark:border-app-border-dark/70">
      {replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          rootId={rootId}
          rootType={rootType}
        />
      ))}

      {hasNextPage && (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            if (!isFetchingNextPage) {
              void fetchNextPage();
            }
          }}
          className="self-start px-1 py-1 active:opacity-70"
        >
          <Text className="text-xs font-semibold text-app-primary">
            {isFetchingNextPage ? 'Đang tải...' : 'Xem thêm phản hồi'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function CommentItemComponent({ comment, rootId, rootType }: CommentItemProps) {
  const username = React.useMemo(
    () => `User ${comment.userId.slice(0, 6)}`,
    [comment.userId],
  );
  const [showReplies, setShowReplies] = React.useState(false);
  const [showReplyComposer, setShowReplyComposer] = React.useState(false);

  return (
    <View className="gap-2 px-4 py-3">
      <View className="flex-row gap-3">
        <Image
          source={{ uri: buildAvatarUrl(comment.userId) }}
          className="h-9 w-9 rounded-full border border-app-border dark:border-app-border-dark"
        />

        <View className="flex-1 gap-1.5">
          <View className="rounded-2xl bg-app-surface-elevated px-3 py-2.5 dark:bg-app-surface-elevated-dark">
            <Text className="text-[13px] font-semibold text-app-fg dark:text-app-fg-dark">
              {username}
            </Text>
            <Text className="mt-1 text-[14px] leading-5 text-app-fg dark:text-app-fg-dark">
              {comment.content}
            </Text>
          </View>

          <View className="flex-row items-center gap-4 pl-1">
            <Text className="text-[11px] text-app-muted-fg dark:text-app-muted-fg-dark">
              {formatRelativeTime(comment.createdAt)}
            </Text>
            <Pressable accessibilityRole="button" className="active:opacity-70">
              <Text className="text-[11px] font-medium text-app-muted-fg dark:text-app-muted-fg-dark">
                Thích
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="active:opacity-70"
              onPress={() => {
                setShowReplies(true);
                setShowReplyComposer((current) => !current);
              }}
            >
              <Text className="text-[11px] font-medium text-app-muted-fg dark:text-app-muted-fg-dark">
                Trả lời
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {showReplyComposer && (
        <View className="ml-12">
          <CommentInput
            rootId={rootId}
            rootType={rootType}
            parentId={comment.id}
            placeholder="Viết phản hồi..."
            onSubmitted={() => setShowReplyComposer(false)}
          />
        </View>
      )}

      {showReplies && (
        <CommentReplies
          rootId={rootId}
          rootType={rootType}
          commentId={comment.id}
        />
      )}
    </View>
  );
}

export const CommentItem = React.memo(CommentItemComponent);
