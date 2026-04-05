import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { BottomSheet } from 'heroui-native/bottom-sheet';
import React from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { formatRelativeTime } from '~/utils/format-relative-time';
import { TargetType } from '@repo/shared';
import type {
  Audience,
  PostSnapshotDTO,
  SharePostSnapshotDTO,
  UserSnapshotDTO,
} from '@repo/shared';

import {
  useDeletePostModal,
  useUpdatePostModal,
  useUpdateSharePostModal,
} from '@repo/shared';

// TODO: sau này move vào shared/native
import { PostEditHistoryModal } from '../modals/post-edit-history-modal';
import { CreateReportModal } from '../modals/create-report-modal';

// ─── Menu Item ─────────────────────────────────────────

type MenuItemVariant = 'default' | 'danger' | 'warning';

type MenuItemProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  variant?: MenuItemVariant;
  disabled?: boolean;
  loading?: boolean;
};

const ICON_COLOR: Record<MenuItemVariant, string> = {
  default: '#475569',
  danger: '#ef4444',
  warning: '#64748b',
};

const TEXT_CLASS: Record<MenuItemVariant, string> = {
  default: 'text-app-fg dark:text-app-fg-dark',
  danger: 'text-red-500',
  warning: 'text-app-muted-fg dark:text-app-muted-fg-dark',
};

