'use client';

import {
  ReactionType,
  RootType,
  TargetType,
  PostSnapshotDTO,
  PostStatDTO,
  SharePostSnapshotDTO,
  SharePostStatDTO,
} from '@repo/shared';
import { MessageCircle, Repeat2 } from '@/lib/icons';
import { useCallback, useMemo } from 'react';
import {
  useCommentModal,
  useReactionModal,
  useShareListModal,
} from '@/store/use-post-modal';
import { formatCount } from '@/utils/format-count';
import { getTopReactions } from '@/utils/get-top-reactions';
import { cn } from '@/lib/utils';

interface PostStatsProps {
  targetId: string;
  targetType: TargetType;
  stats?: PostStatDTO | SharePostStatDTO;
  data: PostSnapshotDTO | SharePostSnapshotDTO;
  isShare?: boolean; //  để phân biệt loại
}

export default function PostStats({
  targetId,
  targetType,
  stats,
  data,
  isShare = false,
}: PostStatsProps) {
  const reactionModal = useReactionModal();
  const commentModal = useCommentModal();
  const shareListModal = useShareListModal();
  const computed = useMemo(() => {
    if (!stats) return null;

    const s = stats as SharePostStatDTO;
    const reactions = s.reactions ?? 0;
    const comments = s.comments ?? 0;
    // Nếu có `shares` (PostStatDTO) thì lấy, còn share bài thì không
    const shares = (stats as PostStatDTO).shares ?? 0;

    if (reactions === 0 && comments === 0 && (!shares || shares === 0))
      return null;

    const { topReacts, total } = getTopReactions([
      { type: ReactionType.LIKE, count: s.likes ?? 0 },
      { type: ReactionType.LOVE, count: s.loves ?? 0 },
      { type: ReactionType.HAHA, count: s.hahas ?? 0 },
      { type: ReactionType.WOW, count: s.wows ?? 0 },
      { type: ReactionType.SAD, count: s.sads ?? 0 },
      { type: ReactionType.ANGRY, count: s.angrys ?? 0 },
    ]);
    return {
      total,
      reactions,
      topReacts,
      comments,
      shares,
    };
  }, [stats]);

  const onOpenReactions = useCallback(() => {
    reactionModal.openModal(targetType, targetId);
  }, [reactionModal, targetType, targetId]);

  const onOpenComments = useCallback(() => {
    commentModal.openModal(
      targetId,
      isShare ? RootType.POST : RootType.SHARE,
      data.userId,
      data
    );
  }, [commentModal, targetId, isShare, data]);

  const onOpenShares = useCallback(() => {
    shareListModal.openModal(targetId);
  }, [shareListModal, targetId]);

  if (!computed) return null;

  const { topReacts, reactions: total, comments, shares } = computed;

  return (
    <div className="flex items-center justify-between text-sm text-neutral-600">
      {/* Reactions */}
      <button
        type="button"
        onClick={onOpenReactions}
        className={cn(
          'flex items-center gap-1 rounded-md',
          'hover:text-neutral-800 transition',
          'focus:outline-none focus:ring-2 focus:ring-sky-500'
        )}
        aria-label="Xem danh sách cảm xúc"
      >
        {topReacts.length > 0 && (
          <span className="flex -space-x-1">
            {topReacts.map((r, i) => (
              <span
                key={`${r!.name}-${i}`}
                className={cn(
                  'text-lg bg-white rounded-full',
                  'transition-transform hover:scale-110'
                )}
                title={r!.name}
              >
                {r!.emoji}
              </span>
            ))}
          </span>
        )}

        {total > 0 && (
          <span className="ml-1 font-medium text-neutral-700 hover:underline underline-offset-2">
            {formatCount(total)}
          </span>
        )}
      </button>
      {/* Comments + Shares */}
      <div className="flex items-center gap-4">
        {comments > 0 && (
          <button
            type="button"
            onClick={onOpenComments}
            className="flex items-center gap-1 hover:text-sky-600 transition focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-md px-1"
            aria-label="Xem bình luận"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{formatCount(comments)}</span>
          </button>
        )}

        {isShare && shares > 0 && (
          <button
            type="button"
            onClick={onOpenShares}
            className="flex items-center gap-1 hover:text-sky-600 transition focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-md px-1"
            aria-label="Xem lượt chia sẻ"
          >
            <Repeat2 className="w-4 h-4" />
            <span>{formatCount(shares)}</span>
          </button>
        )}
      </div>
    </div>
  );
}
