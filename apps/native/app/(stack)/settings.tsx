import { Ionicons } from '@expo/vector-icons';
import { useClerk } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { Switch } from 'heroui-native/switch';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileLogoutModal } from '~/components/profile/profile-logout-modal';
import { INDIGO_ETHER } from '~/components/profile/profile-theme';
import { useProfileLogout } from '~/components/profile/use-profile-logout';
import { AppCard } from '~/components/ui/app-card';
import { useAppTheme } from '~/providers/theme-provider';

const settingsItems = [
  { id: 'account', label: 'Account center', icon: 'person-circle-outline' },
  { id: 'privacy', label: 'Privacy', icon: 'lock-closed-outline' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications-outline' },
  { id: 'language', label: 'Language', icon: 'language-outline' },
  { id: 'support', label: 'Help and support', icon: 'help-circle-outline' },
] as const;

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useClerk();
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

  return (
    <>
      <View className="flex-1 bg-app-bg dark:bg-app-bg-dark">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingTop: insets.top + 10,
            paddingBottom: Math.max(insets.bottom + 24, 32),
            paddingHorizontal: 16,
          }}
        >
          <View className="mb-4 flex-row items-center gap-3">
            <Pressable
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-sky-500/12 active:bg-sky-500/20 dark:bg-sky-400/20 dark:active:bg-sky-400/30"
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={20} color={resolvedTheme === 'dark' ? '#dbeafe' : '#334155'} />
            </Pressable>
            <Text className="text-[24px] font-extrabold tracking-tight text-app-fg dark:text-app-fg-dark">
              Settings
            </Text>
          </View>

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
                <Pressable className="flex-row items-center gap-3 rounded-2xl px-3 py-3 active:bg-sky-500/10 dark:active:bg-sky-400/15">
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
              <Text className="text-[15px] font-semibold text-rose-500">Log out</Text>
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
