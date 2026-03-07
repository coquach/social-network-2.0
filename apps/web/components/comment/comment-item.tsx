'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useDisReact, useReact } from '@/hooks/use-reaction-hook';
import { useGetComments, useUpdateComment } from '@/hooks/user-comment-hook';
import { Reaction, reactionMap } from '@/lib/types/reaction';
import { cn } from '@/lib/utils';
import { CommentDTO, CommentStatDTO } from '@/models/social/comment/commentDTO';
import {
  MediaType,
  ReactionType,
  RootType,
  TargetType,
} from '@/models/social/enums/social.enum';
import {
  useDeleteCommentModal,
  useReactionModal,
} from '@/store/use-post-modal';
import { formatCount } from '@/utils/format-count';
import { getTopReactions } from '@/utils/get-top-reactions';
import { formatDistanceToNow } from 'date-fns';
import { Edit, Flag, MessageCircle, MoreHorizontal, Trash } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { toast } from 'sonner';
import { CommentAvatar } from '../avatar';
import { ReactionHoverPopup } from '../reaction-hover-popup';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Skeleton } from '../ui/skeleton';
import { CommentInput } from './comment-input';
import { vi } from 'date-fns/locale';
import { TextCollapse } from '../text-collapse';
import { useAuth } from '@clerk/nextjs';
import { CreateReportModal } from '../modals/create-report-modal';

interface CommentItemProps {
  rootId: string;
  rootType: RootType;
  ownerPostId: string;
  comment: CommentDTO;
}

const findReaction = (type?: ReactionType) =>
  type ? reactionMap.get(type) ?? null : null;

