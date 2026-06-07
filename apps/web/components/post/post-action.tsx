'use client';

import {
  useDisReact,
  useReact,
  ReactionType,
  RootType,
  TargetType,
  PostSnapshotDTO,
  SharePostSnapshotDTO,
} from '@repo/shared';
import { Reaction, reactionMap } from '@/lib/types/reaction';
import { cn } from '@/lib/utils';
import { useCommentModal, useCreateShareModal } from '@/store/use-post-modal';
import { MessageCircle, Share2, ThumbsUp } from '@/lib/icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ReactionHoverPopup } from '../reaction-hover-popup';
import { Button } from '../ui/button';

// Hoisted constants to prevent re-computation
const LIKE_REACTION = reactionMap.get(ReactionType.LIKE) ?? null;

interface PostActionsProps {
  reactType?: ReactionType;
  rootType: RootType;
  rootId: string;
  data: PostSnapshotDTO | SharePostSnapshotDTO;
  isShare?: boolean;
  disableCommentModal?: boolean;
}

export default function PostActions({
  reactType,
  rootType,
  rootId,
  data,
  isShare,
  disableCommentModal = false,
}: PostActionsProps) {
  const { mutateAsync: react } = useReact();
  const { mutateAsync: disReact } = useDisReact();

  const { openModal: openCommentModal } = useCommentModal();
  const { openModal: openCreateShareModal } = useCreateShareModal();

  const targetType: TargetType = useMemo(() => {
    return rootType === RootType.POST ? TargetType.POST : TargetType.SHARE;
  }, [rootType]);

  const reactionFromProp = useMemo(() => {
    return reactType
      ? reactionMap.get(reactType) ?? null
      : null;
  }, [reactType]);

  const [selected, setSelected] = useState<Reaction | null>(reactionFromProp);
  const [showReactions, setShowReactions] = useState(false);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync selected khi reactType prop đổi (WS update/refresh query)
  useEffect(() => {
    setSelected(reactionFromProp);
  }, [reactionFromProp]);

  // Cleanup function for hover timeout - explicitly called in handlers and unmount
  const clearHoverTimeout = useCallback(() => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {  return clearHoverTimeout;
  }, [clearHoverTimeout]);

  const openReactions = useCallback(() => {
    clearHoverTimeout();
    setShowReactions(true);
  }, [clearHoverTimeout]);

  const closeReactions = useCallback(() => {
    clearHoverTimeout();
    hoverTimeout.current = setTimeout(() => setShowReactions(false), 150);
  }, [clearHoverTimeout]);

  const commitReact = useCallback(
    async (next: Reaction | null, prev: Reaction | null) => {
      try {
        if (!next) {
          await disReact({ targetId: rootId, targetType: targetType as any });
        } else {
          await react({
            targetId: rootId,
            targetType: targetType as any,
            reactionType: next.type as any,
          });
        }
      } catch (e) {
        console.error('Reaction failed:', e);
        setSelected(prev); // rollback UI
      }
    },
    [disReact, react, rootId, targetType]
  );

  const handleSelect = useCallback(
    async (picked: Reaction | null) => {
      setShowReactions(false);
      if (!picked) return;

      const prev = selected;
      const isSame = prev?.type === picked.type;
      const next = isSame ? null : picked;

      setSelected(next);
      await commitReact(next, prev);
    },
    [commitReact, selected]
  );



  const handleQuickReact = useCallback(async () => {
    const prev = selected;

    // toggle LIKE nhanh
    const next = prev ? null : LIKE_REACTION;

    setSelected(next);
    await commitReact(next, prev);
  }, [commitReact, selected]);

  // Memoize computed values to prevent unnecessary array searches
  const selectedType = selected?.type;
  const label = useMemo(() => selected?.name ?? 'React', [selected?.name]);
  const emoji = useMemo(
    () => selectedType ? reactionMap.get(selectedType)?.emoji ?? null : null,
    [selectedType]
  );

  const handleOpenComment = useCallback(() => {
      if (disableCommentModal) return;
      openCommentModal(rootId, rootType, data.userId ,data);
    }, [disableCommentModal, openCommentModal, rootId, rootType, data]);

  return (
    <div className="relative border-t border-gray-100 pt-2">
      <div className="flex items-stretch text-sm text-gray-600">
        {/* React */}
        <ReactionHoverPopup
          open={showReactions}
          onOpenChange={setShowReactions}
          onSelect={handleSelect}
          selectedReaction={selected}
          onContentMouseEnter={openReactions}
          onContentMouseLeave={closeReactions}
          side="top"
        >
          <div
            className="relative flex-1"
            onMouseEnter={openReactions}
            onMouseLeave={closeReactions}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowReactions((prev) => !prev);
              }
            }}
          >
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className={cn(
                'w-full justify-center gap-2 rounded-lg',
                'hover:bg-gray-50 hover:text-sky-600',
                selected && 'text-sky-700'
              )}
              onClick={handleQuickReact}
              aria-label={selected ? `Đã ${label}` : 'Bày tỏ cảm xúc'}
            >
              {emoji ? (
                <span className="text-lg leading-none">{emoji}</span>
              ) : (
                <ThumbsUp size={16} />
              )}
              <span className={cn(selected?.color, selected && 'font-semibold')}>
                {label}
              </span>
            </Button>
          </div>
        </ReactionHoverPopup>

        {/* divider */}
        <div className="w-px bg-gray-100 mx-1" />

        {/* Comment */}
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="flex-1 justify-center gap-2 rounded-lg hover:bg-gray-50 hover:text-sky-600"
          onClick={handleOpenComment}
          aria-label="Bình luận"
        >
          <MessageCircle size={16} />
          <span>Comment</span>
        </Button>

        {/* divider */}
        {isShare && rootType === RootType.POST && (
          <>
            <div className="w-px bg-gray-100 mx-1" />
            {/* Share chỉ hợp lý cho Post gốc */}
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="flex-1 justify-center gap-2 rounded-lg hover:bg-gray-50 hover:text-sky-600"
              onClick={() => openCreateShareModal(data as PostSnapshotDTO)}
              aria-label="Chia sẻ"
            >
              <Share2 size={16} />
              <span>Share</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
