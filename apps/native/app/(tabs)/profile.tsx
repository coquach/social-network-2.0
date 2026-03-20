import { useClerk, useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '~/components/ui/app-button';
import { AppCard } from '~/components/ui/app-card';
import { AppModal } from '~/components/ui/app-modal';
import { AppScrollScreen } from '~/components/ui/app-screen';
import { AppEyebrow, AppSubtitle, AppTitle } from '~/components/ui/app-text';

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  async function handleConfirmLogout() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
      setIsLogoutModalOpen(false);
    }
  }

  return (
    <>
      <AppScrollScreen>
        <View className="gap-4 pb-28">
          <AppEyebrow>Cá nhân</AppEyebrow>
          <AppTitle className="text-3xl">Hồ sơ của bạn</AppTitle>
          <AppSubtitle>
            Quản lý phiên đăng nhập, theo dõi danh tính hiển thị và các thiết lập tài khoản cốt lõi.
          </AppSubtitle>

          <AppCard className="gap-4">
            <View className="flex-row items-center gap-4">
              <View className="h-16 w-16 items-center justify-center rounded-[24px] bg-app-primary/15 dark:bg-app-primary-dark/20">
                <Ionicons name="person-outline" size={30} color="#0ea5e9" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-app-fg dark:text-app-fg-dark">
                  {user?.fullName ?? 'Sentimeta Member'}
                </Text>
                <Text className="mt-1 text-sm text-app-muted-fg dark:text-app-muted-fg-dark">
                  {user?.primaryEmailAddress?.emailAddress ?? 'Bạn đã đăng nhập thành công'}
                </Text>
              </View>
            </View>

            <PrimaryButton label="Chỉnh sửa hồ sơ" onPress={() => {}} />
            <SecondaryButton label="Đăng xuất" onPress={() => setIsLogoutModalOpen(true)} />
          </AppCard>
        </View>
      </AppScrollScreen>

      <AppModal
        visible={isLogoutModalOpen}
        onClose={() => {
          if (!isSigningOut) {
            setIsLogoutModalOpen(false);
          }
        }}
        title="Xác nhận đăng xuất"
        description="Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng tài khoản này."
        dismissible={!isSigningOut}
        footer={(
          <>
            <PrimaryButton
              label="Đăng xuất"
              onPress={() => void handleConfirmLogout()}
              loading={isSigningOut}
              disabled={isSigningOut}
            />
            <SecondaryButton
              label="Hủy"
              onPress={() => setIsLogoutModalOpen(false)}
              disabled={isSigningOut}
            />
          </>
        )}
      />
    </>
  );
}
