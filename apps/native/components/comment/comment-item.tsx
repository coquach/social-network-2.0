import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import {
  ReactionType,
  RootType,
  TargetType,
  useComments,
  useDisReact,
  useReactionModal,
  useReact,
  type CommentDTO,
} from '@repo/shared';

import { CommentInput } from './comment-input';
import { formatRelativeTime } from '~/utils/format-relative-time';
import { Avatar } from '~/components/avatar';
import {
  ReactionPicker,
  ReactionOption,
} from '~/components/modals/reaction-picker';

type CommentItemProps = {
  comment: CommentDTO;
  rootId: string;
  rootType: RootType;
};

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
  const [showReplies, setShowReplies] = React.useState(false);
  const [showReplyComposer, setShowReplyComposer] = React.useState(false);
  const reactionModal = useReactionModal();
  const { mutateAsync: react } = useReact();
  const { mutateAsync: disReact } = useDisReact();
  const [selectedReaction, setSelectedReaction] = useState<
    ReactionType | undefined
  >(comment.reactedType);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerAnchorY, setPickerAnchorY] = useState<number>();
  const reactionRowRef = useRef<View>(null);

  useEffect(() => {
    setSelectedReaction(comment.reactedType);
  }, [comment.id, comment.reactedType]);

  const reactionOptions: ReactionOption[] = useMemo(
    () => [
      { type: ReactionType.LIKE, emoji: '👍', label: 'Thích' },
      { type: ReactionType.LOVE, emoji: '❤️', label: 'Yêu thích' },
      { type: ReactionType.HAHA, emoji: '😆', label: 'Haha' },
      { type: ReactionType.WOW, emoji: '😮', label: 'Wow' },
      { type: ReactionType.SAD, emoji: '😢', label: 'Buồn' },
      { type: ReactionType.ANGRY, emoji: '😡', label: 'Phẫn nộ' },
    ],
    [],
  );

  const commitReaction = useCallback(
    async (next?: ReactionType) => {
      const prev = selectedReaction;
      setSelectedReaction(next);

      try {
        if (!next) {
          await disReact({
            targetId: comment.id,
            targetType: TargetType.COMMENT,
          });
        } else {
          await react({
            targetId: comment.id,
            targetType: TargetType.COMMENT,
            reactionType: next,
          });
        }
      } catch (error) {
        setSelectedReaction(prev);
      }
    },
    [comment.id, disReact, react, selectedReaction],
  );

  const handleQuickReact = useCallback(() => {
    const next = selectedReaction ? undefined : ReactionType.LIKE;
    void commitReaction(next);
  }, [commitReaction, selectedReaction]);

  const handleSelectReaction = useCallback(
    (reaction: ReactionType) => {
      setPickerOpen(false);

      const isSame = selectedReaction === reaction;
      const next = isSame ? undefined : reaction;

      void commitReaction(next);
    },
    [commitReaction, selectedReaction],
  );

  const openReactionPicker = useCallback(() => {
    if (!reactionRowRef.current) {
      setPickerOpen(true);
      return;
    }

    reactionRowRef.current.measureInWindow((_x, y, _w, h) => {
      setPickerAnchorY(y + h / 2);
      setPickerOpen(true);
    });
  }, []);

  const selectedReactionOption = reactionOptions.find(
    (option) => option.type === selectedReaction,
  );

  const commentStats = useMemo(() => {
    const stats = comment.commentStat;
    const reactionItems = [
      { type: ReactionType.LIKE, count: stats.likes, emoji: '👍' },
      { type: ReactionType.LOVE, count: stats.loves, emoji: '❤️' },
      { type: ReactionType.HAHA, count: stats.hahas, emoji: '😆' },
      { type: ReactionType.WOW, count: stats.wows, emoji: '😮' },
      { type: ReactionType.SAD, count: stats.sads, emoji: '😢' },
      { type: ReactionType.ANGRY, count: stats.angrys, emoji: '😡' },
    ];

    const topReaction = [...reactionItems].sort((a, b) => b.count - a.count)[0];

    return {
      reactions: stats.reactions ?? 0,
      replies: stats.replies ?? 0,
      topReaction: topReaction?.count ? topReaction : undefined,
    };
  }, [comment.commentStat]);

  const handleOpenReactionModal = useCallback(() => {
    reactionModal.openModal({
      targetId: comment.id,
      targetType: TargetType.COMMENT,
    });
  }, [comment.id, reactionModal]);

  return (
    <View className="gap-2 px-4 py-3">
      {pickerOpen && (
        <ReactionPicker
          open={pickerOpen}
          anchorY={pickerAnchorY}
          options={reactionOptions}
          onSelectReaction={handleSelectReaction}
          onClose={() => setPickerOpen(false)}
        />
      )}

      <View className="flex-row gap-3">
        <Avatar userId={comment.userId} size="medium">
          <Avatar.Image />
        </Avatar>

        <View className="flex-1 gap-1.5">
          <View className="rounded-2xl bg-app-surface-elevated px-3 py-2.5 dark:bg-app-surface-elevated-dark">
            <Avatar userId={comment.userId} size="medium">
              <Avatar.Name />
            </Avatar>

            <Text className="mt-1 text-[15px] leading-5 text-app-fg dark:text-app-fg-dark">
              {comment.content}
            </Text>
          </View>

          <View className="flex-row items-center justify-between gap-3 pl-1">
            <View className="min-w-0 flex-1 flex-row items-center gap-4">
              <Text className="text-[11px] text-app-muted-fg dark:text-app-muted-fg-dark">
                {formatRelativeTime(comment.createdAt)}
              </Text>

              <View ref={reactionRowRef}>
                <Pressable
                  className="active:opacity-70"
                  onPress={handleQuickReact}
                  onLongPress={openReactionPicker}
                >
                  {selectedReactionOption ? (
                    <Text className="text-[12px] font-medium text-app-primary">
                      {selectedReactionOption.label}
                    </Text>
                  ) : (
                    <Text className="text-[12px] font-medium text-app-muted-fg dark:text-app-muted-fg-dark">
                      Thích
                    </Text>
                  )}
                </Pressable>
              </View>

              <Pressable
                className="active:opacity-70"
                onPress={() => {
                  setShowReplies(true);
                  setShowReplyComposer((current) => !current);
                }}
              >
                <Text className="text-[12px] font-medium text-app-muted-fg dark:text-app-muted-fg-dark">
                  Trả lời
                </Text>
              </Pressable>
            </View>

            {(commentStats.reactions > 0 || commentStats.replies > 0) && (
              <View className="shrink-0 flex-row items-center gap-3">
                {commentStats.reactions > 0 && commentStats.topReaction && (
                  <Pressable
                    accessibilityRole="button"
                    onPress={handleOpenReactionModal}
                    className="flex-row items-center gap-1 active:opacity-70"
                  >
                    <Text className="text-[14px]">
                      {commentStats.topReaction.emoji}
                    </Text>
                    <Text className="text-[12px] font-medium text-app-muted-fg dark:text-app-muted-fg-dark">
                      {commentStats.reactions}
                    </Text>
                  </Pressable>
                )}

                {commentStats.replies > 0 && (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setShowReplies(true);
                    }}
                    className="flex-row items-center gap-1 active:opacity-70"
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={14}
                      color="#64748b"
                    />
                    <Text className="text-[12px] font-medium text-app-muted-fg dark:text-app-muted-fg-dark">
                      {commentStats.replies}
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
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
