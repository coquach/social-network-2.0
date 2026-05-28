import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { AppModal } from '~/components/ui/app-modal';

import type { ProfilePalette } from './profile-types';

type ProfileLogoutModalProps = {
  visible: boolean;
  isSigningOut: boolean;
  colors: ProfilePalette;
  onClose: () => void;
  onConfirm: () => void;
};

export function ProfileLogoutModal({
  visible,
  isSigningOut,
  colors: _colors,
  onClose,
  onConfirm,
}: ProfileLogoutModalProps) {
  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      variant="danger"
      title="Xác nhận đăng xuất"
      description="Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng tài khoản này."
      dismissible={!isSigningOut}
      footer={
        <View className="gap-2">
          <Pressable
            onPress={onConfirm}
            disabled={isSigningOut}
            className="min-h-11 items-center justify-center rounded-xl bg-rose-500 active:opacity-90 disabled:opacity-60 dark:bg-rose-500"
          >
            {isSigningOut ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-[15px] font-semibold text-white">Đăng xuất</Text>
            )}
          </Pressable>

          <Pressable
            onPress={onClose}
            disabled={isSigningOut}
            className="min-h-11 items-center justify-center rounded-xl bg-app-surface-elevated active:opacity-90 disabled:opacity-60 dark:bg-app-surface-elevated-dark"
          >
            <Text className="text-[15px] font-semibold text-app-fg dark:text-app-fg-dark">Hủy</Text>
          </Pressable>
        </View>
      }
    />
  );
}
