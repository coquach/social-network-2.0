import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  Text,
  View,
} from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import { TargetType } from '@repo/shared';
import {
  useDeletePostModal,
  usePostEditHistoryModalStore,
  useReportModalStore,
  useUpdatePostModal,
  useUpdateSharePostModal,
} from '@repo/shared';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { appThemeColors } from '~/constants/theme';
import { usePostOptionsStore } from '~/store/use-post-options-store';
import { useAppTheme } from '~/providers/theme-provider';

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
  const insets = useSafeAreaInsets();
  const { resolvedTheme } = useAppTheme();
  const colors = appThemeColors[resolvedTheme];

  const bottomSheetRef = React.useRef<BottomSheetModal>(null);
  const hasOpenedRef = React.useRef(false);
  const snapPoints = React.useMemo(() => ['36%'], []);

  const { openModal: deletePostModalOpen } = useDeletePostModal();
  const { openModal: updatePostModalOpen } = useUpdatePostModal();
  const { openModal: updateSharePostModalOpen } = useUpdateSharePostModal();

  React.useEffect(() => {
    if (isOpen) {
      hasOpenedRef.current = true;
      const frame = requestAnimationFrame(() => {
        bottomSheetRef.current?.present();
      });

      return () => {
        cancelAnimationFrame(frame);
      };
    }

    if (!hasOpenedRef.current) {
      return;
    }

    bottomSheetRef.current?.dismiss();
  }, [isOpen]);

  const renderBackdrop = React.useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        opacity={0.4}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

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

  if (!isOpen) {
    return null;
  }

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onDismiss={() => {
        hasOpenedRef.current = false;
        Keyboard.dismiss();
        closePostOptions();
      }}
      topInset={insets.top}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustPan"
      enablePanDownToClose
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        borderWidth: 1,
        borderBottomWidth: 0,
        borderColor: colors.border,
        backgroundColor: colors.surface,
      }}
      handleIndicatorStyle={{ backgroundColor: colors.border }}
    >
      <View
        className="px-4"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <View className="flex-row items-center justify-center gap-2 pb-3 pt-1">
          <Ionicons
            name="ellipsis-horizontal-circle-outline"
            size={16}
            color="#64748b"
          />
          <Text className="text-lg font-semibold text-app-fg dark:text-app-fg-dark">
            Tùy chọn bài viết
          </Text>
        </View>

        <View className="gap-2">
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
        </View>
      </View>
    </BottomSheetModal>
  );
}
