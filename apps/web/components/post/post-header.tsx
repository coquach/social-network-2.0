'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUser, TargetType } from '@repo/shared';
import {
  Audience,
  Emotion,
} from '@/models/social/enums/social.enum';
import { PostSnapshotDTO } from '@/models/social/post/postDTO';
import { SharePostSnapshotDTO } from '@/models/social/post/sharePostDTO';
import {
  useDeletePostModal,
  useUpdatePostModal,
  useUpdateSharePostModal,
} from '@/store/use-post-modal';
import { useAuth } from '@clerk/nextjs';
import { formatDistanceToNowStrict } from 'date-fns';
import {
  Edit3,
  Globe,
  Lock,
  MoreHorizontal,
  Trash2,
  Users,
  Flag,
  ClipboardClock,
} from '@/lib/icons';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCallback, useMemo, useState } from 'react';
import { PostHeaderAvatar } from '@/components/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { vi } from 'date-fns/locale';

import { feelingMap } from '@/lib/types/feeling';
import { PostEditHistoryModal } from '../modals/post-edit-history-modal';
import { CreateReportModal } from '../modals/create-report-modal';

interface PostHeaderProps {
  postId?: string;
  shareId?: string;
  data: PostSnapshotDTO | SharePostSnapshotDTO;
  userId: string;
  createdAt: Date;
  audience: Audience;
  isShared?: boolean;
  showSettings?: boolean;
}

export default function PostHeader({
  postId,
  shareId,
  data,
  userId,
  createdAt,
  audience,
  isShared,
  showSettings = true,
}: PostHeaderProps) {
  const { userId: currentUserId } = useAuth();
  const router = useRouter();
  const { data: fetchedUser } = useUser(userId);

  const { openModal: deletePostModalOpen } = useDeletePostModal();
  const { openModal: updatePostModalOpen } = useUpdatePostModal();
  const { openModal: updateSharePostModalOpen } = useUpdateSharePostModal();

  const isOwner = currentUserId === userId;

  const [openHistory, setOpenHistory] = useState(false);
  const [openReportModal, setOpenReportModal] = useState(false);

  const { icon, label } = useMemo(() => {
    if (audience === Audience.PUBLIC)
      return { icon: <Globe size={14} />, label: 'Công khai' };
    if (audience === Audience.FRIENDS)
      return { icon: <Users size={14} />, label: 'Bạn bè' };
    return { icon: <Lock size={14} />, label: 'Riêng tôi' };
  }, [audience]);

  const createdAtText = useMemo(() => {
    const d = createdAt instanceof Date ? createdAt : new Date(createdAt);
    if (Number.isNaN(d.getTime())) return '';
    return formatDistanceToNowStrict(d, { addSuffix: true, locale: vi });
  }, [createdAt]);

  const displayName = useMemo(() => {
    const first = fetchedUser?.firstName?.trim();
    const last = fetchedUser?.lastName?.trim();
    return [first, last].filter(Boolean).join(' ') || 'Người dùng';
  }, [fetchedUser?.firstName, fetchedUser?.lastName]);

  const group = useMemo(() => {
    if (isShared) return undefined;
    if ('group' in data) return data.group;
    return undefined;
  }, [data, isShared]);

  const goToUser = useCallback(() => {
    router.push(`/profile/${userId}`);
  }, [router, userId]);

  const goToGroup = useCallback(() => {
    if (!group?.id) return;
    router.push(`/groups/${group.id}`);
  }, [router, group?.id]);

  const onEdit = useCallback(() => {
    if (isShared) updateSharePostModalOpen(data as SharePostSnapshotDTO);
    else updatePostModalOpen(data as PostSnapshotDTO);
  }, [data, isShared, updatePostModalOpen, updateSharePostModalOpen]);

  const onDelete = useCallback(() => {
    deletePostModalOpen(postId || '', false, shareId);
  }, [deletePostModalOpen, postId, shareId]);

  const feeling = useMemo(() => {
    if (isShared) return null;
    const emo = (data as PostSnapshotDTO).mainEmotion as Emotion | undefined;
    if (!emo) return null;
    return feelingMap.get(emo) ?? null;
  }, [data, isShared]);

  return (
    <>
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <PostHeaderAvatar userId={userId} />

          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={goToUser}
                className={cn(
                  'text-[15px] font-semibold text-slate-800',
                  'hover:underline underline-offset-2',
                  'truncate max-w-55 sm:max-w-[320px]',
                )}
                title={displayName}
              >
                {displayName}
              </button>

              {isShared && (
                <span className="text-xs text-neutral-500 shrink-0">
                  đã chia sẻ
                </span>
              )}
              {group?.name ? (
                <button
                  type="button"
                  onClick={goToGroup}
                  className={cn(
                    'mt-0.5 inline-flex items-center gap-2 min-w-0',
                    'text-xs text-neutral-600 hover:underline underline-offset-2',
                  )}
                >
                  <span>trong</span>
                  <span className="relative h-5 w-5 overflow-hidden rounded-full border border-gray-200 bg-gray-100 shrink-0">
                    <Image
                      src={group.avatarUrl || '/images/placeholder-bg.png'}
                      alt={group.name}
                      fill
                      className="object-cover"
                    />
                  </span>
                  <span
                    className="font-medium text-neutral-800 truncate max-w-50 sm:max-w-65"
                    title={group.name}
                  >
                    {group.name}
                  </span>
                </button>
              ) : null}
            </div>

            <div className="mt-0.5 flex items-center flex-wrap gap-2 text-xs text-neutral-500">
              <span>{createdAtText}</span>

              <span className="text-neutral-300">•</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-gray-50 border border-gray-100">
                    {icon}
                    <span className="hidden sm:inline">{label}</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>

              {feeling && (
                <>
                  <span className="text-neutral-300">•</span>
                  <span className="inline-flex items-center gap-1 text-neutral-600">
                    <span>đang cảm thấy</span>
                    <span className="text-base">{feeling.emoji}</span>
                    <span className="font-medium">{feeling.name}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {showSettings && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Tuỳ chọn bài viết"
                className={cn(
                  'shrink-0 rounded-full p-2',
                  'hover:bg-gray-100 active:bg-gray-200 transition',
                )}
              >
                <MoreHorizontal size={18} className="text-gray-600" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {/* Lịch sử chỉnh sửa: chỉ meaningful cho Post gốc */}
              {!isShared && postId && (
                <DropdownMenuItem
                  className="flex items-center gap-2"
                  onClick={() => setOpenHistory(true)}
                >
                  <ClipboardClock size={16} /> Lịch sử chỉnh sửa
                </DropdownMenuItem>
              )}

              {isOwner ? (
                <>
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={onEdit}
                  >
                    <Edit3 size={16} /> Chỉnh sửa
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="flex items-center gap-2 text-red-600 focus:text-red-600"
                    onClick={onDelete}
                  >
                    <Trash2 size={16} className="text-red-600" /> Xóa bài viết
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem
                  className="flex items-center gap-2 text-red-600 focus:text-red-600"
                  onClick={() => setOpenReportModal(true)}
                >
                  <Flag size={16} className="text-red-600" /> Báo cáo
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>

      {/* Modal edit history: tự fetch */}
      <PostEditHistoryModal
        open={openHistory}
        onOpenChange={setOpenHistory}
        postId={postId}
      />

      <CreateReportModal
        open={openReportModal}
        onOpenChange={setOpenReportModal}
        targetId={postId || ''}
        targetType={isShared ? TargetType.SHARE : TargetType.POST}
      />
    </>
  );
}
