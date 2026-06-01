import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, ActivityIndicator, ScrollView } from 'react-native';
import { Switch } from 'heroui-native/switch';

import { Text } from 'react-native';

import { AppBackButton, AppHeader } from '~/components/ui/app-header';
import { AppScreen } from '~/components/ui/app-screen';
import { useNotificationPreferences, useUpdateNotificationPreferences } from '@repo/shared';

export default function NotificationSettingsScreen() {
  const { data: prefs, isLoading } = useNotificationPreferences();
  const { mutate: updatePrefs, isPending } = useUpdateNotificationPreferences();

  const handleToggle = (key: string, value: boolean) => {
    updatePrefs({
      settings: {
        [key]: value,
      },
    });
  };

  return (
    <AppScreen className="px-0 py-0">
      <View className="flex-1 bg-app-bg dark:bg-app-bg-dark">
        <AppHeader
          leading={<AppBackButton />}
          contentClassName="items-center justify-center"
        >
          <View className="flex-1 items-center justify-center">
            <Text className="text-center text-[22px] font-extrabold tracking-tight text-app-fg dark:text-app-fg-dark">
              Cài đặt thông báo
            </Text>
          </View>
        </AppHeader>

        <ScrollView className="flex-1 px-5 pt-4">
          {isLoading ? (
            <View className="py-10 items-center justify-center">
              <ActivityIndicator size="large" color="#0ea5e9" />
            </View>
          ) : (
            <View className="gap-6 pb-10">
              <View className="gap-2">
                <Text className="text-sm font-bold text-app-fg-muted dark:text-app-fg-muted-dark uppercase tracking-wider">
                  Trò chuyện & Cuộc gọi
                </Text>
                <View className="rounded-2xl border border-app-border dark:border-app-border-dark bg-white dark:bg-app-surface-dark overflow-hidden">
                  <SettingItem
                    icon="chatbubble-ellipses-outline"
                    title="Tin nhắn cá nhân"
                    description="Nhận thông báo khi có tin nhắn mới từ bạn bè."
                    value={prefs?.settings?.pushMessages ?? true}
                    onValueChange={(val) => handleToggle('pushMessages', val)}
                    disabled={isPending}
                  />
                  <View className="h-[1px] bg-app-border dark:bg-app-border-dark ml-14" />
                  <SettingItem
                    icon="people-outline"
                    title="Tin nhắn nhóm"
                    description="Nhận thông báo từ các cuộc trò chuyện nhóm."
                    value={prefs?.settings?.pushGroupMessages ?? true}
                    onValueChange={(val) => handleToggle('pushGroupMessages', val)}
                    disabled={isPending}
                  />
                </View>
              </View>

              <View className="gap-2">
                <Text className="text-sm font-bold text-app-fg-muted dark:text-app-fg-muted-dark uppercase tracking-wider">
                  Tương tác xã hội
                </Text>
                <View className="rounded-2xl border border-app-border dark:border-app-border-dark bg-white dark:bg-app-surface-dark overflow-hidden">
                  <SettingItem
                    icon="at-outline"
                    title="Lượt nhắc đến"
                    description="Nhận thông báo khi ai đó nhắc đến bạn."
                    value={prefs?.settings?.pushMentions ?? true}
                    onValueChange={(val) => handleToggle('pushMentions', val)}
                    disabled={isPending}
                  />
                  <View className="h-[1px] bg-app-border dark:bg-app-border-dark ml-14" />
                  <SettingItem
                    icon="person-add-outline"
                    title="Lời mời kết bạn"
                    description="Nhận thông báo khi có người muốn kết bạn."
                    value={prefs?.settings?.pushFriendRequests ?? true}
                    onValueChange={(val) => handleToggle('pushFriendRequests', val)}
                    disabled={isPending}
                  />
                </View>
              </View>
              
              <View className="gap-2">
                <Text className="text-sm font-bold text-app-fg-muted dark:text-app-fg-muted-dark uppercase tracking-wider">
                  Chế độ không làm phiền
                </Text>
                <View className="rounded-2xl border border-app-border dark:border-app-border-dark bg-white dark:bg-app-surface-dark overflow-hidden p-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center flex-1 pr-4">
                      <View className="h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30 mr-3">
                        <Ionicons name="moon-outline" size={20} color="#e11d48" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-app-fg dark:text-app-fg-dark">
                          Không làm phiền
                        </Text>
                      </View>
                    </View>
                    <Switch
                      isSelected={prefs?.settings?.doNotDisturb?.enabled ?? false}
                      onSelectedChange={(val: boolean) => updatePrefs({
                        settings: {
                          doNotDisturb: {
                            ...prefs?.settings?.doNotDisturb,
                            enabled: val,
                          }
                        }
                      })}
                      isDisabled={isPending}
                    />
                  </View>
                  <Text className="text-sm text-app-fg-muted dark:text-app-fg-muted-dark">
                    Tắt toàn bộ thông báo đẩy (trừ cuộc gọi đến) trong khung giờ {prefs?.settings?.doNotDisturb?.from ?? '22:00'} đến {prefs?.settings?.doNotDisturb?.to ?? '07:00'}.
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </AppScreen>
  );
}

function SettingItem({
  icon,
  title,
  description,
  value,
  onValueChange,
  disabled
}: {
  icon: any;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between p-4">
      <View className="flex-row items-center flex-1 pr-4">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/30 mr-3">
          <Ionicons name={icon} size={20} color="#0ea5e9" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-app-fg dark:text-app-fg-dark">
            {title}
          </Text>
          <Text className="text-sm text-app-fg-muted dark:text-app-fg-muted-dark mt-0.5">
            {description}
          </Text>
        </View>
      </View>
      <Switch
        isSelected={value}
        onSelectedChange={onValueChange}
        isDisabled={disabled}
      />
    </View>
  );
}
