import React, { useMemo, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { ReactionType, RootType, TargetType } from '@repo/shared';
import type {
  PostSnapshotDTO,
  PostStatDTO,
  SharePostSnapshotDTO,
  SharePostStatDTO,
} from '@repo/shared';

import {
  useReactionModal,
  useCommentModal,
  useShareListModal,
} from '@repo/shared';

// ─────────────────────────────────────────

export interface PostStatsProps {
  targetId: string;
  targetType: TargetType;
  stats?: PostStatDTO | SharePostStatDTO;
  data: PostSnapshotDTO | SharePostSnapshotDTO;
  isShare?: boolean;
}

// ─────────────────────────────────────────

export const PostStats = React.memo(function PostStats({
  targetId,
  targetType,
  stats,
  data,
  isShare = false,
}: PostStatsProps) {
  const reactionModal = useReactionModal();
  const commentModal = useCommentModal();
  const shareListModal = useShareListModal();

  // ✅ compute từ stats
  const computed = useMemo(() => {
    if (!stats) return null;

    const s = stats as SharePostStatDTO;

    const reactions = s.reactions ?? 0;
    const comments = s.comments ?? 0;
    const shares = (stats as PostStatDTO).shares ?? 0;

    if (reactions === 0 && comments === 0 && (!shares || shares === 0)) {
      return null;
    }

    const reactionItems = [
      { type: ReactionType.LIKE, count: s.likes ?? 0, emoji: '👍' },
      { type: ReactionType.LOVE, count: s.loves ?? 0, emoji: '❤️' },
      { type: ReactionType.HAHA, count: s.hahas ?? 0, emoji: '😆' },
      { type: ReactionType.WOW, count: s.wows ?? 0, emoji: '😮' },
      { type: ReactionType.SAD, count: s.sads ?? 0, emoji: '😢' },
      { type: ReactionType.ANGRY, count: s.angrys ?? 0, emoji: '😡' },
    ];

    const sorted = [...reactionItems].sort((a, b) => b.count - a.count);

    const topReacts = sorted.filter((r) => r.count > 0).slice(0, 3);

    return {
      reactions,
      comments,
      shares,
      topReacts,
    };
  }, [stats]);

  // ─────────────────────────────────────────

  const onOpenReactions = useCallback(() => {
    reactionModal.openModal({
      targetId,
      targetType,
    });
  }, [reactionModal, targetId, targetType]);

  const onOpenComments = useCallback(() => {
    commentModal.openModal({
      rootId: targetId,
      rootType: isShare ? RootType.SHARE : RootType.POST,
      userId: data.userId,
      data,
    });
  }, [commentModal, targetId, isShare, data]);

  const onOpenShares = useCallback(() => {
    shareListModal.openModal(targetId);
  }, [shareListModal, targetId]);

  // ─────────────────────────────────────────

  if (!computed) return null;

  const { topReacts, reactions, comments, shares } = computed;

  return (
    <View className="flex-row items-center justify-between gap-2">
      {/* Reactions */}
      <Pressable
        onPress={onOpenReactions}
        className="flex-row items-center gap-2 rounded-full bg-app-surface-elevated/45 px-2.5 py-1.5 active:opacity-70 active:scale-[0.98]"
      >
        {topReacts.length > 0 ? (
          <View className="flex-row -space-x-1">
            {topReacts.map((r, i) => (
              <Text key={i} className="text-[17px]">
                {r.emoji}
              </Text>
            ))}
          </View>
        ) : (
          <Text className="text-[17px]">👍</Text>
        )}

        <Text className="text-[13px] font-semibold text-app-fg">
          {reactions}
        </Text>
      </Pressable>

      {/* Comments + Shares */}
      <View className="flex-row items-center gap-1.5">
        {comments > 0 && (
          <Pressable
            onPress={onOpenComments}
            className="min-h-9 flex-row items-center gap-1.5 rounded-full px-2.5 py-1.5 active:opacity-70 active:scale-[0.98]"
          >
            <Ionicons name="chatbubble-outline" size={15} color="#64748b" />
            <Text className="text-[12px] font-medium text-app-muted-fg">
              {comments}
            </Text>
          </Pressable>
        )}

        {isShare && shares > 0 && (
          <Pressable
            onPress={onOpenShares}
            className="min-h-9 flex-row items-center gap-1.5 rounded-full px-2.5 py-1.5 active:opacity-70 active:scale-[0.98]"
          >
            <Ionicons name="repeat-outline" size={15} color="#64748b" />
            <Text className="text-[12px] font-medium text-app-muted-fg">
              {shares}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
});
