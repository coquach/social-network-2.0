import { Ionicons } from '@expo/vector-icons';
import { useClerk } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { Switch } from 'heroui-native/switch';
import { useToast } from 'heroui-native/toast';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileLogoutModal } from '~/components/profile/profile-logout-modal';
import { INDIGO_ETHER } from '~/components/profile/profile-theme';
import { useProfileLogout } from '~/components/profile/use-profile-logout';
import { AppCard } from '~/components/ui/app-card';
import { AppHeader } from '~/components/ui/app-header';
import { AppToast } from '~/components/ui/app-toast';
import { useAppTheme } from '~/providers/theme-provider';


const settingsItems = [
  { id: 'account', label: 'Trung tâm tài khoản', icon: 'person-circle-outline' },
  { id: 'activity', label: 'Nhật ký hoạt động', icon: 'time-outline', path: '/settings/activity' },
  { id: 'privacy', label: 'Quyền riêng tư', icon: 'lock-closed-outline', path: '/settings/privacy-settings' },
  { id: 'notifications', label: 'Thông báo', icon: 'notifications-outline', path: '/settings/notification-settings' },
  { id: 'language', label: 'Ngôn ngữ', icon: 'language-outline' },
  { id: 'privacy-policy', label: 'Chính sách bảo mật', icon: 'shield-checkmark-outline', path: '/settings/privacy-policy' },
  { id: 'support', label: 'Trợ giúp và hỗ trợ', icon: 'help-circle-outline', path: '/settings/support' },
] as const;

export default function SettingsScreen() {
  const { signOut } = useClerk();
  const router = useRouter();
  const { toast } = useToast();
  const insets = useSafeAreaInsets();
  const { resolvedTheme, setThemePreference } = useAppTheme();

  const colors = React.useMemo(
    () => INDIGO_ETHER[resolvedTheme === 'dark' ? 'dark' : 'light'],
    [resolvedTheme],
  );

  const {
    isLogoutModalOpen,
    isSigningOut,
    openLogoutModal,
    closeLogoutModal,
    confirmLogout,
  } = useProfileLogout(() => signOut());

  const isDarkTheme = resolvedTheme === 'dark';


  const handleItemPress = (id: string) => {
    if (id === 'notifications') {
      router.push('/(stack)/settings/notification-settings');
    } else if (id === 'activity') {
      router.push('/(stack)/settings/activity');
    } else if (id === 'privacy') {
      router.push('/(stack)/settings/privacy-settings');
    } else if (id === 'privacy-policy') {
      router.push('/(stack)/settings/privacy-policy');
    } else if (id === 'support') {
      router.push('/(stack)/settings/support');
    } else if (id === 'language' || id === 'account') {
      toast.show({
        component: (toastProps) => (
          <AppToast
            toastProps={toastProps}
            toast={{
              title: 'Tính năng đang phát triển',
              message: 'Tính năng này hiện chưa được hỗ trợ.',
              variant: 'info',
            }}
          />
        ),
      });
    }
  };

  return (
    <>
      <View className="flex-1 bg-app-bg dark:bg-app-bg-dark">
        <AppHeader title="Cài đặt" variant="default" />
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom + 24, 32),
            paddingHorizontal: 16,
            paddingTop: 12,
          }}
        >
          <AppCard className="rounded-3xl p-2">
            <View>
              <View className="flex-row items-center gap-3 rounded-2xl px-3 py-3">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-app-surface-elevated dark:bg-app-surface-elevated-dark">
                  <Ionicons
                    name="moon-outline"
                    size={18}
                    color={resolvedTheme === 'dark' ? '#dbeafe' : '#334155'}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-medium text-app-fg dark:text-app-fg-dark">
                    Chế độ tối
                  </Text>
                  <Text className="mt-0.5 text-[12px] text-app-muted-fg dark:text-app-muted-fg-dark">
                    Bật để dùng giao diện tối
                  </Text>
                </View>
                <Switch
                  isSelected={isDarkTheme}
                  onSelectedChange={(next: boolean) => {
                    setThemePreference(next ? 'dark' : 'light');
                  }}
                />
              </View>
              <View className="ml-14 h-px bg-app-border/70 dark:bg-app-border-dark/80" />
            </View>

            {settingsItems.map((item, index) => (
              <View key={item.id}>
                <Pressable
                  className="flex-row items-center gap-3 rounded-2xl px-3 py-3 active:bg-sky-500/10 dark:active:bg-sky-400/15"
                  onPress={() => handleItemPress(item.id)}
                >
                  <View className="h-9 w-9 items-center justify-center rounded-xl bg-sky-500/12 dark:bg-sky-400/18">
                    <Ionicons
                      name={item.icon}
                      size={18}
                      color={resolvedTheme === 'dark' ? '#dbeafe' : '#334155'}
                    />
                  </View>
                  <Text className="flex-1 text-[15px] font-medium text-app-fg dark:text-app-fg-dark">
                    {item.label}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={resolvedTheme === 'dark' ? '#8fb2c8' : '#64748b'}
                  />
                </Pressable>

                {index < settingsItems.length - 1 ? (
                  <View className="ml-14 h-px bg-app-border/70 dark:bg-app-border-dark/80" />
                ) : null}
              </View>
            ))}
          </AppCard>

          <View className="mt-4">
            <Pressable
              onPress={openLogoutModal}
              className="h-12 items-center justify-center rounded-2xl bg-rose-500/12 active:bg-rose-500/20 dark:bg-rose-500/16 dark:active:bg-rose-500/28"
            >
              <Text className="text-[15px] font-semibold text-rose-500">Đăng xuất</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>

      <ProfileLogoutModal
        visible={isLogoutModalOpen}
        isSigningOut={isSigningOut}
        colors={colors}
        onClose={closeLogoutModal}
        onConfirm={() => void confirmLogout()}
      />
    </>
  );
}