export const CommentItem = ({
  rootId,
  rootType,
  ownerPostId,
  comment,
}: CommentItemProps) => {
  const { userId: currentUserId } = useAuth();
  const { openModal: openReactionModal } = useReactionModal();
  const { openModal: openDeleteModal } = useDeleteCommentModal();
  const [openReportModal, setOpenReportModal] = useState(false);

  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const { data: replyData, isLoading: loadingReplies } = useGetComments({
    rootId,
    rootType,
    parentId: comment.id,
  });

  const replies = useMemo(
    () => (replyData ? replyData.pages.flatMap((p) => p.data) : []),
    [replyData]
  );

  const createAtFormat = useMemo(() => {
    if (!comment.createdAt) return null;
    return formatDistanceToNow(comment.createdAt, { locale: vi });
  }, [comment.createdAt]);

  // =========================
  // Reactions (optimized)
  // =========================
  const { mutateAsync: react } = useReact(comment.id);
  const { mutateAsync: disReact } = useDisReact(comment.id);

  const [showReactions, setShowReactions] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  //  local selected + sync when server changes
  const [selected, setSelected] = useState<Reaction | null>(
    findReaction(comment.reactedType)
  );

  useEffect(() => {
    // sync after refetch/invalidate
    setSelected(findReaction(comment.reactedType));
  }, [comment.reactedType]);

  const handleMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = null;
    setShowReactions(true);
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => setShowReactions(false), 150);
  };

  const handleSelect = useCallback(
    async (r: Reaction | null) => {
      setShowReactions(false);
      if (!r) return;

      const prev = selected;
      const isSame = prev?.type === r.type;

      //  optimistic
      setSelected(isSame ? null : r);

      try {
        if (isSame) {
          await disReact({
            targetId: comment.id,
            targetType: TargetType.COMMENT,
          });
        } else {
          await react({
            targetId: comment.id,
            targetType: TargetType.COMMENT,
            reactionType: r.type,
          });
        }
      } catch {
        //  rollback (avoid stale closure bug)
        setSelected(prev ?? null);
      }
    },
    [selected, disReact, react, comment.id]
  );

  const handleQuickReact = useCallback(async () => {
    const prev = selected;

    //  optimistic
    if (prev) setSelected(null);
    else setSelected(findReaction(ReactionType.LIKE));

    try {
      if (prev) {
        await disReact({
          targetId: comment.id,
          targetType: TargetType.COMMENT,
        });
      } else {
        await react({
          targetId: comment.id,
          targetType: TargetType.COMMENT,
          reactionType: ReactionType.LIKE,
        });
      }
    } catch {
      // rollback
      setSelected(prev ?? null);
    }
  }, [selected, disReact, react, comment.id]);

  // =========================
  // Stats (computed)
  // =========================
  const computed = useMemo(() => {
    const stats = comment.commentStat as CommentStatDTO | undefined;
    if (!stats) return null;

    const {
      reactions = 0,
      likes = 0,
      loves = 0,
      hahas = 0,
      wows = 0,
      angrys = 0,
      sads = 0,
    } = stats;

    if (reactions === 0) return null;

    const { topReacts, total } = getTopReactions([
      { type: ReactionType.LIKE, count: likes },
      { type: ReactionType.LOVE, count: loves },
      { type: ReactionType.HAHA, count: hahas },
      { type: ReactionType.WOW, count: wows },
      { type: ReactionType.SAD, count: sads },
      { type: ReactionType.ANGRY, count: angrys },
    ]);

    return { total, topReacts };
  }, [comment.commentStat]);

  // =========================
  // Inline edit (no prop mutate)
  // =========================
  const [editing, setEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(comment.content);

  //  local displayed content (so you never do comment.content = ...)
  const [localContent, setLocalContent] = useState(comment.content);

  useEffect(() => {
    // sync if comment content changes from server
    setLocalContent(comment.content);
    if (!editing) setDraftContent(comment.content);
  }, [comment.content, editing]); // intentionally not include editing to avoid reset while typing

  const { mutateAsync: updateComment, isPending } = useUpdateComment(rootId);

  const onSave = useCallback(async () => {
    const next = draftContent.trim();
    if (!next) return;

    const prev = localContent;

    // ✅ optimistic
    setLocalContent(next);
    setEditing(false);

    const promise = updateComment(
      { commentId: comment.id, data: { content: next } },
      {
        onError: () => {
          // rollback
          setLocalContent(prev);
          setDraftContent(prev);
          setEditing(true);
        },
      }
    );

    toast.promise(promise, { loading: 'Đang cập nhật bình luận...' });
    await promise;
  }, [draftContent, localContent, updateComment, comment.id]);

  // =========================
  // UI (unchanged)
  // =========================
  return (
    <div className="flex flex-col gap-2">
      <>
        <div className="bg-gray-100 px-3 py-2 rounded-2xl space-y-2 relative w-full min-w-0 overflow-hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 transition z-10 cursor-pointer">
                <MoreHorizontal size={18} className="text-gray-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {comment.isOwner ? (
                <DropdownMenuItem
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2"
                >
                  <Edit size={14} /> Chỉnh sửa
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="flex items-center gap-2 text-red-600 focus:text-red-600"
                  onClick={() => setOpenReportModal(true)}
                >
                  <Flag size={16} className="text-red-600" /> Báo cáo
                </DropdownMenuItem>
              )}
              {(comment.isOwner || currentUserId == ownerPostId) && (
                <>
                  <DropdownMenuItem
                    onClick={() => openDeleteModal(rootId, comment.id)}
                    className="flex items-center gap-2 text-red-600 focus:text-red-600"
                  >
                    <Trash size={14} className="text-red-600" /> Xóa
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <CommentAvatar userId={comment.userId} />

          {editing ? (
            <div className="flex flex-col gap-1">
              <textarea
                rows={2}
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                className="w-full p-2 rounded-md border"
              />
              <div className="flex items-center justify-end gap-2 mt-1 w-full">
                <Button
                  disabled={draftContent.trim().length === 0 || isPending}
                  size="sm"
                  onClick={onSave}
                >
                  Lưu
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setDraftContent(localContent);
                    setEditing(false);
                  }}
                >
                  Hủy
                </Button>
              </div>
            </div>
          ) : (
            <TextCollapse
              text={localContent}
              maxLength={220}
              className="w-full min-w-0"
              textClassName="text-sm text-neutral-800"
            />
          )}

          {comment.media && (
            <div className="mt-2">
              {comment.media.type === MediaType.IMAGE ? (
                <CldImage
                  src={comment.media.url}
                  alt=""
                  width={200}
                  height={200}
                  className=" rounded-lg"
                />
              ) : (
                <video
                  src={comment.media.url}
                  controls
                  width={200}
                  height={200}
                  playsInline
                  className=" rounded-lg"
                />
              )}
            </div>
          )}

          <div className="flex items-center justify-between w-full mt-1">
            {/* actions */}
            <div className="flex items-center gap-3 ml-2 text-xs text-gray-500 ">
              <span>{createAtFormat}</span>

              <button
                onClick={() => setShowReplyInput((prev) => !prev)}
                className="hover:text-sky-600 flex items-center gap-1"
              >
                <MessageCircle size={14} /> Phản hồi
              </button>

              <ReactionHoverPopup
                open={showReactions}
                onOpenChange={setShowReactions}
                onSelect={handleSelect}
                selectedReaction={selected}
                onContentMouseEnter={handleMouseEnter}
                onContentMouseLeave={handleMouseLeave}
                side="top"
              >
                <div
                  className="relative"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    onClick={handleQuickReact}
                    className={`flex items-center cursor-pointer gap-1 ${
                      selected?.type === ReactionType.LIKE
                        ? 'text-sky-600 font-medium'
                        : 'hover:text-sky-600'
                    }`}
                  >
                    <span
                      className={cn(
                        selected &&
                          `text-bold font-medium ${selected.color} underline`
                      )}
                    >
                      {selected?.name || 'Thích'}
                    </span>
                  </button>
                </div>
              </ReactionHoverPopup>
            </div>

            {/* stats */}
            {comment.commentStat?.reactions > 0 && (
              <div className="flex items-center gap-3 text-xs text-gray-500 ml-2 mt-1">
                {computed && (
                  <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() =>
                      openReactionModal(TargetType.COMMENT, comment.id)
                    }
                  >
                    {computed.topReacts.length > 0 && (
                      <div className="flex -space-x-1">
                        {computed.topReacts.map((r, i) => (
                          <span
                            key={i}
                            className={`text-lg ${
                              r!.color
                            } bg-transparent rounded-full transition-transform hover:scale-110`}
                            title={r!.name}
                          >
                            {r!.emoji}
                          </span>
                        ))}
                      </div>
                    )}
                    {computed.total > 0 && (
                      <span className=" text-gray-700 font-medium hover:underline">
                        {formatCount(computed.total)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </>

      {replies.length > 0 && !showReplies && (
        <Button
          variant="ghost"
          onClick={() => setShowReplies(true)}
          className="text-xs text-sky-600 font-medium mt-1 ml-2"
        >
          Xem {replies.length} phản hồi
        </Button>
      )}

      {showReplies && (
        <div className="ml-12 mt-2 border-l-2 border-gray-200 pl-3 space-y-3">
          {loadingReplies ? (
            <CommentItem.Skeleton />
          ) : (
            replies.map((reply) => (
              <CommentItem
                key={reply.id}
                ownerPostId={ownerPostId}
                comment={reply}
                rootId={rootId}
                rootType={rootType}
              />
            ))
          )}
        </div>
      )}

      {showReplyInput && (
        <div className="ml-12 mt-1">
          <CommentInput
            placeholder="Viết phản hồi..."
            parentId={comment.id}
            rootId={rootId}
            rootType={rootType}
          />
        </div>
      )}
      <CreateReportModal
        open={openReportModal}
        onOpenChange={setOpenReportModal}
        targetId={rootId || ''}
        targetType={TargetType.COMMENT}
      />
    </div>
  );
};

CommentItem.Skeleton = function CommentItemSkeleton() {
  return (
    <div className="flex flex-col gap-2 animate-in fade-in-50">
      <div className="bg-gray-100 px-3 py-2 rounded-2xl space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-24 rounded-md" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
        </div>
        <div className="space-y-2 ml-12">
          <Skeleton className="h-3 w-3/4 rounded-md" />
          <Skeleton className="h-3 w-2/3 rounded-md" />
        </div>
        <div className="flex items-center justify-between w-full mt-2 ml-12">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Skeleton className="h-3 w-8 rounded-md" />
            <Skeleton className="h-3 w-10 rounded-md" />
          </div>
          <Skeleton className="h-3 w-8 rounded-md" />
        </div>
      </div>
    </div>
  );
};
