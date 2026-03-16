import { useClerk, useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '~/components/ui/app-button';
import { AppCard } from '~/components/ui/app-card';
import { AppScrollScreen } from '~/components/ui/app-screen';
import { AppEyebrow, AppSubtitle, AppTitle } from '~/components/ui/app-text';

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
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
          <SecondaryButton label="Đăng xuất" onPress={() => void signOut()} />
        </AppCard>
      </View>
    </AppScrollScreen>
  );
}