function MenuItem({
  icon,
  label,
  onPress,
  variant = 'default',
  disabled = false,
  loading = false,
}: MenuItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
      className="flex-row items-center gap-3 px-4 py-3 active:bg-black/5 disabled:opacity-60 dark:active:bg-white/5"
    >
      {loading ? (
        <ActivityIndicator size="small" color={ICON_COLOR[variant]} />
      ) : (
        <Ionicons name={icon} size={20} color={ICON_COLOR[variant]} />
      )}

      <Text
        className={`flex-1 text-[15px] ${TEXT_CLASS[variant]} ${
          variant === 'default' ? 'font-medium' : ''
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Props ─────────────────────────────────────────────

export interface PostHeaderProps {
  postId?: string;
  shareId?: string;
  data: PostSnapshotDTO | SharePostSnapshotDTO;
  createdAt: Date;
  audience: Audience;
  isShared?: boolean;
  showSettings?: boolean;
  compact?: boolean;
}

// ─── Component ─────────────────────────────────────────

function PostHeaderComponent({
  postId,
  shareId,
  data,
  createdAt,
  audience,
  isShared = false,
  showSettings = true,
  compact = false,
}: PostHeaderProps) {
  const { userId: currentUserId } = useAuth();
  const router = useRouter();

  // Mock User
  const author = {
    id: 'some-user-id',
    firstName: 'Nguyễn',
    lastName: 'Thanh Sơn',
    avatarUrl:
      'https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482740TND/anh-mo-ta.png',
  };

  const [openMenu, setOpenMenu] = React.useState(false);
  const [openHistory, setOpenHistory] = React.useState(false);
  const [openReportModal, setOpenReportModal] = React.useState(false);

  const { openModal: deletePostModalOpen } = useDeletePostModal();
  const { openModal: updatePostModalOpen } = useUpdatePostModal();
  const { openModal: updateSharePostModalOpen } = useUpdateSharePostModal();

  const isOwner = currentUserId === data.userId;

  const createdText = React.useMemo(() => {
    const rel = formatRelativeTime(createdAt);
    return rel.replace(' ago', '');
  }, [createdAt]);

  const audienceInfo = React.useMemo(() => {
    if (audience === 'PUBLIC') return { icon: 'globe-outline' as const };
    if (audience === 'FRIENDS') return { icon: 'people-outline' as const };
    return { icon: 'lock-closed-outline' as const };
  }, [audience]);

  const mainEmotion = React.useMemo(() => {
    if (isShared || !('mainEmotion' in data) || !data.mainEmotion) return null;

    const emotionMap: Record<string, string> = {
      JOY: '😊',
      SADNESS: '😢',
      ANGER: '😡',
      FEAR: '😨',
      DISGUST: '🤢',
      SURPRISE: '😮',
      NEUTRAL: '😐',
    };

    return emotionMap[data.mainEmotion] ?? null;
  }, [data, isShared]);

  const group = React.useMemo(() => {
    if (isShared) return undefined;
    if ('group' in data) return data.group;
    return undefined;
  }, [data, isShared]);

  const displayName =
    `${author.firstName ?? ''} ${author.lastName ?? ''}`.trim() || 'Người dùng';

  const initials = React.useMemo(() => {
    const parts = displayName.split(' ').filter(Boolean);
    if (!parts.length) return 'U';
    if (parts.length === 1) return parts[0]!.slice(0, 1).toUpperCase();
    return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
  }, [displayName]);

  const goToUser = React.useCallback(() => {
    router.push(`/profile/${author.id}` as never);
  }, [author.id, router]);

  const goToGroup = React.useCallback(() => {
    if (!group?.id) return;
    router.push(`/groups/${group.id}` as never);
  }, [group?.id, router]);

  const close = React.useCallback(() => setOpenMenu(false), []);

  // ─── Actions ─────────────────────────────────────────

  const handleEdit = React.useCallback(() => {
    if (isShared) {
      updateSharePostModalOpen(shareId || '');
    } else {
      updatePostModalOpen(postId || '');
    }
    close();
  }, [
    close,
    isShared,
    postId,
    shareId,
    updatePostModalOpen,
    updateSharePostModalOpen,
  ]);

  const handleDelete = React.useCallback(() => {
    deletePostModalOpen({
      postId: postId || '',
      isShare: isShared,
      shareId,
    });
    close();
  }, [close, deletePostModalOpen, isShared, postId, shareId]);

  const handleReport = React.useCallback(() => {
    setOpenReportModal(true);
    close();
  }, [close]);

  const handleHistory = React.useCallback(() => {
    setOpenHistory(true);
    close();
  }, [close]);

  // ─── UI ──────────────────────────────────────────────

  return (
    <>
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1 flex-row items-start gap-2">
          {/* Avatar */}
          <Pressable onPress={group ? goToGroup : goToUser}>
            <View className={compact ? 'h-9 w-9' : 'h-11 w-11'}>
              {/* CASE 1: Có group */}
              {group ? (
                <>
                  {/* Group avatar */}
                  {group.avatarUrl ? (
                    <Image
                      source={{ uri: group.avatarUrl, cache: 'force-cache' }}
                      className="h-full w-full rounded-full border border-app-border"
                    />
                  ) : (
                    <View className="h-full w-full items-center justify-center rounded-full border border-app-border bg-app-surface">
                      <Text className="text-xs font-bold text-app-primary">
                        {group.name?.[0] ?? 'G'}
                      </Text>
                    </View>
                  )}

                  {/* User avatar overlay */}
                  <View className="absolute -bottom-1 -right-1 h-7 w-7 overflow-hidden rounded-full border border-white">
                    {author.avatarUrl ? (
                      <Image
                        source={{ uri: author.avatarUrl, cache: 'force-cache' }}
                        className="h-full w-full"
                      />
                    ) : (
                      <View className="h-full w-full items-center justify-center bg-app-primary/20">
                        <Text className="text-[9px] font-bold text-app-primary">
                          {initials}
                        </Text>
                      </View>
                    )}
                  </View>
                </>
              ) : /* CASE 2: Không có group → show author full */
              author.avatarUrl ? (
                <Image
                  source={{ uri: author.avatarUrl, cache: 'force-cache' }}
                  className="h-full w-full rounded-full border border-app-border"
                />
              ) : (
                <View className="h-full w-full items-center justify-center rounded-full border border-app-border bg-app-surface">
                  <Text className="text-xs font-bold text-app-primary">
                    {initials}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>

          {/* Info */}
          <View className="flex-1 gap-1">
            <View className="flex-row flex-wrap items-center gap-x-1 gap-y-0.5">
              <Pressable onPress={goToUser}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  className={
                    compact
                      ? 'max-w-45 text-[14px] font-semibold text-app-fg'
                      : 'max-w-50 text-[15px] font-semibold text-app-fg'
                  }
                >
                  {displayName}
                </Text>
              </Pressable>

              {isShared && (
                <Text className="text-[11px] text-app-muted-fg">
                  đã chia sẻ
                </Text>
              )}

              {group?.name && (
                <View className="flex-row min-w-0 items-center gap-1">
                  <Text className="text-[12px] text-app-muted-fg">trong</Text>

                  <Pressable onPress={goToGroup} className="max-w-40 shrink">
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      className="text-[13px] font-semibold text-app-fg"
                    >
                      {group.name}
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>

            <View className="flex-row flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <Text className="text-[11px] text-app-muted-fg">
                {createdText}
              </Text>

              <Text className="text-[11px] text-app-muted-fg">•</Text>

              <Ionicons name={audienceInfo.icon} size={11} color="#64748b" />

              <Text className="text-[11px] text-app-muted-fg">•</Text>

              {mainEmotion && (
                <Text className="text-[11px] text-app-muted-fg">
                  {mainEmotion}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Menu */}
        {showSettings && (
          <BottomSheet isOpen={openMenu} onOpenChange={setOpenMenu}>
            <BottomSheet.Trigger>
              <Pressable
                onPress={() => setOpenMenu(true)}
                className="h-9 w-9 items-center justify-center rounded-full bg-app-surface/70 active:opacity-70"
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={19}
                  color="#64748b"
                />
              </Pressable>
            </BottomSheet.Trigger>

            <BottomSheet.Portal>
              <BottomSheet.Overlay className="bg-black/40" />

              <BottomSheet.Content>
                <MenuItem
                  icon="create-outline"
                  label="Chỉnh sửa"
                  onPress={handleEdit}
                  disabled={!isOwner}
                />

                <MenuItem
                  icon="time-outline"
                  label="Lịch sử chỉnh sửa"
                  onPress={handleHistory}
                />

                <MenuItem
                  icon="trash-outline"
                  label="Xoá bài viết"
                  variant="danger"
                  onPress={handleDelete}
                  disabled={!isOwner}
                />

                <MenuItem
                  icon="flag-outline"
                  label="Báo cáo"
                  variant="warning"
                  onPress={handleReport}
                  disabled={isOwner}
                />
              </BottomSheet.Content>
            </BottomSheet.Portal>
          </BottomSheet>
        )}
      </View>

      {/* Modals */}
      {openHistory && (
        <PostEditHistoryModal
          open={openHistory}
          onOpenChange={setOpenHistory}
          postId={postId}
        />
      )}

      {openReportModal && (
        <CreateReportModal
          open={openReportModal}
          onOpenChange={setOpenReportModal}
          targetId={isShared ? shareId || '' : postId || ''}
          targetType={isShared ? TargetType.SHARE : TargetType.POST}
        />
      )}
    </>
  );
}

export const PostHeader = React.memo(PostHeaderComponent);
