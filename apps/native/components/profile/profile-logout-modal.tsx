import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { AppModal } from '~/components/ui/app-modal';

import { styles } from './profile-styles';
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
  colors,
  onClose,
  onConfirm,
}: ProfileLogoutModalProps) {
  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title="Xác nhận đăng xuất"
      description="Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng tài khoản này."
      dismissible={!isSigningOut}
      footer={
        <View style={styles.modalActions}>
          <Pressable
            onPress={onConfirm}
            disabled={isSigningOut}
            style={({ pressed }) => [
              styles.modalPrimaryButton,
              {
                backgroundColor: colors.primary,
              },
              pressed && styles.pressed,
              isSigningOut && styles.disabledButton,
            ]}
          >
            {isSigningOut ? (
              <ActivityIndicator size="small" color={colors.primaryForeground} />
            ) : (
              <Text style={[styles.modalPrimaryText, { color: colors.primaryForeground }]}>Đăng xuất</Text>
            )}
          </Pressable>

          <Pressable
            onPress={onClose}
            disabled={isSigningOut}
            style={({ pressed }) => [
              styles.modalSecondaryButton,
              {
                backgroundColor: colors.surfaceLow,
              },
              pressed && styles.pressed,
              isSigningOut && styles.disabledButton,
            ]}
          >
            <Text style={[styles.modalSecondaryText, { color: colors.onSurface }]}>Hủy</Text>
          </Pressable>
        </View>
      }
    />
  );
}
