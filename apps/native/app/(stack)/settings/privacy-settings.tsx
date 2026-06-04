import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBottomSheet } from '~/components/ui/app-bottom-sheet';
import { AppCard } from '~/components/ui/app-card';
import { AppBackButton, AppHeader } from '~/components/ui/app-header';
import {
  useCurrentUser,
  useUpdateProfile,
  PrivacyLevel,
  MessagePrivacy,
  type UserPrivacySettings,
} from '@repo/shared';

type SettingType = keyof UserPrivacySettings;

export default function PrivacySettingsScreen() {
  const insets = useSafeAreaInsets();
  const { data: currentUser } = useCurrentUser();
  const updateProfile = useUpdateProfile();

  const [activeSheet, setActiveSheet] = useState<SettingType | null>(null);

  const privacySettings = currentUser?.privacySettings || {
    profileVisibility: PrivacyLevel.PUBLIC,
    friendListVisibility: PrivacyLevel.PUBLIC,
    messagePrivacy: MessagePrivacy.EVERYONE,
  };

  const handleUpdateSetting = (key: SettingType, value: any) => {
    // Optimistic update fired by hook
    updateProfile.mutate({
      privacySettings: {
        ...privacySettings,
        [key]: value,
      },
    });
    setActiveSheet(null);
  };

  const renderOption = (
    label: string,
    description: string,
    icon: any,
    isSelected: boolean,
    onSelect: () => void,
  ) => (
    <Pressable
      onPress={onSelect}
      className={`flex-row items-center gap-3 rounded-2xl px-3 py-3 mb-2 ${
        isSelected
          ? 'bg-sky-500/10 dark:bg-sky-400/15'
          : 'active:bg-app-surface-elevated dark:active:bg-app-surface-elevated-dark'
      }`}
    >
      <View
        className={`h-10 w-10 items-center justify-center rounded-xl ${
          isSelected
            ? 'bg-sky-500/20 dark:bg-sky-400/20'
            : 'bg-app-surface-elevated dark:bg-app-surface-elevated-dark'
        }`}
      >
        <Ionicons
          name={icon}
          size={20}
          color={isSelected ? '#0ea5e9' : '#64748b'}
        />
      </View>
      <View className="flex-1">
        <Text
          className={`text-[15px] font-medium ${isSelected ? 'text-sky-600 dark:text-sky-400' : 'text-app-fg dark:text-app-fg-dark'}`}
        >
          {label}
        </Text>
        <Text className="mt-0.5 text-[12px] text-app-muted-fg dark:text-app-muted-fg-dark">
          {description}
        </Text>
      </View>
      {isSelected && (
        <Ionicons name="checkmark-circle" size={22} color="#0ea5e9" />
      )}
    </Pressable>
  );

  return (
    <>
      <View className="flex-1 bg-app-bg dark:bg-app-bg-dark">
        <AppHeader
          leading={<AppBackButton />}
          title="Quyền riêng tư"
          variant="default"
        />
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
              <Pressable
                className="flex-row items-center gap-3 rounded-2xl px-3 py-3 active:bg-sky-500/10 dark:active:bg-sky-400/15"
                onPress={() => setActiveSheet('profileVisibility')}
              >
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/12 dark:bg-indigo-400/18">
                  <Ionicons
                    name="person-circle-outline"
                    size={18}
                    color="#818cf8"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-medium text-app-fg dark:text-app-fg-dark">
                    Hồ sơ cá nhân
                  </Text>
                  <Text className="mt-0.5 text-[13px] text-app-muted-fg dark:text-app-muted-fg-dark">
                    Ai có thể xem hồ sơ của bạn
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Text className="text-[13px] text-app-muted-fg dark:text-app-muted-fg-dark">
                    {privacySettings.profileVisibility === PrivacyLevel.PUBLIC
                      ? 'Công khai'
                      : privacySettings.profileVisibility ===
                          PrivacyLevel.FRIENDS
                        ? 'Bạn bè'
                        : 'Chỉ mình tôi'}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#64748b" />
                </View>
              </Pressable>
              <View className="ml-14 h-px bg-app-border/70 dark:bg-app-border-dark/80" />
            </View>

            <View>
              <Pressable
                className="flex-row items-center gap-3 rounded-2xl px-3 py-3 active:bg-sky-500/10 dark:active:bg-sky-400/15"
                onPress={() => setActiveSheet('friendListVisibility')}
              >
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/12 dark:bg-emerald-400/18">
                  <Ionicons name="people-outline" size={18} color="#34d399" />
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-medium text-app-fg dark:text-app-fg-dark">
                    Danh sách bạn bè
                  </Text>
                  <Text className="mt-0.5 text-[13px] text-app-muted-fg dark:text-app-muted-fg-dark">
                    Ai có thể xem danh sách bạn bè
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Text className="text-[13px] text-app-muted-fg dark:text-app-muted-fg-dark">
                    {privacySettings.friendListVisibility ===
                    PrivacyLevel.PUBLIC
                      ? 'Công khai'
                      : privacySettings.friendListVisibility ===
                          PrivacyLevel.FRIENDS
                        ? 'Bạn bè'
                        : 'Chỉ mình tôi'}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#64748b" />
                </View>
              </Pressable>
              <View className="ml-14 h-px bg-app-border/70 dark:bg-app-border-dark/80" />
            </View>

            <View>
              <Pressable
                className="flex-row items-center gap-3 rounded-2xl px-3 py-3 active:bg-sky-500/10 dark:active:bg-sky-400/15"
                onPress={() => setActiveSheet('messagePrivacy')}
              >
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-pink-500/12 dark:bg-pink-400/18">
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={18}
                    color="#f472b6"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-medium text-app-fg dark:text-app-fg-dark">
                    Nhắn tin
                  </Text>
                  <Text className="mt-0.5 text-[13px] text-app-muted-fg dark:text-app-muted-fg-dark">
                    Ai có thể gửi tin nhắn cho bạn
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Text className="text-[13px] text-app-muted-fg dark:text-app-muted-fg-dark">
                    {privacySettings.messagePrivacy === MessagePrivacy.EVERYONE
                      ? 'Mọi người'
                      : 'Chỉ bạn bè'}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#64748b" />
                </View>
              </Pressable>
            </View>
          </AppCard>
        </ScrollView>
      </View>

      <AppBottomSheet
        visible={activeSheet === 'profileVisibility'}
        onClose={() => setActiveSheet(null)}
        title="Hồ sơ cá nhân"
        description="Chọn đối tượng có thể xem chi tiết hồ sơ cá nhân của bạn trên trang cá nhân."
      >
        <View className="px-4 pb-8 pt-2">
          {renderOption(
            'Công khai',
            'Bất kỳ ai cũng có thể xem hồ sơ của bạn',
            'globe-outline',
            privacySettings.profileVisibility === PrivacyLevel.PUBLIC,
            () => handleUpdateSetting('profileVisibility', PrivacyLevel.PUBLIC),
          )}
          {renderOption(
            'Bạn bè',
            'Chỉ bạn bè của bạn mới có thể xem',
            'people-outline',
            privacySettings.profileVisibility === PrivacyLevel.FRIENDS,
            () =>
              handleUpdateSetting('profileVisibility', PrivacyLevel.FRIENDS),
          )}
          {renderOption(
            'Chỉ mình tôi',
            'Người khác sẽ thấy hồ sơ bị khoá',
            'lock-closed-outline',
            privacySettings.profileVisibility === PrivacyLevel.PRIVATE,
            () =>
              handleUpdateSetting('profileVisibility', PrivacyLevel.PRIVATE),
          )}
        </View>
      </AppBottomSheet>

      <AppBottomSheet
        visible={activeSheet === 'friendListVisibility'}
        onClose={() => setActiveSheet(null)}
        title="Danh sách bạn bè"
        description="Chọn ai có thể xem toàn bộ danh sách bạn bè của bạn. (Vẫn hiển thị bạn chung)"
      >
        <View className="px-4 pb-8 pt-2">
          {renderOption(
            'Công khai',
            'Bất kỳ ai trên ứng dụng',
            'globe-outline',
            privacySettings.friendListVisibility === PrivacyLevel.PUBLIC,
            () =>
              handleUpdateSetting('friendListVisibility', PrivacyLevel.PUBLIC),
          )}
          {renderOption(
            'Bạn bè',
            'Chỉ bạn bè của bạn mới có thể xem',
            'people-outline',
            privacySettings.friendListVisibility === PrivacyLevel.FRIENDS,
            () =>
              handleUpdateSetting('friendListVisibility', PrivacyLevel.FRIENDS),
          )}
          {renderOption(
            'Chỉ mình tôi',
            'Không ai khác thấy được danh sách này',
            'lock-closed-outline',
            privacySettings.friendListVisibility === PrivacyLevel.PRIVATE,
            () =>
              handleUpdateSetting('friendListVisibility', PrivacyLevel.PRIVATE),
          )}
        </View>
      </AppBottomSheet>

      <AppBottomSheet
        visible={activeSheet === 'messagePrivacy'}
        onClose={() => setActiveSheet(null)}
        title="Gửi tin nhắn"
        description="Chọn ai có thể bắt đầu cuộc trò chuyện mới với bạn."
      >
        <View className="px-4 pb-8 pt-2">
          {renderOption(
            'Mọi người',
            'Ai cũng có thể nhắn tin cho bạn',
            'globe-outline',
            privacySettings.messagePrivacy === MessagePrivacy.EVERYONE,
            () =>
              handleUpdateSetting('messagePrivacy', MessagePrivacy.EVERYONE),
          )}
          {renderOption(
            'Chỉ bạn bè',
            'Chỉ nhận tin nhắn từ bạn bè',
            'people-outline',
            privacySettings.messagePrivacy === MessagePrivacy.FRIENDS,
            () => handleUpdateSetting('messagePrivacy', MessagePrivacy.FRIENDS),
          )}
        </View>
      </AppBottomSheet>
    </>
  );
}
