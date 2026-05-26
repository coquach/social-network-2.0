import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from 'heroui-native/bottom-sheet';
import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { TargetType } from '@repo/shared';
import {
  useDeletePostModal,
  usePostEditHistoryModalStore,
  useReportModalStore,
  useUpdatePostModal,
  useUpdateSharePostModal,
} from '@repo/shared';

import { usePostOptionsStore } from '~/store/use-post-options-store';

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

// ─── Global Post Options Bottom Sheet ───────────────────

export function PostOptionsBottomSheet() {
  const { isOpen, postId, shareId, isShared, isOwner, closePostOptions } =
    usePostOptionsStore();

  const { openModal: deletePostModalOpen } = useDeletePostModal();
  const { openModal: updatePostModalOpen } = useUpdatePostModal();
  const { openModal: updateSharePostModalOpen } = useUpdateSharePostModal();

  // Ensure sheet starts closed and logs state for debugging
  React.useEffect(() => {
    // Force close on mount if somehow opened
    if (isOpen) {
      closePostOptions();
    }

    return () => {
      // Reset on unmount to ensure clean state
      closePostOptions();
    };
  }, [closePostOptions]);

  const handleEdit = React.useCallback(() => {
    if (isShared) {
      updateSharePostModalOpen(shareId || '');
    } else {
      updatePostModalOpen(postId || '');
    }
    closePostOptions();
  }, [
    isShared,
    postId,
    shareId,
    updatePostModalOpen,
    updateSharePostModalOpen,
    closePostOptions,
  ]);

  const handleDelete = React.useCallback(() => {
    deletePostModalOpen({
      postId: postId || '',
      isShare: isShared,
      shareId: shareId || undefined,
    });
    closePostOptions();
  }, [closePostOptions, deletePostModalOpen, isShared, postId, shareId]);

  const handleReport = React.useCallback(() => {
    const targetId = isShared ? shareId || '' : postId || '';
    const targetType = isShared ? TargetType.SHARE : TargetType.POST;

    if (!targetId) {
      closePostOptions();
      return;
    }

    useReportModalStore.getState().open({
      targetId,
      targetType,
    });

    closePostOptions();
  }, [closePostOptions, isShared, postId, shareId]);

  const handleHistory = React.useCallback(() => {
    if (!postId) {
      closePostOptions();
      return;
    }

    usePostEditHistoryModalStore.getState().open(postId);
    closePostOptions();
  }, [closePostOptions, postId]);

  // Properly control BottomSheet state - always reject unsolicited opens
  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        // User dismissed the sheet
        closePostOptions();
      }
      // Ignore attempts to open - they should only come through store
    },
    [closePostOptions, isOpen],
  );

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={handleOpenChange}>
      {/* Only render Portal content when actually open to prevent hidden interactions */}
      {isOpen && (
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
      )}
    </BottomSheet>
  );
}
