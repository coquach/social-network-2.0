import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, ActivityIndicator, ScrollView, Pressable } from 'react-native';
import { Switch } from 'heroui-native/switch';

import { Text } from 'react-native';

import { AppBackButton, AppHeader } from '~/components/ui/app-header';
import { AppCard } from '~/components/ui/app-card';
import { AppBottomSheet } from '~/components/ui/app-bottom-sheet';
import { useNotificationPreferences, useUpdateNotificationPreferences } from '@repo/shared';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { data: prefs, isLoading } = useNotificationPreferences();
  const { mutate: updatePrefs, isPending } = useUpdateNotificationPreferences();
  const [isDndSheetOpen, setIsDndSheetOpen] = React.useState(false);

  const handleToggle = (key: string, value: boolean) => {
    updatePrefs({
      settings: {
        [key]: value,
      },
    });
  };

  const handleDndTimeSelect = (from: string, to: string) => {
    updatePrefs({
      settings: {
        doNotDisturb: {
          ...prefs?.settings?.doNotDisturb,
          from,
          to,
        },
      },
    });
    setIsDndSheetOpen(false);
  };

  const dndFrom = prefs?.settings?.doNotDisturb?.from ?? '22:00';
  const dndTo = prefs?.settings?.doNotDisturb?.to ?? '07:00';
  const dndEnabled = prefs?.settings?.doNotDisturb?.enabled ?? false;

  return (
    <>
      <View className="flex-1 bg-app-bg dark:bg-app-bg-dark">
        <AppHeader leading={<AppBackButton />} title="Cài đặt thông báo" variant="default" />

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom + 24, 32),
            paddingHorizontal: 16,
            paddingTop: 12,
          }}
        >
          {isLoading ? (
            <View className="py-10 items-center justify-center">
              <ActivityIndicator size="large" color="#0ea5e9" />
            </View>
          ) : (
            <View className="gap-6 pb-10">
              <View className="gap-2">
                <Text className="ml-2 text-[13px] font-bold text-app-fg-muted dark:text-app-fg-muted-dark uppercase tracking-wider">
                  Trò chuyện & Cuộc gọi
                </Text>
                <AppCard className="rounded-3xl p-2">
                  <SettingItem
                    icon="chatbubble-ellipses-outline"
                    iconColorClass="bg-sky-500/12 dark:bg-sky-400/18"
                    iconColor="#0ea5e9"
                    title="Tin nhắn cá nhân"
                    description="Thông báo tin nhắn từ bạn bè"
                    value={prefs?.settings?.pushMessages ?? true}
                    onValueChange={(val) => handleToggle('pushMessages', val)}
                    disabled={isPending}
                  />
                  <View className="ml-14 h-px bg-app-border/70 dark:bg-app-border-dark/80" />
                  <SettingItem
                    icon="people-outline"
                    iconColorClass="bg-indigo-500/12 dark:bg-indigo-400/18"
                    iconColor="#818cf8"
                    title="Tin nhắn nhóm"
                    description="Thông báo từ các cuộc trò chuyện nhóm"
                    value={prefs?.settings?.pushGroupMessages ?? true}
                    onValueChange={(val) => handleToggle('pushGroupMessages', val)}
                    disabled={isPending}
                  />
                </AppCard>
              </View>

              <View className="gap-2">
                <Text className="ml-2 text-[13px] font-bold text-app-fg-muted dark:text-app-fg-muted-dark uppercase tracking-wider">
                  Tương tác xã hội
                </Text>
                <AppCard className="rounded-3xl p-2">
                  <SettingItem
                    icon="at-outline"
                    iconColorClass="bg-purple-500/12 dark:bg-purple-400/18"
                    iconColor="#c084fc"
                    title="Lượt nhắc đến"
                    description="Khi ai đó nhắc đến bạn (@)"
                    value={prefs?.settings?.pushMentions ?? true}
                    onValueChange={(val) => handleToggle('pushMentions', val)}
                    disabled={isPending}
                  />
                  <View className="ml-14 h-px bg-app-border/70 dark:bg-app-border-dark/80" />
                  <SettingItem
                    icon="person-add-outline"
                    iconColorClass="bg-emerald-500/12 dark:bg-emerald-400/18"
                    iconColor="#34d399"
                    title="Lời mời kết bạn"
                    description="Khi có người muốn kết bạn"
                    value={prefs?.settings?.pushFriendRequests ?? true}
                    onValueChange={(val) => handleToggle('pushFriendRequests', val)}
                    disabled={isPending}
                  />
                </AppCard>
              </View>
              
              <View className="gap-2">
                <Text className="ml-2 text-[13px] font-bold text-app-fg-muted dark:text-app-fg-muted-dark uppercase tracking-wider">
                  Chế độ không làm phiền
                </Text>
                <AppCard className="rounded-3xl p-2">
                  <View>
                    <View className="flex-row items-center gap-3 rounded-2xl px-3 py-3">
                      <View className="h-9 w-9 items-center justify-center rounded-xl bg-rose-500/12 dark:bg-rose-400/18">
                        <Ionicons name="moon-outline" size={18} color="#f43f5e" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[15px] font-medium text-app-fg dark:text-app-fg-dark">
                          Không làm phiền
                        </Text>
                        <Text className="mt-0.5 text-[12px] text-app-muted-fg dark:text-app-muted-fg-dark">
                          Tạm dừng thông báo đẩy (trừ cuộc gọi)
                        </Text>
                      </View>
                      <Switch
                        isSelected={dndEnabled}
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
                    
                    {dndEnabled && (
                      <>
                        <View className="ml-14 h-px bg-app-border/70 dark:bg-app-border-dark/80" />
                        <Pressable 
                          className="flex-row items-center gap-3 rounded-2xl px-3 py-3 active:bg-sky-500/10 dark:active:bg-sky-400/15"
                          onPress={() => setIsDndSheetOpen(true)}
                        >
                          <View className="h-9 w-9 items-center justify-center rounded-xl bg-app-surface-elevated dark:bg-app-surface-elevated-dark">
                            <Ionicons name="time-outline" size={18} color="#64748b" />
                          </View>
                          <View className="flex-1">
                            <Text className="text-[15px] font-medium text-app-fg dark:text-app-fg-dark">
                              Khung giờ áp dụng
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-1">
                            <Text className="text-[13px] text-app-muted-fg dark:text-app-muted-fg-dark">
                              {dndFrom} - {dndTo}
                            </Text>
                            <Ionicons name="chevron-forward" size={16} color="#64748b" />
                          </View>
                        </Pressable>
                      </>
                    )}
                  </View>
                </AppCard>
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      <AppBottomSheet
        visible={isDndSheetOpen}
        onClose={() => setIsDndSheetOpen(false)}
        title="Khung giờ Không làm phiền"
        description="Chọn khoảng thời gian bạn muốn tạm dừng thông báo."
      >
        <View className="px-4 pb-8 pt-2">
          {[
            { label: 'Giờ ngủ đêm (22:00 - 07:00)', from: '22:00', to: '07:00' },
            { label: 'Giờ làm việc (08:00 - 17:00)', from: '08:00', to: '17:00' },
            { label: 'Giờ nghỉ trưa (12:00 - 13:30)', from: '12:00', to: '13:30' },
            { label: 'Buổi tối (20:00 - 00:00)', from: '20:00', to: '00:00' },
          ].map((option, index) => {
            const isSelected = dndFrom === option.from && dndTo === option.to;
            return (
              <Pressable
                key={index}
                onPress={() => handleDndTimeSelect(option.from, option.to)}
                className={`flex-row items-center gap-3 rounded-2xl px-3 py-3 mb-2 ${
                  isSelected ? 'bg-sky-500/10 dark:bg-sky-400/15' : 'active:bg-app-surface-elevated dark:active:bg-app-surface-elevated-dark'
                }`}
              >
                <View className={`h-10 w-10 items-center justify-center rounded-xl ${
                  isSelected ? 'bg-sky-500/20 dark:bg-sky-400/20' : 'bg-app-surface-elevated dark:bg-app-surface-elevated-dark'
                }`}>
                  <Ionicons name="time-outline" size={20} color={isSelected ? '#0ea5e9' : '#64748b'} />
                </View>
                <View className="flex-1">
                  <Text className={`text-[15px] font-medium ${isSelected ? 'text-sky-600 dark:text-sky-400' : 'text-app-fg dark:text-app-fg-dark'}`}>
                    {option.label}
                  </Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={22} color="#0ea5e9" />
                )}
              </Pressable>
            );
          })}
        </View>
      </AppBottomSheet>
    </>
  );
}

function SettingItem({
  icon,
  iconColorClass,
  iconColor,
  title,
  description,
  value,
  onValueChange,
  disabled
}: {
  icon: any;
  iconColorClass: string;
  iconColor: string;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View className="flex-row items-center gap-3 rounded-2xl px-3 py-3">
      <View className={`h-9 w-9 items-center justify-center rounded-xl ${iconColorClass}`}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-[15px] font-medium text-app-fg dark:text-app-fg-dark">
          {title}
        </Text>
        <Text className="mt-0.5 text-[12px] text-app-muted-fg dark:text-app-muted-fg-dark">
          {description}
        </Text>
      </View>
      <Switch
        isSelected={value}
        onSelectedChange={onValueChange}
        isDisabled={disabled}
      />
    </View>
  );
}
